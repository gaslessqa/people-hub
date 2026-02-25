import Link from 'next/link';
import { Briefcase, MapPin, Users, DollarSign } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface PositionWithCount {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  status: string;
  priority: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  created_at: string;
  person_positions: { id: string; stage: string }[] | null;
}

export default async function MyVacanciesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let positions: PositionWithCount[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profile) {
      let query = supabase
        .from('positions')
        .select(
          `
          id,
          title,
          department,
          location,
          status,
          priority,
          salary_min,
          salary_max,
          salary_currency,
          created_at,
          person_positions (
            id,
            stage
          )
        `
        )
        .order('created_at', { ascending: false });

      if (profile.role === 'manager') {
        query = query.eq('hiring_manager_id', profile.id);
      }

      const { data } = await query;
      positions = (data ?? []) as PositionWithCount[];
    }
  }

  const openCount = positions.filter(p => p.status === 'open').length;
  const onHoldCount = positions.filter(p => p.status === 'on_hold').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Vacantes</h1>
        <p className="text-muted-foreground">
          Vacantes que tienes asignadas como manager o recruiter
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Pausa</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onHoldCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Positions grid */}
      {positions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No tienes vacantes asignadas</h3>
            <p className="text-muted-foreground mt-1">
              Las vacantes donde seas manager aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positions.map(position => {
            const personPositions = position.person_positions ?? [];
            const activeCandidates = personPositions.filter(
              pp => pp.stage !== 'hired' && pp.stage !== 'rejected'
            ).length;
            const status = statusStyles[position.status] ?? statusStyles.open;
            const priority = priorityStyles[position.priority ?? 'medium'] ?? priorityStyles.medium;

            return (
              <Card key={position.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/positions/${position.id}`}>
                        <CardTitle className="text-base hover:underline truncate">
                          {position.title}
                        </CardTitle>
                      </Link>
                      {position.department && (
                        <CardDescription>{position.department}</CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className={priority.bg}>
                      {priority.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {position.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {position.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {activeCandidates} candidatos
                    </span>
                  </div>

                  {(position.salary_min || position.salary_max) && (
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {position.salary_min?.toLocaleString() ?? '?'} –{' '}
                        {position.salary_max?.toLocaleString() ?? '?'}{' '}
                        {position.salary_currency ?? 'USD'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {new Date(position.created_at).toLocaleDateString('es-ES')}
                    </span>
                    <Badge variant="secondary" className={status.bg}>
                      {status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
