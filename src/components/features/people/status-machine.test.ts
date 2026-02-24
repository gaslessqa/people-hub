import { describe, it, expect } from 'vitest';
import { VALID_TRANSITIONS, getValidNextStatuses, isValidTransition } from './status-machine';

// =============================================================================
// STORY-PH-16: Status Machine
// =============================================================================

describe('VALID_TRANSITIONS', () => {
  it('should define transitions for all candidate statuses', () => {
    const candidateStatuses = [
      'lead',
      'applied',
      'screening',
      'interviewing',
      'finalist',
      'offer',
      'hired',
    ];
    for (const status of candidateStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status);
    }
  });

  it('should define transitions for all employee statuses', () => {
    const employeeStatuses = ['active', 'probation', 'on_leave'];
    for (const status of employeeStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status);
    }
  });

  it('should define empty arrays for terminal statuses', () => {
    const terminalStatuses = ['rejected', 'withdrawn', 'terminated'];
    for (const status of terminalStatuses) {
      expect(VALID_TRANSITIONS[status]).toEqual([]);
    }
  });
});

describe('getValidNextStatuses', () => {
  describe('Candidate pipeline', () => {
    it('lead → [applied, rejected]', () => {
      expect(getValidNextStatuses('lead')).toEqual(['applied', 'rejected']);
    });

    it('applied → [screening, rejected, withdrawn]', () => {
      expect(getValidNextStatuses('applied')).toEqual(['screening', 'rejected', 'withdrawn']);
    });

    it('screening → [interviewing, rejected, withdrawn]', () => {
      expect(getValidNextStatuses('screening')).toEqual(['interviewing', 'rejected', 'withdrawn']);
    });

    it('interviewing → [finalist, rejected, withdrawn]', () => {
      expect(getValidNextStatuses('interviewing')).toEqual(['finalist', 'rejected', 'withdrawn']);
    });

    it('finalist → [offer, rejected]', () => {
      expect(getValidNextStatuses('finalist')).toEqual(['offer', 'rejected']);
    });

    it('offer → [hired, rejected, withdrawn]', () => {
      expect(getValidNextStatuses('offer')).toEqual(['hired', 'rejected', 'withdrawn']);
    });

    it('hired → [active, terminated] (transition to employee)', () => {
      expect(getValidNextStatuses('hired')).toEqual(['active', 'terminated']);
    });
  });

  describe('Terminal candidate states', () => {
    it('rejected → [] (terminal)', () => {
      expect(getValidNextStatuses('rejected')).toEqual([]);
    });

    it('withdrawn → [] (terminal)', () => {
      expect(getValidNextStatuses('withdrawn')).toEqual([]);
    });
  });

  describe('Employee pipeline', () => {
    it('active → [probation, on_leave, terminated]', () => {
      expect(getValidNextStatuses('active')).toEqual(['probation', 'on_leave', 'terminated']);
    });

    it('probation → [active, terminated]', () => {
      expect(getValidNextStatuses('probation')).toEqual(['active', 'terminated']);
    });

    it('on_leave → [active, terminated]', () => {
      expect(getValidNextStatuses('on_leave')).toEqual(['active', 'terminated']);
    });

    it('terminated → [] (terminal)', () => {
      expect(getValidNextStatuses('terminated')).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('unknown status → [] (safe fallback)', () => {
      expect(getValidNextStatuses('unknown_status')).toEqual([]);
    });

    it('empty string → []', () => {
      expect(getValidNextStatuses('')).toEqual([]);
    });
  });
});

describe('isValidTransition', () => {
  describe('Valid transitions — Happy path', () => {
    it('lead → applied is valid', () => {
      expect(isValidTransition('lead', 'applied')).toBe(true);
    });

    it('lead → rejected is valid', () => {
      expect(isValidTransition('lead', 'rejected')).toBe(true);
    });

    it('applied → screening is valid', () => {
      expect(isValidTransition('applied', 'screening')).toBe(true);
    });

    it('applied → withdrawn is valid', () => {
      expect(isValidTransition('applied', 'withdrawn')).toBe(true);
    });

    it('screening → interviewing is valid', () => {
      expect(isValidTransition('screening', 'interviewing')).toBe(true);
    });

    it('interviewing → finalist is valid', () => {
      expect(isValidTransition('interviewing', 'finalist')).toBe(true);
    });

    it('interviewing → rejected is valid', () => {
      expect(isValidTransition('interviewing', 'rejected')).toBe(true);
    });

    it('finalist → offer is valid', () => {
      expect(isValidTransition('finalist', 'offer')).toBe(true);
    });

    it('offer → hired is valid', () => {
      expect(isValidTransition('offer', 'hired')).toBe(true);
    });

    it('hired → active is valid (candidate to employee)', () => {
      expect(isValidTransition('hired', 'active')).toBe(true);
    });

    it('active → on_leave is valid', () => {
      expect(isValidTransition('active', 'on_leave')).toBe(true);
    });

    it('probation → active is valid', () => {
      expect(isValidTransition('probation', 'active')).toBe(true);
    });

    it('on_leave → active is valid', () => {
      expect(isValidTransition('on_leave', 'active')).toBe(true);
    });
  });

  describe('Invalid transitions — Sad path', () => {
    it('lead → hired is NOT valid (skips stages)', () => {
      expect(isValidTransition('lead', 'hired')).toBe(false);
    });

    it('lead → screening is NOT valid (skips applied)', () => {
      expect(isValidTransition('lead', 'screening')).toBe(false);
    });

    it('applied → offer is NOT valid (skips stages)', () => {
      expect(isValidTransition('applied', 'offer')).toBe(false);
    });

    it('rejected → applied is NOT valid (terminal state)', () => {
      expect(isValidTransition('rejected', 'applied')).toBe(false);
    });

    it('rejected → lead is NOT valid (terminal state)', () => {
      expect(isValidTransition('rejected', 'lead')).toBe(false);
    });

    it('withdrawn → screening is NOT valid (terminal state)', () => {
      expect(isValidTransition('withdrawn', 'screening')).toBe(false);
    });

    it('terminated → active is NOT valid (terminal state)', () => {
      expect(isValidTransition('terminated', 'active')).toBe(false);
    });

    it('hired → lead is NOT valid (backward transition)', () => {
      expect(isValidTransition('hired', 'lead')).toBe(false);
    });

    it('screening → lead is NOT valid (backward transition)', () => {
      expect(isValidTransition('screening', 'lead')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('unknown status → any is NOT valid', () => {
      expect(isValidTransition('ghost_status', 'applied')).toBe(false);
    });

    it('any → same status is NOT valid (no self-transitions)', () => {
      expect(isValidTransition('lead', 'lead')).toBe(false);
      expect(isValidTransition('active', 'active')).toBe(false);
    });
  });
});
