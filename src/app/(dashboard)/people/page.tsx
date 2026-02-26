import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Users } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PeopleSearchInput } from '@/components/features/people/people-search-input';
import { PeopleFilters } from '@/components/features/people/people-filters';

// Source badge colors
const sourceColors: Record<string, string> = {
  linkedin: 'bg-blue-100 text-blue-800',
  referral: 'bg-green-100 text-green-800',
  job_board: 'bg-purple-100 text-purple-800',
  direct: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

const sourceLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  referral: 'Referido',
  job_board: 'Portal Empleo',
  direct: 'Directo',
  other: 'Otro',
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

interface PeoplePageProps {
  searchParams: Promise<{ q?: string; status?: string; position?: string }>;
}

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const { q, status, position } = await searchParams;
  const supabase = await createClient();

  // Get current user profile (for manager role check)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', user!.id)
    .single();

  const isManager = currentProfile?.role === 'manager';
  const managerId = currentProfile?.id;

  // Parse filter params
  const selectedStatuses = status ? status.split(',').filter(Boolean) : [];
  const selectedPosition = position?.trim() || undefined;

  // ── Step 1: Resolve person_id set from position/manager filter ────────────
  let filteredPersonIds: string[] | null = null;
  let managerHasNoVacancies = false;

  if (isManager && managerId) {
    // Manager always sees only their candidates
    const { data: managerPositions } = await supabase
      .from('positions')
      .select('id')
      .eq('hiring_manager_id', managerId)
      .eq('status', 'open');

    const managerPositionIds = managerPositions?.map(p => p.id) ?? [];

    if (managerPositionIds.length === 0) {
      managerHasNoVacancies = true;
      filteredPersonIds = [];
    } else {
      // If manager also has a position filter, intersect with their positions
      const positionIds =
        selectedPosition && managerPositionIds.includes(selectedPosition)
          ? [selectedPosition]
          : selectedPosition
            ? [] // selected position doesn't belong to manager
            : managerPositionIds;

      if (positionIds.length === 0) {
        filteredPersonIds = [];
      } else {
        const { data: pp } = await supabase
          .from('person_positions')
          .select('person_id')
          .in('position_id', positionIds);
        filteredPersonIds = [...new Set(pp?.map(p => p.person_id) ?? [])];
      }
    }
  } else if (selectedPosition) {
    // Non-manager: filter by specific vacancy
    const { data: pp } = await supabase
      .from('person_positions')
      .select('person_id')
      .eq('position_id', selectedPosition);
    filteredPersonIds = [...new Set(pp?.map(p => p.person_id) ?? [])];
  }

  // ── Step 2: Build main people query ──────────────────────────────────────
  let query = supabase
    .from('people')
    .select(
      `
      *,
      person_positions (
        stage,
        positions (
          id,
          title
        )
      )
    `
    )
    .order('created_at', { ascending: false });

  // Text search (name, email, phone) — PH-32
  if (q?.trim()) {
    const term = q.trim();
    // Normalize phone search: strip non-digit chars for comparison
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
    );
  }

  // Person IDs filter (vacancy / manager)
  if (filteredPersonIds !== null) {
    if (filteredPersonIds.length === 0) {
      // Short-circuit: no results possible
    } else {
      query = query.in('id', filteredPersonIds);
    }
  }

  // ── Step 3: Parallel fetch — status options + positions list ─────────────
  const [peopleResult, statusDefsResult, positionsResult, latestStatusesResult] = await Promise.all(
    [
      filteredPersonIds?.length === 0 ? Promise.resolve({ data: [], error: null }) : query,

      supabase
        .from('status_definitions')
        .select('id, status_value, label, color')
        .eq('is_active', true)
        .order('order_index'),

      isManager && managerId
        ? // Manager: only see their vacancies in the dropdown
          supabase
            .from('positions')
            .select('id, title')
            .eq('hiring_manager_id', managerId)
            .eq('status', 'open')
            .order('title')
        : supabase.from('positions').select('id, title').eq('status', 'open').order('title'),

      // Latest status per person (ordered DESC → first per person_id = latest)
      supabase
        .from('person_statuses')
        .select(
          'person_id, status_definition_id, created_at, status_definitions(status_value, label, color)'
        )
        .order('created_at', { ascending: false }),
    ]
  );

  // Build latest status lookup map
  const latestStatusByPerson = new Map<
    string,
    { status_value: string; label: string; color: string } | null
  >();
  latestStatusesResult.data?.forEach(s => {
    if (!latestStatusByPerson.has(s.person_id)) {
      const sd = s.status_definitions as {
        status_value: string;
        label: string;
        color: string;
      } | null;
      latestStatusByPerson.set(s.person_id, sd);
    }
  });

  // ── Step 4: Apply status filter (post-fetch) — PH-33 ─────────────────────
  let people = (peopleResult.data ?? []).map(p => ({
    ...p,
    currentStatus: latestStatusByPerson.get(p.id) ?? null,
  }));

  if (selectedStatuses.length > 0) {
    people = people.filter(
      p => p.currentStatus && selectedStatuses.includes(p.currentStatus.status_value)
    );
  }

  const totalCount = people.length;
  const hasFilters = !!q?.trim() || selectedStatuses.length > 0 || !!selectedPosition;

  const statusDefs = statusDefsResult.data ?? [];
  const positions = positionsResult.data ?? [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personas</h1>
          <p className="text-muted-foreground">Gestiona candidatos, empleados y contactos</p>
        </div>
        <Button asChild>
          <Link href="/people/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Persona
          </Link>
        </Button>
      </div>

      {/* Manager indicator — PH-35 */}
      {isManager && (
        <div
          className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
          data-testid="my-candidates-indicator"
        >
          <Users className="h-4 w-4" />
          <span>Mostrando solo candidatos de tus vacantes</span>
        </div>
      )}

      {/* Search + Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <PeopleSearchInput defaultValue={q} />
            <PeopleFilters
              statusDefs={statusDefs}
              positions={positions}
              selectedStatuses={selectedStatuses}
              selectedPosition={selectedPosition}
              currentQ={q}
              isManager={isManager}
            />
          </div>
        </CardContent>
      </Card>

      {/* People table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Personas</CardTitle>
          <CardDescription data-testid="search-results-count">
            {hasFilters
              ? `${totalCount} resultado${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`
              : `${totalCount} persona${totalCount !== 1 ? 's' : ''} registrada${totalCount !== 1 ? 's' : ''} en el sistema`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {people.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Empresa Actual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Vacante Activa</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map(person => {
                  const activePosition = person.person_positions?.find(
                    (pp: { stage: string; positions: { id: string; title: string } | null }) =>
                      pp.stage !== 'hired' && pp.stage !== 'rejected' && pp.positions
                  );

                  return (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(person.first_name, person.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/people/${person.id}`}
                              className="font-medium hover:underline"
                            >
                              {person.first_name} {person.last_name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{person.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{person.current_company || '-'}</p>
                          <p className="text-sm text-muted-foreground">
                            {person.current_position || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {person.currentStatus ? (
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${person.currentStatus.color}1a`,
                              borderColor: `${person.currentStatus.color}40`,
                              color: person.currentStatus.color,
                            }}
                          >
                            {person.currentStatus.label}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {person.source && (
                          <Badge variant="secondary" className={sourceColors[person.source]}>
                            {sourceLabels[person.source] || person.source}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {activePosition?.positions ? (
                          <Link
                            href={`/positions/${activePosition.positions.id}`}
                            className="text-sm hover:underline"
                          >
                            {activePosition.positions.title}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(person.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/people/${person.id}`}>Ver perfil</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/people/${person.id}/edit`}>Editar</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-testid="search-no-results"
            >
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              {managerHasNoVacancies ? (
                <>
                  <h3 className="text-lg font-semibold" data-testid="empty-state-no-candidates">
                    No tienes vacantes asignadas
                  </h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Cuando RR.HH. te asigne vacantes, los candidatos aparecerán aquí
                  </p>
                </>
              ) : hasFilters ? (
                <>
                  <h3 className="text-lg font-semibold">Sin resultados</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    No se encontraron personas con los filtros aplicados
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/people">Limpiar filtros</Link>
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">No hay personas registradas</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Comienza agregando tu primera persona al sistema
                  </p>
                  <Button asChild>
                    <Link href="/people/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Persona
                    </Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
