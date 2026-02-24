'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { getValidNextStatuses } from './status-machine';

interface StatusDefinition {
  id: string;
  label: string;
  color: string;
  status_value: string;
}

interface StatusChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  currentStatusValue: string | null;
  onSuccess: () => void;
}

export function StatusChangeModal({
  open,
  onOpenChange,
  personId,
  currentStatusValue,
  onSuccess,
}: StatusChangeModalProps) {
  const [statuses, setStatuses] = useState<StatusDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch valid next status definitions when the modal opens
  useEffect(() => {
    if (!open) {
      setSelectedId('');
      setComment('');
      return;
    }

    const validValues = currentStatusValue ? getValidNextStatuses(currentStatusValue) : [];

    if (validValues.length === 0) {
      setStatuses([]);
      return;
    }

    setFetching(true);
    const supabase = createClient();
    supabase
      .from('status_definitions')
      .select('id, label, color, status_value')
      .eq('is_active', true)
      .in('status_value', validValues)
      .then(({ data, error }) => {
        if (error) {
          toast.error('No se pudieron cargar los estados disponibles.');
        } else {
          // Preserve state machine order
          const ordered = validValues
            .map(v => data?.find(d => d.status_value === v))
            .filter((d): d is StatusDefinition => d !== undefined);
          setStatuses(ordered);
        }
        setFetching(false);
      });
  }, [open, currentStatusValue]);

  async function handleConfirm() {
    if (!selectedId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/people/${personId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_definition_id: selectedId,
          comment: comment.trim() || undefined,
        }),
      });

      const data: unknown = await response.json();
      const body = data as Record<string, string>;

      if (!response.ok) {
        toast.error(body.error ?? 'Error al cambiar el estado.');
        return;
      }

      toast.success('Estado actualizado correctamente');
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const hasNoTransitions = !fetching && statuses.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="statusChangeModal" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="status_select">Nuevo estado</Label>
            {hasNoTransitions ? (
              <p className="text-sm text-muted-foreground">
                No hay transiciones válidas disponibles desde el estado actual.
              </p>
            ) : (
              <Select value={selectedId} onValueChange={setSelectedId} disabled={fetching}>
                <SelectTrigger id="status_select" data-testid="status_select">
                  <SelectValue placeholder={fetching ? 'Cargando...' : 'Selecciona un estado'} />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_comment_input">
              Comentario <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="status_comment_input"
              data-testid="status_comment_input"
              placeholder="Agrega una nota sobre este cambio de estado..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={500}
              rows={3}
            />
            {comment.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            data-testid="confirm_status_change_btn"
            onClick={handleConfirm}
            disabled={!selectedId || loading || hasNoTransitions}
          >
            {loading ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
