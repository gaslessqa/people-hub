import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PersonStatusBadge } from './person-status-badge';
import { getPersonInitials, SOURCE_LABELS, SOURCE_COLORS } from '@/lib/utils/people';
import type { Person } from '@/lib/types';

interface PersonHeaderProps {
  person: Person;
  currentStatus: { label: string; color: string } | null;
}

export function PersonHeader({ person, currentStatus }: PersonHeaderProps) {
  const initials = getPersonInitials(person);

  return (
    <div className="flex items-start gap-4" data-testid="person_header">
      <Avatar className="h-16 w-16 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {person.first_name} {person.last_name}
          </h1>
          {currentStatus && (
            <PersonStatusBadge label={currentStatus.label} color={currentStatus.color} />
          )}
        </div>

        <a
          href={`mailto:${person.email}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          {person.email}
        </a>

        {person.current_position && person.current_company && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {person.current_position} — {person.current_company}
          </p>
        )}

        {person.source && (
          <div className="mt-2">
            <Badge variant="secondary" className={SOURCE_COLORS[person.source] ?? ''}>
              {SOURCE_LABELS[person.source] ?? person.source}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
