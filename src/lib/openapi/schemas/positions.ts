/**
 * Positions domain OpenAPI schemas and endpoint registrations
 */

import { registry, z } from '../registry';

// ============================================================================
// Schemas
// ============================================================================

export const PositionSchema = z
  .object({
    id: z.string(),
    title: z.string().openapi({ example: 'Senior Frontend Developer' }),
    department: z.string().nullable(),
    description: z.string().nullable(),
    requirements: z.string().nullable(),
    location: z.string().nullable(),
    employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship']).nullable(),
    salary_min: z.number().nullable(),
    salary_max: z.number().nullable(),
    salary_currency: z.string().nullable(),
    hiring_manager_id: z.string().nullable(),
    recruiter_id: z.string().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).nullable(),
    status: z.enum(['open', 'on_hold', 'closed']),
    close_reason: z.enum(['filled', 'cancelled', 'on_hold']).nullable(),
    closed_at: z.string().nullable(),
    hired_person_id: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('Position');

export const CreatePositionBodySchema = z
  .object({
    title: z.string().min(1).max(200).openapi({ example: 'Senior Frontend Developer' }),
    department: z.string().max(100).optional(),
    description: z.string().max(5000).optional(),
    requirements: z.string().max(5000).optional(),
    location: z.string().max(100).optional(),
    employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
    salary_min: z.number().min(0).optional(),
    salary_max: z.number().min(0).optional(),
    salary_currency: z.string().max(10).optional(),
    hiring_manager_id: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  })
  .openapi('CreatePositionBody');

export const PersonPositionSchema = z
  .object({
    id: z.string(),
    person_id: z.string(),
    position_id: z.string(),
    stage: z.enum([
      'applied',
      'screening',
      'interviewing',
      'finalist',
      'offer',
      'hired',
      'rejected',
    ]),
    assigned_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('PersonPosition');

// ============================================================================
// Endpoint Registrations
// ============================================================================

// GET /positions
registry.registerPath({
  method: 'get',
  path: '/positions',
  tags: ['Positions'],
  summary: 'List positions',
  description: 'Returns all positions. Managers see only their own vacancies.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'List of positions',
      content: { 'application/json': { schema: z.array(PositionSchema) } },
    },
    401: { description: 'Unauthorized' },
  },
});

// POST /positions
registry.registerPath({
  method: 'post',
  path: '/positions',
  tags: ['Positions'],
  summary: 'Create position',
  security: [{ cookieAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: CreatePositionBodySchema } } },
  },
  responses: {
    201: {
      description: 'Position created',
      content: { 'application/json': { schema: PositionSchema } },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});

// GET /positions/{id}
registry.registerPath({
  method: 'get',
  path: '/positions/{id}',
  tags: ['Positions'],
  summary: 'Get position by ID',
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Position details with candidates',
      content: { 'application/json': { schema: PositionSchema } },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Position not found' },
  },
});

// PATCH /positions/{id}
registry.registerPath({
  method: 'patch',
  path: '/positions/{id}',
  tags: ['Positions'],
  summary: 'Update position',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: CreatePositionBodySchema.partial() } } },
  },
  responses: {
    200: {
      description: 'Updated position',
      content: { 'application/json': { schema: PositionSchema } },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Position not found' },
  },
});

// POST /positions/{id}/candidates
registry.registerPath({
  method: 'post',
  path: '/positions/{id}/candidates',
  tags: ['Positions'],
  summary: 'Assign candidate to position',
  description:
    'Assigns a person to a position at the `applied` stage. Notifies the hiring manager.',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({ person_id: z.string().min(1) }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Candidate assigned',
      content: { 'application/json': { schema: z.object({ id: z.string() }) } },
    },
    400: { description: 'Position not open or validation error' },
    401: { description: 'Unauthorized' },
    404: { description: 'Position or person not found' },
    409: { description: 'Candidate already assigned' },
  },
});

// PATCH /positions/{id}/candidates/{personId}
registry.registerPath({
  method: 'patch',
  path: '/positions/{id}/candidates/{personId}',
  tags: ['Positions'],
  summary: 'Update candidate pipeline stage',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string(), personId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            stage: z.enum([
              'applied',
              'screening',
              'interviewing',
              'finalist',
              'offer',
              'hired',
              'rejected',
            ]),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Stage updated',
      content: { 'application/json': { schema: PersonPositionSchema } },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    404: { description: 'Assignment not found' },
  },
});

// POST /positions/{id}/close
registry.registerPath({
  method: 'post',
  path: '/positions/{id}/close',
  tags: ['Positions'],
  summary: 'Close a position',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            action: z.enum(['filled', 'cancelled', 'on_hold']),
            hired_person_id: z.string().optional(),
            reason: z.string().max(500).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Position closed',
      content: { 'application/json': { schema: PositionSchema } },
    },
    400: { description: 'Position already closed or validation error' },
    401: { description: 'Unauthorized' },
    404: { description: 'Position not found' },
  },
});
