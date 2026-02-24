import { Clock, UserPlus, ArrowUpDown, FileText, MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTION_LABELS } from '@/lib/utils/people';

interface TimelineEntry {
  action_type: string;
  description: string | null;
  performed_by_name: string | null;
  created_at: string;
}

interface PersonTimelineProps {
  entries: TimelineEntry[];
}

function getActionIcon(actionType: string) {
  switch (actionType) {
    case 'person_created':
      return <UserPlus className="h-4 w-4" />;
    case 'status_changed':
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

export function PersonTimeline({ entries }: PersonTimelineProps) {
  return (
    <Card data-testid="person_timeline">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Actividad ({entries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Sin actividad registrada.</p>
        ) : (
          <ol className="relative border-l border-border ml-3 space-y-4">
            {entries.map((entry, idx) => (
              <li key={idx} className="ml-4">
                <div className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-background border border-border text-muted-foreground">
                  {getActionIcon(entry.action_type)}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {ACTION_LABELS[entry.action_type] ?? entry.action_type}
                    </p>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {entry.description}
                      </p>
                    )}
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
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
