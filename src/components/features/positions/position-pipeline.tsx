'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { toast } from 'sonner';
import { GripVertical } from 'lucide-react';

import { STAGE_LABELS } from '@/lib/utils/people';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getPersonInitials } from '@/lib/utils/people';

export type PipelineStageValue =
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'finalist'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface PipelineCandidate {
  id: string; // person_positions.id
  person_id: string;
  stage: PipelineStageValue;
  person: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    current_position: string | null;
    current_company: string | null;
  } | null;
}

interface PositionPipelineProps {
  positionId: string;
  initialCandidates: PipelineCandidate[];
  readonly?: boolean;
}

const ORDERED_STAGES: PipelineStageValue[] = [
  'applied',
  'screening',
  'interviewing',
  'finalist',
  'offer',
  'hired',
  'rejected',
];

const STAGE_COLORS: Record<PipelineStageValue, string> = {
  applied: 'bg-gray-100 border-gray-200',
  screening: 'bg-blue-50 border-blue-200',
  interviewing: 'bg-purple-50 border-purple-200',
  finalist: 'bg-orange-50 border-orange-200',
  offer: 'bg-yellow-50 border-yellow-200',
  hired: 'bg-green-50 border-green-200',
  rejected: 'bg-red-50 border-red-200',
};

const STAGE_BADGE_COLORS: Record<PipelineStageValue, string> = {
  applied: 'bg-gray-100 text-gray-700',
  screening: 'bg-blue-100 text-blue-700',
  interviewing: 'bg-purple-100 text-purple-700',
  finalist: 'bg-orange-100 text-orange-700',
  offer: 'bg-yellow-100 text-yellow-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// ─── Droppable Column ────────────────────────────────────────────────────────

function DroppableColumn({
  stage,
  candidates,
  isOver,
}: {
  stage: PipelineStageValue;
  candidates: PipelineCandidate[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[200px] rounded-lg border-2 p-3 transition-colors ${STAGE_COLORS[stage]} ${isOver ? 'border-primary ring-2 ring-primary/20' : ''}`}
      data-testid={`pipeline-column-${stage}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{STAGE_LABELS[stage] ?? stage}</h3>
        <Badge variant="secondary" className={`text-xs ${STAGE_BADGE_COLORS[stage]}`}>
          {candidates.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {candidates.map(candidate => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}

// ─── Draggable Card ──────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  isDragging = false,
}: {
  candidate: PipelineCandidate;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dragging,
  } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const person = candidate.person;
  if (!person) return null;

  const initials = getPersonInitials({
    first_name: person.first_name,
    last_name: person.last_name,
  });
  const fullName = `${person.first_name} ${person.last_name}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-md border bg-white p-2.5 shadow-sm transition-opacity cursor-grab active:cursor-grabbing ${dragging || isDragging ? 'opacity-50' : 'opacity-100 hover:border-primary/50'}`}
      data-testid={`candidate-card-${candidate.person_id}`}
    >
      <div className="flex items-start gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/people/${person.id}`}
            className="block text-sm font-medium truncate hover:underline"
            onClick={e => e.stopPropagation()}
          >
            {fullName}
          </Link>
          <p className="text-xs text-muted-foreground truncate">{person.email}</p>
          {person.current_position && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {person.current_position}
            </p>
          )}
        </div>
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-muted-foreground p-0.5"
          aria-label="Arrastrar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Pipeline Component ─────────────────────────────────────────────────

export function PositionPipeline({
  positionId,
  initialCandidates,
  readonly = false,
}: PositionPipelineProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<PipelineCandidate[]>(initialCandidates);
  const [activeCandidate, setActiveCandidate] = useState<PipelineCandidate | null>(null);
  const [overStage, setOverStage] = useState<PipelineStageValue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getCandidatesForStage = useCallback(
    (stage: PipelineStageValue) => candidates.filter(c => c.stage === stage),
    [candidates]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find(c => c.id === event.active.id);
    if (candidate) setActiveCandidate(candidate);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as PipelineStageValue | undefined;
    if (overId && ORDERED_STAGES.includes(overId)) {
      setOverStage(overId);
    } else {
      setOverStage(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCandidate(null);
    setOverStage(null);

    const { active, over } = event;
    if (!over) return;

    const candidateId = active.id as string;
    const newStage = over.id as PipelineStageValue;

    if (!ORDERED_STAGES.includes(newStage)) return;

    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) return;

    // Optimistic update
    setCandidates(prev => prev.map(c => (c.id === candidateId ? { ...c, stage: newStage } : c)));

    try {
      const res = await fetch(`/api/positions/${positionId}/candidates/${candidate.person_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error ?? 'Error al actualizar etapa');
        // Revert
        setCandidates(prev =>
          prev.map(c => (c.id === candidateId ? { ...c, stage: candidate.stage } : c))
        );
        return;
      }

      router.refresh();
    } catch {
      toast.error('Error de red al actualizar etapa');
      setCandidates(prev =>
        prev.map(c => (c.id === candidateId ? { ...c, stage: candidate.stage } : c))
      );
    }
  };

  if (readonly) {
    return (
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${ORDERED_STAGES.length}, minmax(180px, 1fr))` }}
      >
        {ORDERED_STAGES.map(stage => (
          <div
            key={stage}
            className={`flex flex-col min-h-[160px] rounded-lg border p-3 ${STAGE_COLORS[stage]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold">{STAGE_LABELS[stage] ?? stage}</h3>
              <Badge variant="secondary" className={`text-xs ${STAGE_BADGE_COLORS[stage]}`}>
                {getCandidatesForStage(stage).length}
              </Badge>
            </div>
            {getCandidatesForStage(stage).map(candidate => {
              const person = candidate.person;
              if (!person) return null;
              return (
                <Link
                  key={candidate.id}
                  href={`/people/${person.id}`}
                  className="text-xs py-1 hover:underline"
                >
                  {person.first_name} {person.last_name}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4" data-testid="position-pipeline">
        <div
          className="grid gap-3 min-w-max"
          style={{ gridTemplateColumns: `repeat(${ORDERED_STAGES.length}, 200px)` }}
        >
          {ORDERED_STAGES.map(stage => (
            <DroppableColumn
              key={stage}
              stage={stage}
              candidates={getCandidatesForStage(stage)}
              isOver={overStage === stage}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeCandidate ? (
          <div className="rotate-2 shadow-xl opacity-95">
            <Card className="w-[200px]">
              <CardContent className="p-2.5">
                {activeCandidate.person && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {getPersonInitials({
                        first_name: activeCandidate.person.first_name,
                        last_name: activeCandidate.person.last_name,
                      })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activeCandidate.person.first_name} {activeCandidate.person.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activeCandidate.person.email}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
