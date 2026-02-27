/**
 * Notification type constants for EPIC-PH-27.
 * Used as keys in user_preferences.notification_settings JSONB.
 */

export const NOTIFICATION_TYPES = {
  NEW_CANDIDATE_ASSIGNED: 'new_candidate_assigned',
  FEEDBACK_RECEIVED: 'feedback_received',
  STATUS_CHANGE: 'status_change',
  WEEKLY_SUMMARY: 'weekly_summary',
  SYSTEM_ANNOUNCEMENTS: 'system_announcements',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface NotificationChannelSettings {
  email: boolean;
}

export type NotificationSettings = Record<NotificationType, NotificationChannelSettings>;

/** Default settings: all notifications ON */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  new_candidate_assigned: { email: true },
  feedback_received: { email: true },
  status_change: { email: true },
  weekly_summary: { email: true },
  system_announcements: { email: true },
};

export function getNotificationSettings(raw: unknown): NotificationSettings {
  const defaults = { ...DEFAULT_NOTIFICATION_SETTINGS };
  if (!raw || typeof raw !== 'object') return defaults;

  const result = { ...defaults };
  for (const key of Object.keys(defaults) as NotificationType[]) {
    const entry = (raw as Record<string, unknown>)[key];
    if (entry && typeof entry === 'object' && 'email' in entry) {
      result[key] = { email: Boolean((entry as { email: unknown }).email) };
    }
  }
  return result;
}

export function isEmailEnabled(settings: NotificationSettings, type: NotificationType): boolean {
  return settings[type]?.email ?? true;
}
