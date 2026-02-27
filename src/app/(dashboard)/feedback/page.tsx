import Link from 'next/link';
import { MessageSquare, Star } from 'lucide-react';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  technical: 'Técnica',
  cultural: 'Cultural',
  final: 'Final',
  other: 'Otro',
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  strong_yes: 'Fuertemente recomendado',
  yes: 'Recomendado',
  maybe: 'Dudoso',
  no: 'No recomendado',
  strong_no: 'Fuertemente no recomendado',
};

const RECOMMENDATION_COLORS: Record<string, string> = {
  strong_yes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  yes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  maybe: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  no: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  strong_no: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} de ${max} estrellas`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          fill={i < rating ? 'currentColor' : 'none'}
          style={{ color: i < rating ? '#f59e0b' : '#d1d5db' }}
        />
      ))}
    </span>
  );
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
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function FeedbackPage() {
  const supabase = await createClient();

  // Fetch all feedback (RLS handles visibility per role)
  const { data: feedbackList, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    notFound();
  }

  const rawFeedback = feedbackList ?? [];

  if (rawFeedback.length === 0) {
    return (
      <div className="space-y-6" data-testid="feedbackPage">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground">Visualiza y gestiona el feedback de candidatos</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No hay feedback registrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Collect IDs for bulk lookups
  const personIds = [...new Set(rawFeedback.map(f => f.person_id))];
  const positionIds = [
    ...new Set(rawFeedback.map(f => f.position_id).filter((id): id is string => id !== null)),
  ];
  const profileIds = [...new Set(rawFeedback.map(f => f.given_by))];

  // Bulk fetch related data in parallel
  const [peopleResult, positionsResult, profilesResult] = await Promise.all([
    supabase.from('people').select('id, first_name, last_name').in('id', personIds),
    positionIds.length > 0
      ? supabase.from('positions').select('id, title').in('id', positionIds)
      : { data: [] as { id: string; title: string }[] },
    supabase.from('profiles').select('id, full_name').in('id', profileIds),
  ]);

  // Build lookup maps
  const personMap = Object.fromEntries(
    (peopleResult.data ?? []).map(p => [p.id, { first_name: p.first_name, last_name: p.last_name }])
  );
  const positionMap = Object.fromEntries((positionsResult.data ?? []).map(p => [p.id, p.title]));
  const profileMap = Object.fromEntries((profilesResult.data ?? []).map(p => [p.id, p.full_name]));

  // Enrich feedback entries
  const enriched = rawFeedback.map(fb => ({
    ...fb,
    person_name: personMap[fb.person_id]
      ? `${personMap[fb.person_id].first_name} ${personMap[fb.person_id].last_name}`
      : 'Candidato desconocido',
    position_title: fb.position_id ? (positionMap[fb.position_id] ?? null) : null,
    given_by_name: profileMap[fb.given_by] ?? null,
  }));

  return (
    <div className="space-y-6" data-testid="feedbackPage">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">
          {enriched.length} {enriched.length === 1 ? 'evaluación' : 'evaluaciones'} registradas
        </p>
      </div>

      <div className="space-y-3" data-testid="feedback-list">
        {enriched.map(fb => (
          <Card key={fb.id} data-testid={`feedback-item-${fb.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    <Link
                      href={`/people/${fb.person_id}`}
                      className="hover:underline"
                      data-testid={`feedback-person-link-${fb.id}`}
                    >
                      {fb.person_name}
                    </Link>
                  </CardTitle>
                  {fb.position_title && (
                    <p className="text-sm text-muted-foreground">{fb.position_title}</p>
                  )}
                </div>
                <time
                  className="text-xs text-muted-foreground shrink-0"
                  dateTime={fb.created_at}
                  title={new Date(fb.created_at).toLocaleString('es-ES')}
                >
                  {formatRelativeDate(fb.created_at)}
                </time>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <StarDisplay rating={fb.rating} />
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {FEEDBACK_TYPE_LABELS[fb.feedback_type] ?? fb.feedback_type}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${RECOMMENDATION_COLORS[fb.recommendation] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {RECOMMENDATION_LABELS[fb.recommendation] ?? fb.recommendation}
                </span>
                {fb.is_confidential && (
                  <Badge variant="outline" className="text-xs">
                    Confidencial
                  </Badge>
                )}
              </div>

              {fb.comments && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {fb.comments}
                </p>
              )}

              {(fb.strengths || fb.concerns) && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                  {fb.strengths && (
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-400">
                        Fortalezas:{' '}
                      </span>
                      <span className="text-muted-foreground">{fb.strengths}</span>
                    </div>
                  )}
                  {fb.concerns && (
                    <div>
                      <span className="font-medium text-amber-700 dark:text-amber-400">
                        Mejoras:{' '}
                      </span>
                      <span className="text-muted-foreground">{fb.concerns}</span>
                    </div>
                  )}
                </div>
              )}

              {fb.given_by_name && (
                <p className="text-xs text-muted-foreground">por {fb.given_by_name}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
