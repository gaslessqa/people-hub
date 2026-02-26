'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface PersonResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  current_position: string | null;
  current_company: string | null;
}

interface AssignCandidateSheetProps {
  positionId: string;
  positionTitle: string;
}

const SEARCH_DEBOUNCE_MS = 300;

export function AssignCandidateSheet({ positionId, positionTitle }: AssignCandidateSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PersonResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/people/search?q=${encodeURIComponent(trimmed)}&limit=10`);
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data: PersonResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleAssign = async (person: PersonResult) => {
    setAssigningId(person.id);
    try {
      const res = await fetch(`/api/positions/${positionId}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person_id: person.id }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? 'Error al asignar candidato');
        return;
      }

      toast.success(`${person.first_name} ${person.last_name} asignado correctamente`);
      setOpen(false);
      setQuery('');
      setResults([]);
      router.refresh();
    } finally {
      setAssigningId(null);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setQuery('');
      setResults([]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button data-testid="assign-candidate-btn">
          <UserPlus className="mr-2 h-4 w-4" />
          Asignar Candidato
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Asignar Candidato</SheetTitle>
          <SheetDescription>
            Busca y asigna una persona al pipeline de &quot;{positionTitle}&quot;.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              className="pl-10"
              value={query}
              onChange={e => setQuery(e.target.value)}
              data-testid="assign-candidate-search-input"
              autoFocus
            />
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Buscando...
            </div>
          )}

          {!isSearching && results.length === 0 && query.trim().length >= 2 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No se encontraron personas para &quot;{query}&quot;
            </p>
          )}

          {!isSearching && query.trim().length < 2 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Escribe al menos 2 caracteres para buscar
            </p>
          )}

          <ul className="space-y-2">
            {results.map(person => (
              <li
                key={person.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {person.first_name} {person.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{person.email}</p>
                  {person.current_position && (
                    <p className="text-xs text-muted-foreground truncate">
                      {person.current_position}
                      {person.current_company ? ` @ ${person.current_company}` : ''}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  className="ml-3 shrink-0"
                  disabled={assigningId === person.id}
                  onClick={() => handleAssign(person)}
                  data-testid={`assign-btn-${person.id}`}
                >
                  {assigningId === person.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Asignar'
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
