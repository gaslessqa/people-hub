'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { createStatusSchema, type CreateStatusInput } from '@/lib/schemas/statuses';

// Required schema for the edit form (label, color, order_index are all required)
const editStatusSchema = z.object({
  label: z.string().min(1, 'La etiqueta es requerida.').max(50, 'Máximo 50 caracteres.'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido (ej: #3b82f6).'),
  order_index: z
    .number({ error: 'El orden debe ser un número.' })
    .int()
    .min(0, 'El orden debe ser ≥ 0.'),
});

type EditFormValues = z.infer<typeof editStatusSchema>;

export interface StatusDefinition {
  id: string;
  status_type: 'candidate' | 'employee' | 'external';
  status_value: string;
  label: string;
  color: string;
  order_index: number;
  is_active: boolean;
}

const STATUS_TYPE_LABELS: Record<string, string> = {
  candidate: 'Candidato',
  employee: 'Empleado',
  external: 'Externo',
};

interface StatusDefinitionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: StatusDefinition | null;
  onSuccess: (updated: StatusDefinition) => void;
}

export function StatusDefinitionForm({
  open,
  onOpenChange,
  editing,
  onSuccess,
}: StatusDefinitionFormProps) {
  const isEdit = editing !== null;

  // Create form
  const createForm = useForm<CreateStatusInput>({
    resolver: zodResolver(createStatusSchema),
    defaultValues: {
      status_type: 'candidate',
      status_value: '',
      label: '',
      color: '#6b7280',
      order_index: 0,
    },
  });

  // Edit form
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editStatusSchema),
    defaultValues: {
      label: '',
      color: '#6b7280',
      order_index: 0,
    },
  });

  // Sync edit form when editing changes
  useEffect(() => {
    if (editing) {
      editForm.reset({
        label: editing.label,
        color: editing.color,
        order_index: editing.order_index,
      });
    } else {
      createForm.reset({
        status_type: 'candidate',
        status_value: '',
        label: '',
        color: '#6b7280',
        order_index: 0,
      });
    }
  }, [editing, open]);

  async function onCreateSubmit(values: CreateStatusInput) {
    try {
      const response = await fetch('/api/admin/statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { status?: StatusDefinition; error?: string };

      if (!response.ok) {
        toast.error(data.error ?? 'Error al crear el estado.');
        return;
      }

      toast.success('Estado creado correctamente.');
      onOpenChange(false);
      if (data.status) onSuccess(data.status);
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    }
  }

  async function onEditSubmit(values: EditFormValues) {
    if (!editing) return;
    try {
      const response = await fetch(`/api/admin/statuses/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { status?: StatusDefinition; error?: string };

      if (!response.ok) {
        toast.error(data.error ?? 'Error al actualizar el estado.');
        return;
      }

      toast.success('Estado actualizado correctamente.');
      onOpenChange(false);
      if (data.status) onSuccess(data.status);
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md" data-testid="statusDefinitionForm">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar Estado' : 'Nuevo Estado'}</SheetTitle>
        </SheetHeader>

        {isEdit ? (
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <p className="text-sm text-muted-foreground">
                {STATUS_TYPE_LABELS[editing.status_type]}
              </p>
            </div>

            <div className="space-y-1">
              <Label>Valor del estado</Label>
              <p className="text-sm font-mono text-muted-foreground">{editing.status_value}</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_label">Etiqueta</Label>
              <Input
                id="edit_label"
                data-testid="status_label_input"
                {...editForm.register('label')}
              />
              {editForm.formState.errors.label && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.label.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_color">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="edit_color"
                  type="color"
                  data-testid="status_color_input"
                  {...editForm.register('color')}
                  className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
                />
                <Input
                  value={editForm.watch('color')}
                  onChange={e => editForm.setValue('color', e.target.value)}
                  placeholder="#3b82f6"
                  className="font-mono"
                />
              </div>
              {editForm.formState.errors.color && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.color.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_order">Orden</Label>
              <Input
                id="edit_order"
                type="number"
                min={0}
                data-testid="status_order_input"
                {...editForm.register('order_index', { valueAsNumber: true })}
              />
              {editForm.formState.errors.order_index && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.order_index.message}
                </p>
              )}
            </div>

            <SheetFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editForm.formState.isSubmitting}
                data-testid="save_status_btn"
              >
                {editForm.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </SheetFooter>
          </form>
        ) : (
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="create_type">Tipo de estado</Label>
              <Select
                value={createForm.watch('status_type')}
                onValueChange={v =>
                  createForm.setValue('status_type', v as CreateStatusInput['status_type'])
                }
              >
                <SelectTrigger id="create_type" data-testid="status_type_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidato</SelectItem>
                  <SelectItem value="employee">Empleado</SelectItem>
                  <SelectItem value="external">Externo</SelectItem>
                </SelectContent>
              </Select>
              {createForm.formState.errors.status_type && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.status_type.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="create_value">Valor (slug único)</Label>
              <Input
                id="create_value"
                placeholder="ej: en_proceso"
                data-testid="status_value_input"
                {...createForm.register('status_value')}
              />
              <p className="text-xs text-muted-foreground">
                Solo letras minúsculas, números y guiones bajos. No se puede cambiar después.
              </p>
              {createForm.formState.errors.status_value && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.status_value.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="create_label">Etiqueta</Label>
              <Input
                id="create_label"
                placeholder="ej: En proceso"
                data-testid="status_label_input"
                {...createForm.register('label')}
              />
              {createForm.formState.errors.label && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.label.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="create_color">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="create_color"
                  type="color"
                  data-testid="status_color_input"
                  {...createForm.register('color')}
                  className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
                />
                <Input
                  value={createForm.watch('color')}
                  onChange={e => createForm.setValue('color', e.target.value)}
                  placeholder="#3b82f6"
                  className="font-mono"
                />
              </div>
              {createForm.formState.errors.color && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.color.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="create_order">Orden</Label>
              <Input
                id="create_order"
                type="number"
                min={0}
                defaultValue={0}
                data-testid="status_order_input"
                {...createForm.register('order_index', { valueAsNumber: true })}
              />
              {createForm.formState.errors.order_index && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.order_index.message}
                </p>
              )}
            </div>

            <SheetFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createForm.formState.isSubmitting}
                data-testid="save_status_btn"
              >
                {createForm.formState.isSubmitting ? 'Creando...' : 'Crear estado'}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
