import { Users, Briefcase, UserCheck, Clock, CalendarDays, Gift, FileCheck } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PeriodFilter } from '@/components/features/dashboard/period-filter';
import { DashboardRefresh } from '@/components/features/dashboard/dashboard-refresh';
import {
  PipelineFunnelChart,
  type PipelineStageData,
} from '@/components/features/dashboard/pipeline-funnel-chart';
import { TTHChart, type StageBreakdownItem } from '@/components/features/dashboard/tth-chart';

// ─── Constants ──────────────────────────────────────────────────────────────

const PIPELINE_STAGES = ['applied', 'screening', 'interviewing', 'finalist', 'offer'] as const;

const STAGE_LABELS: Record<string, string> = {
  applied: 'Aplicado',
  screening: 'Screening',
  interviewing: 'Entrevistas',
  finalist: 'Finalista',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado',
};

const STAGE_COLORS: Record<string, string> = {
  applied: '#94a3b8',
  screening: '#60a5fa',
  interviewing: '#fbbf24',
  finalist: '#a78bfa',
  offer: '#34d399',
  hired: '#10b981',
};

// ─── Helper components ──────────────────────────────────────────────────────

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  testId,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  testId?: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// ─── Page props ──────────────────────────────────────────────────────────────

interface DashboardPageProps {
  searchParams: Promise<{ period?: string; vacancy?: string }>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { period: periodStr, vacancy: vacancyFilter } = await searchParams;
  const period = parseInt(periodStr ?? '30', 10) || 30;
  const startDate = period > 0 ? new Date(Date.now() - period * 86_400_000) : null;

  const supabase = await createClient();

  // Get current user + profile (role)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = user
    ? await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('auth_user_id', user.id)
        .single()
    : { data: null };

  const role = currentProfile?.role ?? 'recruiter';
  const isHrAdmin = role === 'hr_admin' || role === 'super_admin';
  const isManager = role === 'manager';

  // ── Base queries (all roles) ──────────────────────────────────────────────

