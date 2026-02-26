'use client';

import { useRouter } from 'next/navigation';
import { Filter, X, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusOption {
  id: string;
  status_value: string;
  label: string;
  color: string;
}

interface PositionOption {
  id: string;
  title: string;
}

interface PeopleFiltersProps {
  statusDefs: StatusOption[];
  positions: PositionOption[];
  selectedStatuses: string[];
  selectedPosition: string | undefined;
  currentQ: string | undefined;
  isManager: boolean;
}

export function PeopleFilters({
  statusDefs,
  positions,
  selectedStatuses,
  selectedPosition,
  currentQ,
  isManager,
}: PeopleFiltersProps) {
  const router = useRouter();

  const pushParams = (overrides: { status?: string[]; position?: string | undefined }) => {
    const params = new URLSearchParams();
    if (currentQ) params.set('q', currentQ);

    const nextStatuses = overrides.status ?? selectedStatuses;
    const nextPosition = 'position' in overrides ? overrides.position : selectedPosition;

    if (nextStatuses.length > 0) {
      params.set('status', nextStatuses.join(','));
    }
    if (nextPosition) {
      params.set('position', nextPosition);
    }

    const qs = params.toString();
    router.push(`/people${qs ? `?${qs}` : ''}`);
  };

  const toggleStatus = (statusValue: string) => {
    const next = selectedStatuses.includes(statusValue)
      ? selectedStatuses.filter(s => s !== statusValue)
      : [...selectedStatuses, statusValue];
    pushParams({ status: next });
  };

  const clearStatuses = () => pushParams({ status: [] });

  const setPosition = (positionId: string) => {
    pushParams({ position: positionId === 'all' ? undefined : positionId });
  };

  const clearPosition = () => pushParams({ position: undefined });

  const hasActiveFilters = selectedStatuses.length > 0 || !!selectedPosition;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status multi-select filter — PH-33 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            data-testid="filter-status-dropdown"
            className="h-8 gap-1"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Estado</span>
            {selectedStatuses.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 rounded-sm px-1 font-normal"
                data-testid="filter-status-count"
              >
                {selectedStatuses.length}
              </Badge>
            )}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          {statusDefs.map(sd => (
            <DropdownMenuCheckboxItem
              key={sd.id}
              checked={selectedStatuses.includes(sd.status_value)}
              onCheckedChange={() => toggleStatus(sd.status_value)}
              data-testid={`filter-status-option-${sd.status_value}`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: sd.color }}
              />
              {sd.label}
            </DropdownMenuCheckboxItem>
          ))}
          {selectedStatuses.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={clearStatuses}
                data-testid="filter-status-clear"
                className="text-muted-foreground text-xs"
              >
                Limpiar selección
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vacancy single-select filter — PH-34 / PH-35 */}
      <div className="flex items-center gap-1">
        <Select value={selectedPosition ?? 'all'} onValueChange={setPosition}>
          <SelectTrigger
            className="h-8 w-[200px] text-sm"
            data-testid={isManager ? 'vacancy-filter-manager' : 'filter-vacancy-dropdown'}
          >
            <SelectValue placeholder="Todas las vacantes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" data-testid="filter-vacancy-option-all">
              {isManager ? 'Mis vacantes (todas)' : 'Todas las vacantes'}
            </SelectItem>
            {positions.map(p => (
              <SelectItem key={p.id} value={p.id} data-testid={`filter-vacancy-option-${p.id}`}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedPosition && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={clearPosition}
            data-testid="filter-vacancy-clear"
            aria-label="Limpiar filtro de vacante"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Clear all filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={() => pushParams({ status: [], position: undefined })}
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
