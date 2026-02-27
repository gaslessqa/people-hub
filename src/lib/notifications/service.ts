/**
 * Notification service — orchestrates email sending and notification_log writes.
 * Server-side only. Uses admin client to bypass RLS for notification_log.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, type SendEmailOptions } from '@/lib/email/send';
import { getNotificationSettings, isEmailEnabled, type NotificationType } from './types';
import type { Json } from '@/types/supabase';

interface SendNotificationOptions {
  /** Profile ID of the recipient */
  recipientProfileId: string;
  /** Email address of the recipient */
  recipientEmail: string;
  /** Notification type key (used to check preferences) */
  notificationType: NotificationType;
  /** Serializable payload stored in notification_log */
  payload: Record<string, unknown>;
  /** Prebuilt email content */
  email: SendEmailOptions;
}

/**
 * Sends an email notification respecting user preferences and logs the attempt.
 * Non-blocking: errors are caught and logged, never thrown to callers.
 */
export async function sendNotification(options: SendNotificationOptions): Promise<void> {
  const { recipientProfileId, recipientEmail, notificationType, payload, email } = options;

  const adminSupabase = createAdminClient();

  // Fetch user notification preferences
  const { data: prefsRow } = await adminSupabase
    .from('user_preferences')
    .select('notification_settings')
    .eq('user_id', recipientProfileId)
    .maybeSingle();

  const settings = getNotificationSettings(prefsRow?.notification_settings ?? null);
  const emailEnabled = isEmailEnabled(settings, notificationType);

  let isSent = false;
  let sentAt: string | null = null;

  if (emailEnabled) {
    const result = await sendEmail({ ...email, to: recipientEmail });
    isSent = result.success;
    sentAt = isSent ? new Date().toISOString() : null;
  }

  // Log notification attempt (non-blocking, best-effort)
  try {
    await adminSupabase.from('notification_log').insert({
      user_id: recipientProfileId,
      notification_type: notificationType,
      payload: { ...payload, email_enabled: emailEnabled } as Json,
      is_sent: isSent,
      sent_at: sentAt,
    });
  } catch (err) {
    console.error('[notifications] Failed to write notification_log:', err);
  }
}
