import Link from 'next/link';
import { Plus, Search, Filter, Briefcase, Users, MapPin, DollarSign } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Status colors and labels
const statusStyles: Record<string, { bg: string; label: string }> = {
  open: { bg: 'bg-green-100 text-green-800', label: 'Abierta' },
  on_hold: { bg: 'bg-yellow-100 text-yellow-800', label: 'En Pausa' },
  closed: { bg: 'bg-gray-100 text-gray-800', label: 'Cerrada' },
};

const priorityStyles: Record<string, { bg: string; label: string }> = {
  urgent: { bg: 'bg-red-100 text-red-800', label: 'Urgente' },
  high: { bg: 'bg-orange-100 text-orange-800', label: 'Alta' },
  medium: { bg: 'bg-blue-100 text-blue-800', label: 'Media' },
  low: { bg: 'bg-gray-100 text-gray-800', label: 'Baja' },
};

const employmentTypeLabels: Record<string, string> = {
  full_time: 'Tiempo Completo',
  part_time: 'Medio Tiempo',
  contract: 'Contrato',
  internship: 'Pasantía',
};

// Type for position with relations
interface PositionWithRelations {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  status: string;
  priority: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  hiring_manager: { id: string; full_name: string } | null;
  recruiter: { id: string; full_name: string } | null;
  person_positions: { id: string; stage: string }[] | null;
}

export default async function PositionsPage() {
  const supabase = await createClient();

  // Fetch positions with candidate counts
  const { data: positions, error } = await supabase
    .from('positions')
    .select(
      `
      *,
      hiring_manager:profiles!positions_hiring_manager_id_fkey (
        id,
        full_name
      ),
      recruiter:profiles!positions_recruiter_id_fkey (
        id,
        full_name
      ),
      person_positions (
        id,
        stage
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching positions:', error);
  }

  // Group positions by status
  const openPositions = positions?.filter(p => p.status === 'open') || [];
  const onHoldPositions = positions?.filter(p => p.status === 'on_hold') || [];
  const closedPositions = positions?.filter(p => p.status === 'closed') || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vacantes</h1>
          <p className="text-muted-foreground">
            Gestiona las posiciones abiertas y el pipeline de candidatos
          </p>
        </div>
        <Button asChild>
          <Link href="/positions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Vacante
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacantes Abiertas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openPositions.length}</div>
            <p className="text-xs text-muted-foreground">activamente buscando candidatos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Pausa</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onHoldPositions.length}</div>
            <p className="text-xs text-muted-foreground">temporalmente pausadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedPositions.length}</div>
            <p className="text-xs text-muted-foreground">completadas o canceladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por título, departamento..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions grid */}
      <div className="space-y-6">
        {/* Open positions */}
        {openPositions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {openPositions.length}
              </Badge>
              Vacantes Abiertas
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {openPositions.map(position => (
                <PositionCard key={position.id} position={position} />
              ))}
            </div>
          </div>
        )}

        {/* On hold positions */}
        {onHoldPositions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {onHoldPositions.length}
              </Badge>
              Vacantes en Pausa
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {onHoldPositions.map(position => (
                <PositionCard key={position.id} position={position} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {positions?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No hay vacantes</h3>
              <p className="text-muted-foreground mt-1 mb-4">Comienza creando tu primera vacante</p>
              <Button asChild>
                <Link href="/positions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Vacante
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Position card component
function PositionCard({ position }: { position: PositionWithRelations }) {
  const activeCandidates =
    position.person_positions?.filter(
      (pp: { stage: string }) => pp.stage !== 'hired' && pp.stage !== 'rejected'
    ).length || 0;

  const status = statusStyles[position.status] || statusStyles.open;
  const priority = priorityStyles[position.priority] || priorityStyles.medium;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/positions/${position.id}`}>
              <CardTitle className="text-base hover:underline">{position.title}</CardTitle>
            </Link>
            <CardDescription>{position.department}</CardDescription>
          </div>
          <Badge variant="secondary" className={priority.bg}>
            {priority.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {position.location || 'Remoto'}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {activeCandidates} candidatos
          </span>
        </div>

        {(position.salary_min || position.salary_max) && (
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {position.salary_min?.toLocaleString() || '?'} -{' '}
              {position.salary_max?.toLocaleString() || '?'} {position.salary_currency || 'USD'}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {employmentTypeLabels[position.employment_type] || position.employment_type}
          </span>
          <Badge variant="secondary" className={status.bg}>
            {status.label}
          </Badge>
        </div>

        {position.recruiter && (
          <div className="text-xs text-muted-foreground">
            Recruiter: {position.recruiter.full_name}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
