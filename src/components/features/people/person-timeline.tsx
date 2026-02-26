'use client';

import { useState } from 'react';
import {
  Clock,
  UserPlus,
  ArrowUpDown,
  FileText,
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ACTION_LABELS } from '@/lib/utils/people';

interface TimelineEntry {
  id?: string;
  action_type: string;
  description: string | null;
  performed_by_name: string | null;
  created_at: string;
  new_value?: Record<string, unknown> | null;
}

interface PersonTimelineProps {
  entries: TimelineEntry[];
}

type FilterType = 'all' | 'status' | 'notes' | 'feedback' | 'positions';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Todo',
  status: 'Estados',
  notes: 'Notas',
  feedback: 'Feedback',
  positions: 'Vacantes',
};

const FILTER_TYPES: Record<FilterType, string[]> = {
  all: [],
  status: ['status_changed', 'status_change'],
  notes: ['note_added'],
  feedback: ['feedback_added'],
  positions: ['stage_changed', 'assigned_to_position', 'position_assigned'],
};

function getActionIcon(actionType: string) {
  switch (actionType) {
    case 'person_created':
      return <UserPlus className="h-4 w-4" />;
    case 'person_updated':
      return <User className="h-4 w-4" />;
    case 'status_changed':
    case 'status_change':
      return <ArrowUpDown className="h-4 w-4" />;
    case 'stage_changed':
    case 'position_assigned':
    case 'assigned_to_position':
      return <ArrowUpDown className="h-4 w-4" />;
    case 'note_added':
      return <FileText className="h-4 w-4" />;
    case 'feedback_added':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ExpandedDetail({ entry }: { entry: TimelineEntry }) {
  const val = entry.new_value;
  if (!val) return null;

  if (entry.action_type === 'note_added' && typeof val.content === 'string') {
    return (
      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded p-2">
        {val.content}
      </p>
    );
  }

  if (entry.action_type === 'feedback_added') {
    return (
      <div className="mt-1 text-sm text-muted-foreground bg-muted/30 rounded p-2 space-y-1">
        {typeof val.rating === 'number' && (
          <p>
            <span className="font-medium">Valoración:</span> {val.rating}/5 ★
          </p>
        )}
        {typeof val.recommendation === 'string' && (
          <p>
            <span className="font-medium">Recomendación:</span>{' '}
            {val.recommendation.replace('_', ' ')}
          </p>
        )}
        {typeof val.feedback_type === 'string' && (
          <p>
            <span className="font-medium">Tipo:</span> {val.feedback_type}
          </p>
        )}
        {typeof val.comments === 'string' && val.comments && (
          <p className="whitespace-pre-wrap">{val.comments}</p>
        )}
      </div>
    );
  }

  return null;
}

export function PersonTimeline({ entries }: PersonTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const filteredEntries =
    activeFilter === 'all'
      ? entries
      : entries.filter(e => FILTER_TYPES[activeFilter].includes(e.action_type));

  const toggleExpand = (idx: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const hasExpandableDetail = (entry: TimelineEntry) => {
    if (!entry.new_value) return false;
    if (entry.action_type === 'note_added' && typeof entry.new_value.content === 'string')
      return true;
    if (entry.action_type === 'feedback_added') return true;
    return false;
  };

  return (
    <Card data-testid="activity-timeline">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Actividad ({entries.length})
        </CardTitle>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1 pt-1">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              data-testid={`activity-filter-${type}`}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                activeFilter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {FILTER_LABELS[type]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filteredEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Sin actividad registrada.</p>
        ) : (
          <ol className="relative border-l border-border ml-3 space-y-4">
            {filteredEntries.map((entry, idx) => {
              const isExpanded = expandedIds.has(idx);
              const canExpand = hasExpandableDetail(entry);

              return (
                <li key={idx} className="ml-4" data-testid={`activity-item-${idx}`}>
                  <div className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-background border border-border text-muted-foreground">
                    {getActionIcon(entry.action_type)}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium">
                          {ACTION_LABELS[entry.action_type] ?? entry.action_type}
                        </p>
                        {canExpand && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={() => toggleExpand(idx)}
                            data-testid="activity-expand-button"
                            aria-label={isExpanded ? 'Contraer detalle' : 'Expandir detalle'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      {entry.description && !isExpanded && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {entry.description}
                        </p>
                      )}
                      {isExpanded && <ExpandedDetail entry={entry} />}
                      {entry.performed_by_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          por {entry.performed_by_name}
                        </p>
                      )}
                    </div>
                    <time
                      className="text-xs text-muted-foreground shrink-0 pt-0.5"
                      dateTime={entry.created_at}
                      title={new Date(entry.created_at).toLocaleString('es-ES')}
                    >
                      {formatRelativeDate(entry.created_at)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
