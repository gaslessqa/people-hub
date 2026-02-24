import { Phone, Linkedin, Building2, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SOURCE_LABELS } from '@/lib/utils/people';
import type { Person } from '@/lib/types';

interface PersonDetailsProps {
  person: Person;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

export function PersonDetails({ person }: PersonDetailsProps) {
  return (
    <Card data-testid="person_basic_info">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Información de Contacto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 divide-y">
        {person.phone && (
          <DetailRow
            icon={<Phone className="h-4 w-4" />}
            label="Teléfono"
            value={
              <a href={`tel:${person.phone}`} className="hover:underline">
                {person.phone}
              </a>
            }
          />
        )}

        {person.linkedin_url && (
          <DetailRow
            icon={<Linkedin className="h-4 w-4" />}
            label="LinkedIn"
            value={
              <a
                href={person.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate block"
              >
                Ver perfil
              </a>
            }
          />
        )}

        {(person.current_company || person.current_position) && (
          <DetailRow
            icon={<Building2 className="h-4 w-4" />}
            label="Empresa actual"
            value={
              <>
                {person.current_company && <span>{person.current_company}</span>}
                {person.current_company && person.current_position && (
                  <span className="text-muted-foreground"> · </span>
                )}
                {person.current_position && (
                  <span className="text-muted-foreground">{person.current_position}</span>
                )}
              </>
            }
          />
        )}

        {person.location && (
          <DetailRow
            icon={<MapPin className="h-4 w-4" />}
            label="Ubicación"
            value={person.location}
          />
        )}

        {person.source && (
          <DetailRow
            icon={<Briefcase className="h-4 w-4" />}
            label="Fuente"
            value={SOURCE_LABELS[person.source] ?? person.source}
          />
        )}

        <DetailRow
          icon={<Calendar className="h-4 w-4" />}
          label="Registrado"
          value={new Date(person.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        />
      </CardContent>
    </Card>
  );
}
