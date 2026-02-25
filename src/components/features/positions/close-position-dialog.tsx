'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Candidate {
  person_id: string;
  person_name: string;
  stage: string;
}

interface ClosePositionDialogProps {
  positionId: string;
  positionTitle: string;
  candidates: Candidate[];
}

type CloseAction = 'filled' | 'cancelled' | 'on_hold';

const ACTION_OPTIONS = [
  { value: 'filled', label: 'Cubierta (posición ocupada)' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'on_hold', label: 'En Pausa' },
] as const;

export function ClosePositionDialog({
  positionId,
  positionTitle,
  candidates,
}: ClosePositionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<CloseAction | ''>('');
  const [hiredPersonId, setHiredPersonId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Candidates eligible to be marked as hired (offer or finalist stage)
  const eligibleCandidates = candidates.filter(c =>
    ['offer', 'finalist', 'interviewing', 'hired'].includes(c.stage)
  );

  const handleSubmit = async () => {
    if (!action) {
      toast.error('Selecciona una acción');
      return;
    }
    if (action === 'filled' && !hiredPersonId) {
      toast.error('Selecciona la persona contratada');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/positions/${positionId}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...(action === 'filled' && hiredPersonId ? { hired_person_id: hiredPersonId } : {}),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? 'Error al actualizar la vacante');
        return;
      }

      toast.success(result.message ?? 'Vacante actualizada correctamente');
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setAction('');
      setHiredPersonId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="close-position-btn">
          <XCircle className="mr-2 h-4 w-4" />
          Cerrar Vacante
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="close-position-dialog">
        <DialogHeader>
          <DialogTitle>Actualizar estado de vacante</DialogTitle>
          <DialogDescription>Actualiza el estado de &quot;{positionTitle}&quot;.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="close-action">Acción</Label>
            <Select
              value={action}
              onValueChange={val => {
                setAction(val as CloseAction);
                if (val !== 'filled') setHiredPersonId('');
              }}
            >
              <SelectTrigger id="close-action" data-testid="close-action-select">
                <SelectValue placeholder="Selecciona una acción" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {action === 'filled' && (
            <div className="space-y-2">
              <Label htmlFor="hired-person">Persona Contratada *</Label>
              <Select value={hiredPersonId} onValueChange={setHiredPersonId}>
                <SelectTrigger id="hired-person" data-testid="hired-person-select">
                  <SelectValue placeholder="Selecciona la persona contratada" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleCandidates.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      No hay candidatos elegibles
                    </SelectItem>
                  ) : (
                    eligibleCandidates.map(c => (
                      <SelectItem key={c.person_id} value={c.person_id}>
                        {c.person_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {eligibleCandidates.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Mueve candidatos a las etapas de Entrevistas, Finalista u Oferta primero.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !action || (action === 'filled' && !hiredPersonId)}
            data-testid="close-position-submit"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
