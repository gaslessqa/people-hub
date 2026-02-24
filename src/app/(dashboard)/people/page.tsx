import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';

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
  searchParams: Promise<{ q?: string }>;
}

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();

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

  if (q?.trim()) {
    const term = q.trim();
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,current_company.ilike.%${term}%`
    );
  }

  const { data: people, error } = await query;

  if (error) {
    console.error('Error fetching people:', error);
  }

  const totalCount = people?.length ?? 0;

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

      {/* Search + Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <PeopleSearchInput defaultValue={q} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Personas</CardTitle>
          <CardDescription>
            {q?.trim()
              ? `${totalCount} resultado${totalCount !== 1 ? 's' : ''} para "${q}"`
              : `${totalCount} persona${totalCount !== 1 ? 's' : ''} registrada${totalCount !== 1 ? 's' : ''} en el sistema`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {people && people.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Empresa Actual</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Vacante Activa</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map(person => {
                  // Get active position (not hired/rejected)
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
                            <DropdownMenuItem>Agregar a vacante</DropdownMenuItem>
                            <DropdownMenuItem>Agregar nota</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              {q?.trim() ? (
                <>
                  <h3 className="text-lg font-semibold">Sin resultados</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    No se encontraron personas para &quot;{q}&quot;
                  </p>
                  <Button asChild>
                    <Link href="/people/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear &quot;{q}&quot; como nueva persona
                    </Link>
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
