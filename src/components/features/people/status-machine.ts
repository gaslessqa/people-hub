/**
 * State machine for person status transitions.
 * Defines valid transitions between status_value strings.
 */

export const VALID_TRANSITIONS: Record<string, string[]> = {
  // Candidate pipeline
  lead: ['applied', 'rejected'],
  applied: ['screening', 'rejected', 'withdrawn'],
  screening: ['interviewing', 'rejected', 'withdrawn'],
  interviewing: ['finalist', 'rejected', 'withdrawn'],
  finalist: ['offer', 'rejected'],
  offer: ['hired', 'rejected', 'withdrawn'],
  hired: ['active', 'terminated'], // → employee type

  // Terminal candidate states
  rejected: [],
  withdrawn: [],

  // Employee pipeline
  active: ['probation', 'on_leave', 'terminated'],
  probation: ['active', 'terminated'],
  on_leave: ['active', 'terminated'],

  // Terminal employee state
  terminated: [],
};

/**
 * Returns the list of valid next status_value strings from the current status.
 * Returns an empty array for terminal states or unknown statuses.
 */
export function getValidNextStatuses(current: string): string[] {
  return VALID_TRANSITIONS[current] ?? [];
}

/**
 * Returns true if the transition from `from` to `to` is valid.
 */
export function isValidTransition(from: string, to: string): boolean {
  return getValidNextStatuses(from).includes(to);
}
