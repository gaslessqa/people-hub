import { Users, Briefcase, UserCheck, Clock } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Stats card component
function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '+' : ''}
            {trend.value}% vs mes anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Pipeline stage badge colors
const stageColors: Record<string, string> = {
  applied: 'bg-gray-100 text-gray-800',
  screening: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-yellow-100 text-yellow-800',
  finalist: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  hired: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

const stageLabels: Record<string, string> = {
  applied: 'Aplicado',
  screening: 'Screening',
  interviewing: 'Entrevistas',
  finalist: 'Finalista',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch stats
  const [
    { count: totalPeople },
    { count: totalPositions },
    { data: openPositions },
    { data: recentPeople },
    { data: pipelineData },
  ] = await Promise.all([
    supabase.from('people').select('*', { count: 'exact', head: true }),
    supabase.from('positions').select('*', { count: 'exact', head: true }),
    supabase.from('positions').select('*').eq('status', 'open'),
    supabase
      .from('people')
      .select('id, first_name, last_name, email, current_company, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('person_positions')
      .select('stage, position_id')
      .not('stage', 'in', '(hired,rejected)'),
  ]);

  // Calculate pipeline counts
  const pipelineCounts = (pipelineData || []).reduce(
    (acc, item) => {
      acc[item.stage] = (acc[item.stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Active candidates (not hired or rejected)
  const activeCandidates = Object.values(pipelineCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de People Hub</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Personas"
          value={totalPeople || 0}
          description="Candidatos y empleados registrados"
          icon={Users}
        />
        <StatsCard
          title="Vacantes Abiertas"
          value={openPositions?.length || 0}
          description={`de ${totalPositions || 0} vacantes totales`}
          icon={Briefcase}
        />
        <StatsCard
          title="Candidatos Activos"
          value={activeCandidates}
          description="En proceso de selección"
          icon={UserCheck}
        />
        <StatsCard
          title="Tiempo Promedio"
          value="18 días"
          description="Para cerrar una vacante"
          icon={Clock}
        />
      </div>

      {/* Pipeline and recent activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pipeline overview */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Candidatos</CardTitle>
            <CardDescription>Distribución actual por etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['applied', 'screening', 'interviewing', 'finalist', 'offer'].map(stage => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={stageColors[stage]}>
                      {stageLabels[stage]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{pipelineCounts[stage] || 0}</span>
                    <span className="text-muted-foreground text-sm">candidatos</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent people */}
        <Card>
          <CardHeader>
            <CardTitle>Personas Recientes</CardTitle>
            <CardDescription>Últimas personas agregadas al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPeople && recentPeople.length > 0 ? (
                recentPeople.map(person => (
                  <div key={person.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {person.first_name} {person.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {person.current_company || person.email}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(person.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No hay personas registradas aún.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open positions */}
      <Card>
        <CardHeader>
          <CardTitle>Vacantes Abiertas</CardTitle>
          <CardDescription>Posiciones actualmente en búsqueda</CardDescription>
        </CardHeader>
        <CardContent>
          {openPositions && openPositions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {openPositions.map(position => (
                <Card key={position.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{position.title}</CardTitle>
                    <CardDescription>{position.department}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{position.location}</span>
                      <Badge variant={position.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {position.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No hay vacantes abiertas actualmente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
