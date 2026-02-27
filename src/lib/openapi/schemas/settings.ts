/**
 * Settings + Profiles domain OpenAPI schemas and endpoint registrations
 */

import { registry, z } from '../registry';

// ============================================================================
// Schemas
// ============================================================================

export const NotificationSettingsSchema = z
  .object({
    new_candidate_assigned: z.object({ email: z.boolean() }),
    feedback_received: z.object({ email: z.boolean() }),
    status_change: z.object({ email: z.boolean() }),
    weekly_summary: z.object({ email: z.boolean() }),
    system_announcements: z.object({ email: z.boolean() }),
  })
  .openapi('NotificationSettings');

// ============================================================================
// Endpoint Registrations
// ============================================================================

// GET /profiles
registry.registerPath({
  method: 'get',
  path: '/profiles',
  tags: ['Profiles'],
  summary: 'List profiles',
  description: 'Lightweight profile lookup. Supports role filter.',
  security: [{ cookieAuth: [] }],
  request: {
    query: z.object({
      role: z
        .enum(['recruiter', 'manager', 'hr_admin', 'super_admin'])
        .optional()
        .openapi({ description: 'Filter by role' }),
    }),
  },
  responses: {
    200: {
      description: 'Profile list',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              full_name: z.string(),
              email: z.string(),
              role: z.string(),
            })
          ),
        },
      },
    },
    401: { description: 'Unauthorized' },
  },
});

// GET /settings/notifications
registry.registerPath({
  method: 'get',
  path: '/settings/notifications',
  tags: ['Settings'],
  summary: 'Get notification preferences',
  description: 'Returns current user notification settings. Defaults returned if not configured.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Notification settings',
      content: { 'application/json': { schema: NotificationSettingsSchema } },
    },
    401: { description: 'Unauthorized' },
  },
});

// PUT /settings/notifications
registry.registerPath({
  method: 'put',
  path: '/settings/notifications',
  tags: ['Settings'],
  summary: 'Update notification preferences',
  description: 'Upserts notification preferences for the current user.',
  security: [{ cookieAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: NotificationSettingsSchema } } },
  },
  responses: {
    200: {
      description: 'Settings saved',
      content: { 'application/json': { schema: NotificationSettingsSchema } },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});
