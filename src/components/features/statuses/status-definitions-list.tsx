'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Edit, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusDefinitionForm, type StatusDefinition } from './status-definition-form';

const TAB_TYPES = [
  { value: 'candidate', label: 'Candidatos' },
  { value: 'employee', label: 'Empleados' },
  { value: 'external', label: 'Externos' },
] as const;

interface StatusDefinitionsListProps {
  initialStatuses: StatusDefinition[];
}

export function StatusDefinitionsList({ initialStatuses }: StatusDefinitionsListProps) {
  const [statuses, setStatuses] = useState<StatusDefinition[]>(initialStatuses);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<StatusDefinition | null>(null);

  function getByType(type: string) {
    return statuses
      .filter(s => s.status_type === type)
      .sort((a, b) => a.order_index - b.order_index);
  }

  function handleEdit(status: StatusDefinition) {
    setEditing(status);
    setSheetOpen(true);
  }

  function handleCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function handleFormSuccess(updated: StatusDefinition) {
    setStatuses(prev => {
      const idx = prev.findIndex(s => s.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
  }

  async function handleToggleActive(status: StatusDefinition) {
    const next = !status.is_active;
    try {
      const response = await fetch(`/api/admin/statuses/${status.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      });

      const data = (await response.json()) as { status?: StatusDefinition; error?: string };

      if (!response.ok) {
        toast.error(data.error ?? 'Error al actualizar el estado.');
        return;
      }

      if (data.status) {
        setStatuses(prev => prev.map(s => (s.id === status.id ? data.status! : s)));
        toast.success(next ? 'Estado activado.' : 'Estado desactivado.');
      }
    } catch {
      toast.error('Error de conexión.');
    }
  }

  async function handleDelete(status: StatusDefinition) {
    try {
      const response = await fetch(`/api/admin/statuses/${status.id}`, { method: 'DELETE' });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(data.error ?? 'Error al eliminar el estado.');
        return;
      }

      setStatuses(prev => prev.filter(s => s.id !== status.id));
      toast.success('Estado eliminado.');
    } catch {
      toast.error('Error de conexión.');
    }
  }

  async function handleReorder(status: StatusDefinition, direction: 'up' | 'down') {
    const siblings = getByType(status.status_type);
    const idx = siblings.findIndex(s => s.id === status.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const swapTarget = siblings[swapIdx];
    const newOrder = status.order_index;
    const swapOrder = swapTarget.order_index;

    // Optimistic update
    setStatuses(prev =>
      prev.map(s => {
        if (s.id === status.id) return { ...s, order_index: swapOrder };
        if (s.id === swapTarget.id) return { ...s, order_index: newOrder };
        return s;
      })
    );

    try {
      await Promise.all([
        fetch(`/api/admin/statuses/${status.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: swapOrder }),
        }),
        fetch(`/api/admin/statuses/${swapTarget.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: newOrder }),
        }),
      ]);
    } catch {
      toast.error('Error al reordenar. Recarga la página.');
    }
  }

  return (
    <div data-testid="statusDefinitionsList">
      <div className="mb-4 flex justify-end">
        <Button onClick={handleCreate} data-testid="add_status_btn">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Estado
        </Button>
      </div>

      <Tabs defaultValue="candidate">
        <TabsList data-testid="status_type_tabs">
          {TAB_TYPES.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} data-testid={`tab_${tab.value}`}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_TYPES.map(tab => {
          const list = getByType(tab.value);
          return (
            <TabsContent key={tab.value} value={tab.value}>
              {list.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay estados configurados para este tipo.
                </p>
              ) : (
                <div className="rounded-md border" data-testid={`status_list_${tab.value}`}>
                  {list.map((status, idx) => (
                    <div
                      key={status.id}
                      className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                      data-testid={`status_row_${status.status_value}`}
                    >
                      {/* Color preview + label */}
                      <span
                        className="inline-block h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{status.label}</span>
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {status.status_value}
                        </span>
                      </div>

                      {/* Active badge */}
                      <Badge
                        variant={status.is_active ? 'default' : 'secondary'}
                        className="shrink-0"
                        data-testid={`status_active_badge_${status.status_value}`}
                      >
                        {status.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>

                      {/* Reorder buttons */}
                      <div className="flex shrink-0 flex-col">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleReorder(status, 'up')}
                          disabled={idx === 0}
                          aria-label="Mover arriba"
                          data-testid={`move_up_${status.status_value}`}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleReorder(status, 'down')}
                          disabled={idx === list.length - 1}
                          aria-label="Mover abajo"
                          data-testid={`move_down_${status.status_value}`}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Actions */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(status)}
                        aria-label={status.is_active ? 'Desactivar' : 'Activar'}
                        data-testid={`toggle_active_${status.status_value}`}
                        title={status.is_active ? 'Desactivar estado' : 'Activar estado'}
                      >
                        <span className="text-xs">{status.is_active ? '⏸' : '▶'}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(status)}
                        aria-label="Editar"
                        data-testid={`edit_status_${status.status_value}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(status)}
                        aria-label="Eliminar"
                        data-testid={`delete_status_${status.status_value}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <StatusDefinitionForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
