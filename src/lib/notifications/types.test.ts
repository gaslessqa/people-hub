import { describe, it, expect } from 'vitest';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_TYPES,
  getNotificationSettings,
  isEmailEnabled,
} from './types';

describe('DEFAULT_NOTIFICATION_SETTINGS', () => {
  it('has all notification types enabled by default', () => {
    for (const key of Object.values(NOTIFICATION_TYPES)) {
      expect(DEFAULT_NOTIFICATION_SETTINGS[key].email).toBe(true);
    }
  });

  it('contains all 5 notification types', () => {
    expect(Object.keys(DEFAULT_NOTIFICATION_SETTINGS)).toHaveLength(5);
  });
});

describe('getNotificationSettings', () => {
  it('returns defaults when called with null', () => {
    const result = getNotificationSettings(null);
    expect(result).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
  });

  it('returns defaults when called with undefined', () => {
    const result = getNotificationSettings(undefined);
    expect(result).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
  });

  it('returns defaults when called with non-object', () => {
    expect(getNotificationSettings('invalid')).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
    expect(getNotificationSettings(42)).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
    expect(getNotificationSettings([])).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
  });

  it('overrides a single setting from stored preferences', () => {
    const stored = {
      new_candidate_assigned: { email: false },
    };
    const result = getNotificationSettings(stored);
    expect(result.new_candidate_assigned.email).toBe(false);
    // Other keys should stay as defaults
    expect(result.feedback_received.email).toBe(true);
    expect(result.status_change.email).toBe(true);
  });

  it('overrides all settings when all provided', () => {
    const stored = {
      new_candidate_assigned: { email: false },
      feedback_received: { email: false },
      status_change: { email: false },
      weekly_summary: { email: false },
      system_announcements: { email: false },
    };
    const result = getNotificationSettings(stored);
    for (const key of Object.values(NOTIFICATION_TYPES)) {
      expect(result[key].email).toBe(false);
    }
  });

  it('ignores unknown keys in stored preferences', () => {
    const stored = {
      unknown_key: { email: false },
      new_candidate_assigned: { email: false },
    };
    const result = getNotificationSettings(stored);
    expect(result.new_candidate_assigned.email).toBe(false);
    expect('unknown_key' in result).toBe(false);
  });

  it('treats malformed channel settings as default (true)', () => {
    const stored = {
      new_candidate_assigned: 'invalid',
    };
    const result = getNotificationSettings(stored);
    // Falls back to default
    expect(result.new_candidate_assigned.email).toBe(true);
  });
});

describe('isEmailEnabled', () => {
  it('returns true for a type that is ON', () => {
    const settings = { ...DEFAULT_NOTIFICATION_SETTINGS };
    expect(isEmailEnabled(settings, NOTIFICATION_TYPES.FEEDBACK_RECEIVED)).toBe(true);
  });

  it('returns false for a type that is OFF', () => {
    const settings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      feedback_received: { email: false },
    };
    expect(isEmailEnabled(settings, NOTIFICATION_TYPES.FEEDBACK_RECEIVED)).toBe(false);
  });

  it('returns true as default when type key is missing', () => {
    // Bypass TypeScript to simulate missing key at runtime
    const settings = {} as Parameters<typeof isEmailEnabled>[0];
    expect(isEmailEnabled(settings, NOTIFICATION_TYPES.NEW_CANDIDATE_ASSIGNED)).toBe(true);
  });
});
