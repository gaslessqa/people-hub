/**
 * Admin domain OpenAPI schemas and endpoint registrations
 * Covers: User Management + Status Definitions
 */

import { registry, z } from '../registry';

// ============================================================================
// Schemas
// ============================================================================

export const UserProfileSchema = z
  .object({
    id: z.string(),
    auth_user_id: z.string(),
    full_name: z.string().openapi({ example: 'Ana García' }),
    email: z.string().openapi({ example: 'ana@empresa.com' }),
    role: z.enum(['recruiter', 'manager', 'hr_admin', 'super_admin']),
    is_active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('UserProfile');

export const StatusDefinitionSchema = z
  .object({
    id: z.string(),
    status_type: z.enum(['candidate', 'employee', 'external']),
    status_value: z.string().openapi({ example: 'screening' }),
    label: z.string().openapi({ example: 'En screening' }),
    color: z.string().openapi({ example: '#7c3aed' }),
    order_index: z.number(),
    is_active: z.boolean(),
    created_at: z.string(),
  })
  .openapi('StatusDefinition');

// ============================================================================
// Admin - Users Endpoint Registrations
// ============================================================================

// GET /admin/users
registry.registerPath({
  method: 'get',
  path: '/admin/users',
  tags: ['Admin - Users'],
  summary: 'List all users',
  description: 'Requires super_admin role.',
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
      description: 'List of users',
      content: { 'application/json': { schema: z.array(UserProfileSchema) } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires super_admin' },
  },
});

// POST /admin/users
registry.registerPath({
  method: 'post',
  path: '/admin/users',
  tags: ['Admin - Users'],
  summary: 'Create user',
  description: 'Creates auth user + profile. Requires super_admin.',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            full_name: z.string().min(1),
            email: z.string().email(),
            role: z.enum(['recruiter', 'manager', 'hr_admin', 'super_admin']),
            password: z.string().min(8),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created',
      content: { 'application/json': { schema: UserProfileSchema } },
    },
    400: { description: 'Validation error or duplicate email' },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires super_admin' },
  },
});

// PATCH /admin/users/{id}
registry.registerPath({
  method: 'patch',
  path: '/admin/users/{id}',
  tags: ['Admin - Users'],
  summary: 'Update user',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            full_name: z.string().optional(),
            is_active: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated user',
      content: { 'application/json': { schema: UserProfileSchema } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires super_admin' },
    404: { description: 'User not found' },
  },
});

// DELETE /admin/users/{id}
registry.registerPath({
  method: 'delete',
  path: '/admin/users/{id}',
  tags: ['Admin - Users'],
  summary: 'Delete user',
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'User deleted' },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires super_admin' },
    404: { description: 'User not found' },
  },
});

// PATCH /admin/users/{id}/role
registry.registerPath({
  method: 'patch',
  path: '/admin/users/{id}/role',
  tags: ['Admin - Users'],
  summary: 'Change user role',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            role: z.enum(['recruiter', 'manager', 'hr_admin', 'super_admin']),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Role updated',
      content: { 'application/json': { schema: UserProfileSchema } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires super_admin' },
    404: { description: 'User not found' },
  },
});

// ============================================================================
// Admin - Statuses Endpoint Registrations
// ============================================================================

// GET /admin/statuses
registry.registerPath({
  method: 'get',
  path: '/admin/statuses',
  tags: ['Admin - Statuses'],
  summary: 'List status definitions',
  description: 'Requires hr_admin or super_admin.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Status definitions grouped by type',
      content: { 'application/json': { schema: z.array(StatusDefinitionSchema) } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires hr_admin+' },
  },
});

// POST /admin/statuses
registry.registerPath({
  method: 'post',
  path: '/admin/statuses',
  tags: ['Admin - Statuses'],
  summary: 'Create status definition',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status_type: z.enum(['candidate', 'employee', 'external']),
            status_value: z.string().min(1),
            label: z.string().min(1),
            color: z.string(),
            order_index: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Status created',
      content: { 'application/json': { schema: StatusDefinitionSchema } },
    },
    400: { description: 'Validation error or duplicate' },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires hr_admin+' },
  },
});

// PATCH /admin/statuses/{id}
registry.registerPath({
  method: 'patch',
  path: '/admin/statuses/{id}',
  tags: ['Admin - Statuses'],
  summary: 'Update status definition',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            label: z.string().optional(),
            color: z.string().optional(),
            order_index: z.number().optional(),
            is_active: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated',
      content: { 'application/json': { schema: StatusDefinitionSchema } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires hr_admin+' },
    404: { description: 'Not found' },
  },
});

// DELETE /admin/statuses/{id}
registry.registerPath({
  method: 'delete',
  path: '/admin/statuses/{id}',
  tags: ['Admin - Statuses'],
  summary: 'Soft-delete status definition',
  description: 'Blocked if the status is currently in use.',
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Deactivated' },
    400: { description: 'Status is in use' },
    401: { description: 'Unauthorized' },
    403: { description: 'Requires hr_admin+' },
    404: { description: 'Not found' },
  },
});