  const [
    { count: totalPeople },
    { data: openPositions },
    { data: pipelineData },
    { data: recentPeople },
  ] = await Promise.all([
    supabase.from('people').select('*', { count: 'exact', head: true }),
    supabase.from('positions').select('*').eq('status', 'open'),
    supabase
      .from('person_positions')
      .select('stage, position_id, person_id')
      .not('stage', 'in', '(hired,rejected)'),
    supabase
      .from('people')
      .select('id, first_name, last_name, email, current_company, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Pipeline counts for base cards
  const pipelineCounts = (pipelineData || []).reduce(
    (acc, item) => {
      acc[item.stage] = (acc[item.stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const activeCandidates = Object.values(pipelineCounts).reduce((a, b) => a + b, 0);
  const openVacancies = openPositions?.length ?? 0;

  // ── HR Admin extra queries ────────────────────────────────────────────────

  let interviewsThisWeek = 0;
  let offersPending = 0;
  let hiresInPeriod = 0;
  let avgTTH: number | null = null;
  let stageBreakdown: StageBreakdownItem[] = [];
  let pipelineChartData: PipelineStageData[] = [];

  if (isHrAdmin) {
    // Fetch all statuses with definitions (ASC for TTH calculation)
    const { data: allStatuses } = await supabase
      .from('person_statuses')
      .select('person_id, created_at, status_definitions(status_value)')
      .order('created_at', { ascending: true });

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Latest-status map: person_id → status_value
    // (allStatuses is ASC, so iterate and overwrite → last = latest)
    const latestStatusMap = new Map<string, string>();
    for (const s of allStatuses ?? []) {
      const val = (s.status_definitions as { status_value: string } | null)?.status_value;
      if (val) latestStatusMap.set(s.person_id, val);
    }

    // Count offers pending (latest status = offer)
    for (const v of latestStatusMap.values()) {
      if (v === 'offer') offersPending++;
    }

    // Interviews this week
    for (const s of allStatuses ?? []) {
      const val = (s.status_definitions as { status_value: string } | null)?.status_value;
      if (val === 'interviewing' && new Date(s.created_at) >= startOfWeek) {
        interviewsThisWeek++;
      }
    }

    // Hires in period (and TTH calculation)
    // Group statuses by person_id
    const byPerson = new Map<string, Array<{ created_at: string; status_value: string }>>();
    for (const s of allStatuses ?? []) {
      const val = (s.status_definitions as { status_value: string } | null)?.status_value;
      if (!val) continue;
      if (!byPerson.has(s.person_id)) byPerson.set(s.person_id, []);
      byPerson.get(s.person_id)!.push({ created_at: s.created_at, status_value: val });
    }

    // TTH: for persons who reached 'hired'
    // Optional: filter by vacancyFilter
    let vacancyPersonIds: Set<string> | null = null;
    if (vacancyFilter) {
      const { data: vCandidates } = await supabase
        .from('person_positions')
        .select('person_id')
        .eq('position_id', vacancyFilter);
      vacancyPersonIds = new Set((vCandidates ?? []).map(c => c.person_id));
    }

    const tthValues: number[] = [];
    // stage transition times: map stageFrom → [days]
    const stageTimes = new Map<string, number[]>();

    for (const [personId, statuses] of byPerson.entries()) {
      if (vacancyPersonIds && !vacancyPersonIds.has(personId)) continue;

      const hiredEntry = statuses.find(s => s.status_value === 'hired');
      if (!hiredEntry) continue;

      const hiredAt = new Date(hiredEntry.created_at);
      if (startDate && hiredAt < startDate) continue;

      hiresInPeriod++;

      const firstAt = new Date(statuses[0].created_at);
      const days = Math.round((hiredAt.getTime() - firstAt.getTime()) / 86_400_000);
      tthValues.push(days);

      // Stage transition times
      for (let i = 1; i < statuses.length; i++) {
        const prev = statuses[i - 1];
        const curr = statuses[i];
        const delta = Math.round(
          (new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()) / 86_400_000
        );
        if (!stageTimes.has(prev.status_value)) stageTimes.set(prev.status_value, []);
        stageTimes.get(prev.status_value)!.push(delta);
      }
    }

    if (tthValues.length > 0) {
      avgTTH = Math.round(tthValues.reduce((a, b) => a + b, 0) / tthValues.length);
    }

    // Stage breakdown
    const orderedStages = ['lead', 'applied', 'screening', 'interviewing', 'finalist', 'offer'];
    stageBreakdown = orderedStages
      .filter(s => stageTimes.has(s))
      .map(s => {
        const times = stageTimes.get(s)!;
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        return { label: STAGE_LABELS[s] ?? s, avgDays: avg };
      });

    // Pipeline chart data (based on person_positions active stage counts)
    pipelineChartData = PIPELINE_STAGES.map(stage => ({
      stage,
      label: STAGE_LABELS[stage],
      count: pipelineCounts[stage] ?? 0,
      color: STAGE_COLORS[stage],
    }));
  }

  // ── Recruiter workload ────────────────────────────────────────────────────

  const workloadCounts: Record<string, number> = {};
  let myCandidateCount = 0;
  let myCandidates: Array<{ id: string }> = [];

  if (role === 'recruiter' && currentProfile?.id) {
    const { data: myCandidateRows } = await supabase
      .from('people')
      .select('id')
      .eq('created_by', currentProfile.id);

    myCandidates = myCandidateRows ?? [];
    myCandidateCount = myCandidates.length;

    if (myCandidateCount > 0) {
      const myCandidateIds = myCandidates.map(c => c.id);

      const { data: myCandidateStatuses } = await supabase
        .from('person_statuses')
        .select('person_id, status_definitions(status_value, label)')
        .in('person_id', myCandidateIds)
        .order('created_at', { ascending: false });

      // Latest status per my candidate
      const myLatestStatus = new Map<string, string>();
      for (const s of myCandidateStatuses ?? []) {
        if (!myLatestStatus.has(s.person_id)) {
          const val = (s.status_definitions as { status_value: string } | null)?.status_value;
          if (val) myLatestStatus.set(s.person_id, val);
        }
      }

      // Count per stage
      for (const v of myLatestStatus.values()) {
        workloadCounts[v] = (workloadCounts[v] || 0) + 1;
      }
    }
  }

  // ── Vacancy options for TTH filter ────────────────────────────────────────

  const vacancyOptions = isHrAdmin
    ? (openPositions ?? []).map(p => ({ id: p.id, title: p.title }))
    : [];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de People Hub</p>
        </div>
        {isHrAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <PeriodFilter currentPeriod={period} />
            <DashboardRefresh />
          </div>
        )}
      </div>

      {/* ── HR Admin / Super Admin view ─────────────────────────────────── */}
      {isHrAdmin && (
        <>
          {/* 5 KPI cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatsCard
              title="Vacantes Abiertas"
              value={openVacancies}
              description="Posiciones en búsqueda activa"
              icon={Briefcase}
              testId="dashboard-kpi-open-vacancies"
            />
            <StatsCard
              title="Candidatos Activos"
              value={activeCandidates}
              description="En proceso de selección"
              icon={UserCheck}
              testId="dashboard-kpi-active-candidates"
            />
            <StatsCard
              title="Entrevistas Esta Semana"
              value={interviewsThisWeek}
              description="Candidatos en etapa entrevistas"
              icon={CalendarDays}
              testId="dashboard-kpi-interviews-week"
            />
            <StatsCard
              title="Ofertas Pendientes"
              value={offersPending}
              description="Candidatos con oferta activa"
              icon={FileCheck}
              testId="dashboard-kpi-offers-pending"
            />
            <StatsCard
              title={`Contrataciones (${period === 0 ? 'todo' : `${period}d`})`}
              value={hiresInPeriod}
              description="Personas contratadas en el período"
              icon={Gift}
              testId="dashboard-kpi-hires-month"
            />
          </div>

          {/* TTH KPI card */}
          <Card data-testid="metric-time-to-hire">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Tiempo Promedio para Contratar
              </CardTitle>
              <CardDescription>Desde el primer registro hasta la contratación</CardDescription>
            </CardHeader>
            <CardContent>
              <TTHChart
                avgTTH={avgTTH}
                breakdown={stageBreakdown}
                vacancyOptions={vacancyOptions}
                currentVacancy={vacancyFilter ?? ''}
              />
            </CardContent>
          </Card>

          {/* Pipeline funnel chart */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Candidatos</CardTitle>
              <CardDescription>Candidatos activos por etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <PipelineFunnelChart data={pipelineChartData} />
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Recruiter view ──────────────────────────────────────────────── */}
      {role === 'recruiter' && (
        <>
          {/* 4 base KPI cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Personas"
              value={totalPeople ?? 0}
              description="Candidatos y empleados registrados"
              icon={Users}
            />
            <StatsCard
              title="Vacantes Abiertas"
              value={openVacancies}
              description="Posiciones en búsqueda activa"
              icon={Briefcase}
            />
            <StatsCard
              title="Candidatos Activos"
              value={activeCandidates}
              description="En proceso de selección"
              icon={UserCheck}
            />
            <StatsCard
              title="Mis Candidatos"
              value={myCandidateCount}
              description="Personas que registraste"
              icon={Clock}
            />
          </div>

          {/* Workload card */}
          <Card data-testid="workload-summary">
            <CardHeader>
              <CardTitle>Mi Carga de Trabajo</CardTitle>
              <CardDescription>Estado de tus candidatos asignados</CardDescription>
            </CardHeader>
            <CardContent>
              {myCandidateCount === 0 ? (
                <p className="text-sm text-muted-foreground">No tienes candidatos asignados</p>
              ) : (
                <div className="space-y-4">
                  {/* Summary metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div
                      className="text-center p-3 bg-muted/40 rounded-lg"
                      data-testid="workload-metric-active-candidates"
                    >
                      <div className="text-2xl font-bold">
                        {(workloadCounts['interviewing'] ?? 0) +
                          (workloadCounts['screening'] ?? 0) +
                          (workloadCounts['finalist'] ?? 0)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Activos</div>
                    </div>
                    <div
                      className="text-center p-3 bg-muted/40 rounded-lg"
                      data-testid="workload-metric-interviews-to-schedule"
                    >
                      <div className="text-2xl font-bold">{workloadCounts['screening'] ?? 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Por entrevistar</div>
                    </div>
                    <div
                      className="text-center p-3 bg-muted/40 rounded-lg"
                      data-testid="workload-metric-pending-reviews"
                    >
                      <div className="text-2xl font-bold">{workloadCounts['applied'] ?? 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Por revisar</div>
                    </div>
                    <div
                      className="text-center p-3 bg-muted/40 rounded-lg"
                      data-testid="workload-metric-offers-in-progress"
                    >
                      <div className="text-2xl font-bold">{workloadCounts['offer'] ?? 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Ofertas activas</div>
                    </div>
                  </div>

                  {/* Per-stage rows */}
                  <div className="space-y-2">
                    {Object.entries(workloadCounts)
                      .filter(([, count]) => count > 0)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([stage, count]) => (
                        <div
                          key={stage}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                          data-testid={`workload-stage-${stage}`}
                        >
                          <Badge variant="secondary">{STAGE_LABELS[stage] ?? stage}</Badge>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                  </div>

                  {/* Tasks list */}
                  <div data-testid="workload-tasks-list" className="pt-1">
                    <p className="text-sm font-medium mb-2">Acciones pendientes</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      {(workloadCounts['applied'] ?? 0) > 0 && (
                        <li>
                          Revisar {workloadCounts['applied']} aplicación
                          {workloadCounts['applied'] !== 1 ? 'es' : ''} recibida
                          {workloadCounts['applied'] !== 1 ? 's' : ''}
                        </li>
                      )}
                      {(workloadCounts['screening'] ?? 0) > 0 && (
                        <li>
                          Agendar {workloadCounts['screening']} entrevista
                          {workloadCounts['screening'] !== 1 ? 's' : ''} de screening
                        </li>
                      )}
                      {(workloadCounts['offer'] ?? 0) > 0 && (
                        <li>
                          Dar seguimiento a {workloadCounts['offer']} oferta
                          {workloadCounts['offer'] !== 1 ? 's' : ''} pendiente
                          {workloadCounts['offer'] !== 1 ? 's' : ''}
                        </li>
                      )}
                      {Object.values(workloadCounts).every(v => v === 0) && (
                        <li>Sin tareas pendientes</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Manager view ────────────────────────────────────────────────── */}
      {isManager && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Personas"
            value={totalPeople ?? 0}
            description="Candidatos y empleados registrados"
            icon={Users}
          />
          <StatsCard
            title="Vacantes Abiertas"
            value={openVacancies}
            description="Posiciones en búsqueda activa"
            icon={Briefcase}
          />
          <StatsCard
            title="Candidatos Activos"
            value={activeCandidates}
            description="En proceso de selección"
            icon={UserCheck}
          />
          <StatsCard
            title="Total Registros"
            value={totalPeople ?? 0}
            description="Personas en el sistema"
            icon={Clock}
          />
        </div>
      )}

      {/* ── Recent people + Open positions (all roles) ───────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
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

        {/* Open positions */}
        <Card>
          <CardHeader>
            <CardTitle>Vacantes Abiertas</CardTitle>
            <CardDescription>Posiciones actualmente en búsqueda</CardDescription>
          </CardHeader>
          <CardContent>
            {openPositions && openPositions.length > 0 ? (
              <div className="space-y-3">
                {openPositions.slice(0, 5).map(position => (
                  <div key={position.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{position.title}</p>
                      <p className="text-xs text-muted-foreground">{position.department}</p>
                    </div>
                    <Badge variant={position.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {position.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No hay vacantes abiertas actualmente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
