import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Users, Calendar } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  PositionPipeline,
  type PipelineCandidate,
  type PipelineStageValue,
} from '@/components/features/positions/position-pipeline';
import { AssignCandidateSheet } from '@/components/features/positions/assign-candidate-sheet';
import { ClosePositionDialog } from '@/components/features/positions/close-position-dialog';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default async function PositionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: position, error } = await supabase
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
        stage,
        assigned_at,
        updated_at,
        people (
          id,
          first_name,
          last_name,
          email,
          current_position,
          current_company
        )
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !position) {
    notFound();
  }

  const isOpen = position.status === 'open';

  // Shape candidates for pipeline
  type RawPersonPositions = typeof position.person_positions;
  type RawPP = RawPersonPositions extends (infer U)[] ? U : never;

  const candidates: PipelineCandidate[] = ((position.person_positions ?? []) as RawPP[]).map(
    pp => ({
      id: pp.id,
      person_id: (pp as { person_id?: string }).person_id ?? '',
      stage: pp.stage as PipelineStageValue,
      person: pp.people
        ? {
            id: (pp.people as { id: string }).id,
            first_name: (pp.people as { first_name: string }).first_name,
            last_name: (pp.people as { last_name: string }).last_name,
            email: (pp.people as { email: string }).email,
            current_position: (pp.people as { current_position: string | null }).current_position,
            current_company: (pp.people as { current_company: string | null }).current_company,
          }
        : null,
    })
  );

  // Candidates eligible for close-position dialog
  const closeCandidates = candidates
    .filter(c => c.person !== null)
    .map(c => ({
      person_id: c.person_id,
      person_name: `${c.person!.first_name} ${c.person!.last_name}`,
      stage: c.stage,
    }));

  const status = statusStyles[position.status] ?? statusStyles.open;
  const priority = priorityStyles[position.priority ?? 'medium'] ?? priorityStyles.medium;

  const hiringManager = position.hiring_manager as { id: string; full_name: string } | null;
  const recruiter = position.recruiter as { id: string; full_name: string } | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/positions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{position.title}</h1>
            <Badge variant="secondary" className={status.bg}>
              {status.label}
            </Badge>
            <Badge variant="secondary" className={priority.bg}>
              {priority.label}
            </Badge>
          </div>
          {position.department && <p className="text-muted-foreground">{position.department}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          {isOpen && <AssignCandidateSheet positionId={id} positionTitle={position.title} />}
          {position.status !== 'closed' && (
            <ClosePositionDialog
              positionId={id}
              positionTitle={position.title}
              candidates={closeCandidates}
            />
          )}
          <Button variant="outline" asChild>
            <Link href={`/positions/${id}/edit`}>Editar</Link>
          </Button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {position.location && (
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Ubicación</p>
                <p className="text-sm font-medium">{position.location}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {position.employment_type && (
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium">
                  {employmentTypeLabels[position.employment_type] ?? position.employment_type}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {(position.salary_min || position.salary_max) && (
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Salario</p>
                <p className="text-sm font-medium">
                  {position.salary_min?.toLocaleString() ?? '?'} –{' '}
                  {position.salary_max?.toLocaleString() ?? '?'} {position.salary_currency ?? 'USD'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Candidatos</p>
              <p className="text-sm font-medium">{candidates.length} en pipeline</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Creada</p>
              <p className="text-sm font-medium">
                {new Date(position.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: description + requirements */}
        <div className="lg:col-span-2 space-y-4">
          {position.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {position.description}
                </p>
              </CardContent>
            </Card>
          )}
          {position.requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {position.requirements}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: team */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Equipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hiringManager && (
              <div>
                <p className="text-xs text-muted-foreground">Manager</p>
                <p className="text-sm font-medium">{hiringManager.full_name}</p>
              </div>
            )}
            {hiringManager && recruiter && <Separator />}
            {recruiter && (
              <div>
                <p className="text-xs text-muted-foreground">Recruiter</p>
                <p className="text-sm font-medium">{recruiter.full_name}</p>
              </div>
            )}
            {!hiringManager && !recruiter && (
              <p className="text-sm text-muted-foreground">Sin equipo asignado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline kanban */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline de Candidatos</CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Aún no hay candidatos en este pipeline.
              </p>
              {isOpen && (
                <p className="text-xs text-muted-foreground mt-1">
                  Usa el botón &quot;Asignar Candidato&quot; para agregar personas.
                </p>
              )}
            </div>
          ) : (
            <PositionPipeline positionId={id} initialCandidates={candidates} readonly={!isOpen} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
