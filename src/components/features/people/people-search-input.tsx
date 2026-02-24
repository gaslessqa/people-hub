'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PeopleSearchInputProps {
  defaultValue?: string;
}

const DEBOUNCE_MS = 300;

export function PeopleSearchInput({ defaultValue = '' }: PeopleSearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = (q: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    const queryString = params.toString();
    router.push(`/people${queryString ? `?${queryString}` : ''}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => pushSearch(q), DEBOUNCE_MS);
  };

  const handleClear = () => {
    setValue('');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    router.push('/people');
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Buscar por nombre, email, empresa..."
        className="pl-10 pr-10"
        value={value}
        onChange={handleChange}
        data-testid="people_search_input"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
