'use client';

import { useState, useMemo } from 'react';
import { MessageSquare, Plus, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FeedbackWithAuthor {
  id: string;
  person_id: string;
  position_id: string | null;
  given_by: string;
  given_by_name: string | null;
  feedback_type: 'technical' | 'cultural' | 'final' | 'other';
  rating: number;
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  strengths: string | null;
  concerns: string | null;
  comments: string;
  is_confidential: boolean;
  created_at: string;
}

interface PersonFeedbackProps {
  personId: string;
  initialFeedback: FeedbackWithAuthor[];
  positions: { id: string; title: string }[];
}

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

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} de ${max} estrellas`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i < rating ? 'currentColor' : 'none'}
          style={{ color: i < rating ? '#f59e0b' : '#d1d5db' }}
        />
      ))}
    </span>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = hovered ? starValue <= hovered : starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            data-testid={`feedback-rating-${starValue}`}
            className="focus:outline-none"
            aria-label={`${starValue} estrella${starValue !== 1 ? 's' : ''}`}
          >
            <Star
              className="h-6 w-6 transition-colors"
              fill={isFilled ? 'currentColor' : 'none'}
              style={{ color: isFilled ? '#f59e0b' : '#d1d5db', cursor: 'pointer' }}
            />
          </button>
        );
      })}
    </span>
  );
}

export function PersonFeedback({ personId, initialFeedback, positions }: PersonFeedbackProps) {
  const [feedbackList, setFeedbackList] = useState<FeedbackWithAuthor[]>(initialFeedback);
  const [filterPositionId, setFilterPositionId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [comments, setComments] = useState('');
  const [strengths, setStrengths] = useState('');
  const [concerns, setConcerns] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState('none');

  // Filtered list
  const filtered = useMemo(() => {
    if (filterPositionId === 'all') return feedbackList;
    return feedbackList.filter(fb => fb.position_id === filterPositionId);
  }, [feedbackList, filterPositionId]);

  // Average rating
  const averageRating = useMemo(() => {
    if (filtered.length === 0) return null;
    const sum = filtered.reduce((acc, fb) => acc + fb.rating, 0);
    return (sum / filtered.length).toFixed(1);
  }, [filtered]);

  const resetForm = () => {
    setRating(0);
    setFeedbackType('');
    setRecommendation('');
    setComments('');
    setStrengths('');
    setConcerns('');
    setSelectedPositionId('none');
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Selecciona una valoración');
      return;
    }
    if (!feedbackType) {
      toast.error('Selecciona un tipo de feedback');
      return;
    }
    if (!recommendation) {
      toast.error('Selecciona una recomendación');
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        feedback_type: feedbackType,
        rating,
        recommendation,
        comments,
        strengths: strengths || undefined,
        concerns: concerns || undefined,
        position_id: selectedPositionId !== 'none' ? selectedPositionId : undefined,
        is_confidential: false,
      };

      const res = await fetch(`/api/people/${personId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Error al guardar el feedback');
        return;
      }

      setFeedbackList(prev => [data as FeedbackWithAuthor, ...prev]);
      resetForm();
      toast.success('Feedback registrado');
    } catch {
      toast.error('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const positionTitle = (posId: string | null) => {
    if (!posId) return null;
    return positions.find(p => p.id === posId)?.title ?? null;
  };

  return (
    <Card data-testid="feedback-section">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
            {feedbackList.length > 0 && (
              <span
                className="ml-1 text-sm font-normal text-muted-foreground"
                data-testid="feedback-count"
              >
                ({feedbackList.length} {feedbackList.length === 1 ? 'evaluación' : 'evaluaciones'})
              </span>
            )}
          </CardTitle>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Average rating */}
            {averageRating && (
              <span
                className="flex items-center gap-1 text-sm font-medium"
                data-testid="feedback-average-rating"
              >
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {averageRating}
              </span>
            )}

            {/* Vacancy filter */}
            {positions.length > 0 && (
              <Select value={filterPositionId} onValueChange={setFilterPositionId}>
                <SelectTrigger className="h-8 w-auto text-xs" data-testid="feedback-filter-vacancy">
                  <SelectValue placeholder="Todas las vacantes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las vacantes</SelectItem>
                  {positions.map(pos => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!showForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
                data-testid="feedback-add-button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar feedback
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add feedback form */}
        {showForm && (
          <div className="rounded-md border p-4 space-y-4 bg-muted/30">
            {/* Star rating */}
            <div className="space-y-1.5">
              <Label>Valoración *</Label>
              <StarSelector value={rating} onChange={setRating} />
            </div>

            {/* Feedback type + Recommendation */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipo de entrevista *</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FEEDBACK_TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Recomendación *</Label>
                <Select value={recommendation} onValueChange={setRecommendation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona recomendación" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RECOMMENDATION_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vacancy (optional) */}
            {positions.length > 0 && (
              <div className="space-y-1.5">
                <Label>Vacante (opcional)</Label>
                <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin vacante específica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin vacante específica</SelectItem>
                    {positions.map(pos => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-1.5">
              <Label>Comentarios</Label>
              <Textarea
                placeholder="Observaciones generales sobre la entrevista..."
                value={comments}
                onChange={e => setComments(e.target.value.slice(0, 2000))}
                rows={3}
                className="resize-none"
                data-testid="feedback-comments-input"
              />
              <p className="text-xs text-muted-foreground text-right">{comments.length}/2000</p>
            </div>

            {/* Strengths + Concerns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Fortalezas</Label>
                <Textarea
                  placeholder="Puntos fuertes del candidato..."
                  value={strengths}
                  onChange={e => setStrengths(e.target.value.slice(0, 2000))}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Áreas de mejora</Label>
                <Textarea
                  placeholder="Aspectos a mejorar..."
                  value={concerns}
                  onChange={e => setConcerns(e.target.value.slice(0, 2000))}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm} disabled={isSaving}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSaving}
                data-testid="feedback-submit-button"
              >
                {isSaving ? 'Guardando...' : 'Guardar feedback'}
              </Button>
            </div>
          </div>
        )}

        {/* Feedback list */}
        {filtered.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground py-2">No hay feedback registrado.</p>
        ) : (
          <ol className="space-y-3" data-testid="feedback-list">
            {filtered.map(fb => (
              <li
                key={fb.id}
                className="rounded-md border p-3 text-sm space-y-2"
                data-testid={`feedback-item-${fb.id}`}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StarDisplay rating={fb.rating} />
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {FEEDBACK_TYPE_LABELS[fb.feedback_type] ?? fb.feedback_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {RECOMMENDATION_LABELS[fb.recommendation] ?? fb.recommendation}
                    </span>
                  </div>
                  <time
                    className="text-xs text-muted-foreground shrink-0"
                    dateTime={fb.created_at}
                    title={new Date(fb.created_at).toLocaleString('es-ES')}
                  >
                    {formatRelativeDate(fb.created_at)}
                  </time>
                </div>

                {fb.comments && (
                  <p className="text-muted-foreground whitespace-pre-wrap">{fb.comments}</p>
                )}

                {(fb.strengths || fb.concerns) && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                    {fb.strengths && (
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">
                          Fortalezas:{' '}
                        </span>
                        {fb.strengths}
                      </div>
                    )}
                    {fb.concerns && (
                      <div>
                        <span className="font-medium text-amber-700 dark:text-amber-400">
                          Mejoras:{' '}
                        </span>
                        {fb.concerns}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                  {fb.given_by_name && <span>por {fb.given_by_name}</span>}
                  {fb.given_by_name && positionTitle(fb.position_id) && <span>·</span>}
                  {positionTitle(fb.position_id) && <span>{positionTitle(fb.position_id)}</span>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
