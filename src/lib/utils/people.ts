import type { Person } from '@/lib/types';

/**
 * Returns the full display name of a person.
 */
export function getPersonFullName(person: Pick<Person, 'first_name' | 'last_name'>): string {
  return `${person.first_name} ${person.last_name}`;
}

/**
 * Returns initials (two uppercase characters) derived from first and last name.
 */
export function getPersonInitials(person: Pick<Person, 'first_name' | 'last_name'>): string {
  const first = person.first_name?.[0] ?? '';
  const last = person.last_name?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

// Source display config
export const SOURCE_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  referral: 'Referido',
  job_board: 'Portal de Empleo',
  direct: 'Contacto Directo',
  other: 'Otro',
};

export const SOURCE_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-100 text-blue-800',
  referral: 'bg-green-100 text-green-800',
  job_board: 'bg-purple-100 text-purple-800',
  direct: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

// Pipeline stage display labels
export const STAGE_LABELS: Record<string, string> = {
  sourced: 'Identificado',
  contacted: 'Contactado',
  applied: 'Aplicado',
  screening: 'Screening',
  interviewing: 'Entrevistando',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado',
};

// Activity log action type labels
export const ACTION_LABELS: Record<string, string> = {
  person_created: 'Persona registrada',
  status_changed: 'Estado actualizado',
  position_assigned: 'Asignado a vacante',
  note_added: 'Nota agregada',
  feedback_added: 'Feedback registrado',
  user_activated: 'Usuario activado',
  user_deactivated: 'Usuario desactivado',
  user_deleted: 'Usuario eliminado',
};
