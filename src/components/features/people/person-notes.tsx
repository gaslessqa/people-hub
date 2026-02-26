'use client';

import { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NoteWithAuthor {
  id: string;
  person_id: string;
  created_by: string;
  created_by_name: string | null;
  content: string;
  is_private: boolean;
  created_at: string;
}

interface PersonNotesProps {
  personId: string;
  initialNotes: NoteWithAuthor[];
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

export function PersonNotes({ personId, initialNotes }: PersonNotesProps) {
  const [notes, setNotes] = useState<NoteWithAuthor[]>(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const MAX_CHARS = 5000;

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error('El contenido no puede estar vacío');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/people/${personId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Error al guardar la nota');
        return;
      }

      setNotes(prev => [data as NoteWithAuthor, ...prev]);
      setContent('');
      setShowForm(false);
      toast.success('Nota guardada');
    } catch {
      toast.error('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notas ({notes.length})
          </CardTitle>
          {!showForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
              data-testid="note-add-button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar nota
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add note form */}
        {showForm && (
          <div className="space-y-2 rounded-md border p-3 bg-muted/30">
            <Textarea
              placeholder="Escribe una nota sobre esta persona..."
              value={content}
              onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
              rows={4}
              className="resize-none"
              data-testid="note-content-input"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.length}/{MAX_CHARS}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setContent('');
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !content.trim()}
                  data-testid="note-save-button"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground py-2">No hay notas aún.</p>
        ) : (
          <ol className="space-y-3">
            {notes.map(note => (
              <li
                key={note.id}
                className="rounded-md border p-3 text-sm"
                data-testid={`note-item-${note.id}`}
              >
                <p className="whitespace-pre-wrap">{note.content}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  {note.created_by_name && <span>por {note.created_by_name}</span>}
                  {note.created_by_name && <span>·</span>}
                  <time
                    dateTime={note.created_at}
                    title={new Date(note.created_at).toLocaleString('es-ES')}
                  >
                    {formatRelativeDate(note.created_at)}
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
