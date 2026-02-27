import { z } from 'zod';

const channelSettingsSchema = z.object({
  email: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  new_candidate_assigned: channelSettingsSchema,
  feedback_received: channelSettingsSchema,
  status_change: channelSettingsSchema,
  weekly_summary: channelSettingsSchema,
  system_announcements: channelSettingsSchema,
});

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
