/**
 * People domain OpenAPI schemas and endpoint registrations
 */

import { registry, z } from '../registry';

// ============================================================================
// Schemas
// ============================================================================

export const PersonSchema = z
  .object({
    id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    first_name: z.string().openapi({ example: 'Ana' }),
    last_name: z.string().openapi({ example: 'García' }),
    email: z.string().openapi({ example: 'ana@empresa.com' }),
    phone: z.string().nullable().openapi({ example: '+34 600 000 000' }),
    linkedin_url: z.string().nullable(),
    current_company: z.string().nullable(),
    current_position: z.string().nullable(),
    location: z.string().nullable(),
    source: z.enum(['linkedin', 'referral', 'job_board', 'direct', 'other']).nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('Person');

export const CreatePersonBodySchema = z
  .object({
    first_name: z.string().min(1).openapi({ example: 'Ana' }),
    last_name: z.string().min(1).openapi({ example: 'García' }),
    email: z.string().email().openapi({ example: 'ana@empresa.com' }),
    phone: z.string().optional(),
    linkedin_url: z.string().optional(),
    current_company: z.string().optional(),
    current_position: z.string().optional(),
    location: z.string().optional(),
    source: z.enum(['linkedin', 'referral', 'job_board', 'direct', 'other']).optional(),
  })
  .openapi('CreatePersonBody');

export const NoteSchema = z
  .object({
    id: z.string(),
    person_id: z.string(),
    content: z.string(),
    is_private: z.boolean(),
    created_at: z.string(),
    created_by: z.string(),
    author_name: z.string().nullable().optional(),
  })
  .openapi('Note');

export const FeedbackSchema = z
  .object({
    id: z.string(),
    person_id: z.string(),
    position_id: z.string().nullable(),
    given_by: z.string(),
    given_by_name: z.string().nullable().optional(),
    feedback_type: z.enum(['technical', 'cultural', 'final', 'other']),
    rating: z.number().min(1).max(5),
    recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
    strengths: z.string().nullable(),
    concerns: z.string().nullable(),
    comments: z.string(),
    is_confidential: z.boolean(),
    created_at: z.string(),
  })
  .openapi('Feedback');

export const PersonStatusSchema = z
  .object({
    id: z.string(),
    person_id: z.string(),
    status_definition_id: z.string(),
    comment: z.string().nullable(),
    changed_by: z.string(),
    created_at: z.string(),
  })
  .openapi('PersonStatus');

// ============================================================================
// Endpoint Registrations
// ============================================================================

// GET /people
registry.registerPath({
  method: 'get',
  path: '/people',
  tags: ['People'],
  summary: 'List people',
  description:
    'Returns a paginated list of people, filterable by search query, status, and position.',
  security: [{ cookieAuth: [] }],
  request: {
    query: z.object({
      q: z.string().optional().openapi({ description: 'Search query (name, email, company)' }),
      status: z.string().optional().openapi({ description: 'Comma-separated status values' }),
      position: z.string().optional().openapi({ description: 'Filter by position UUID' }),
    }),
  },
  responses: {
    200: {
      description: 'List of people',
      content: { 'application/json': { schema: z.array(PersonSchema) } },
    },
    401: { description: 'Unauthorized' },
  },
});

// POST /people
registry.registerPath({
  method: 'post',
  path: '/people',
  tags: ['People'],
  summary: 'Create person',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreatePersonBodySchema } },
    },
  },
  responses: {
    201: {
      description: 'Person created',
      content: { 'application/json': { schema: PersonSchema } },
    },
    400: { description: 'Validation error or duplicate email' },
    401: { description: 'Unauthorized' },
  },
});

// GET /people/search
registry.registerPath({
  method: 'get',
  path: '/people/search',
  tags: ['People'],
  summary: 'Search people',
  security: [{ cookieAuth: [] }],
  request: {
    query: z.object({
      q: z.string().openapi({ description: 'Search term' }),
      field: z.enum(['name', 'email']).optional().openapi({ description: 'Field to search' }),
      limit: z.string().optional().openapi({ description: 'Max results (default 10)' }),
    }),
  },
  responses: {
    200: {
      description: 'Search results',
      content: { 'application/json': { schema: z.object({ people: z.array(PersonSchema) }) } },
    },
    401: { description: 'Unauthorized' },
  },
});

// GET /people/{id}
registry.registerPath({
  method: 'get',
  path: '/people/{id}',
  tags: ['People'],
  summary: 'Get person by ID',
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Person details with status history, positions, and timeline',
      content: { 'application/json': { schema: PersonSchema } },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Person not found' },
  },
});

// PATCH /people/{id}
registry.registerPath({
  method: 'patch',
  path: '/people/{id}',
  tags: ['People'],
  summary: 'Update person',
  description: 'Partial update. Sends `updated_at` for optimistic concurrency control.',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { 'application/json': { schema: CreatePersonBodySchema.partial() } },
    },
  },
  responses: {
    200: {
      description: 'Updated person',
      content: { 'application/json': { schema: PersonSchema } },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    404: { description: 'Person not found' },
    409: { description: 'Conflict — stale data (optimistic lock)' },
  },
});

// POST /people/{id}/status
registry.registerPath({
  method: 'post',
  path: '/people/{id}/status',
  tags: ['People'],
  summary: 'Change person status',
  description: 'Validates transition via state machine before inserting.',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status_definition_id: z.string(),
            comment: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Status changed',
      content: { 'application/json': { schema: PersonStatusSchema } },
    },
    400: { description: 'Invalid transition or validation error' },
    401: { description: 'Unauthorized' },
    404: { description: 'Person not found' },
  },
});

// GET /people/{id}/notes
registry.registerPath({
  method: 'get',
  path: '/people/{id}/notes',
  tags: ['People'],
  summary: 'Get notes for a person',
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Notes list',
      content: { 'application/json': { schema: z.object({ notes: z.array(NoteSchema) }) } },
    },
    401: { description: 'Unauthorized' },
  },
});

// POST /people/{id}/notes
registry.registerPath({
  method: 'post',
  path: '/people/{id}/notes',
  tags: ['People'],
  summary: 'Add note to person',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            content: z.string().min(1),
            is_private: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: { description: 'Note created', content: { 'application/json': { schema: NoteSchema } } },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Insufficient permissions' },
  },
});

// GET /people/{id}/feedback
registry.registerPath({
  method: 'get',
  path: '/people/{id}/feedback',
  tags: ['People'],
  summary: 'Get feedback for a person',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    query: z.object({
      position_id: z.string().optional().openapi({ description: 'Filter by position UUID' }),
    }),
  },
  responses: {
    200: {
      description: 'Feedback list',
      content: { 'application/json': { schema: z.object({ feedback: z.array(FeedbackSchema) }) } },
    },
    401: { description: 'Unauthorized' },
  },
});

// POST /people/{id}/feedback
registry.registerPath({
  method: 'post',
  path: '/people/{id}/feedback',
  tags: ['People'],
  summary: 'Submit feedback for a person',
  description: 'Only manager, hr_admin, and super_admin can submit feedback.',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            feedback_type: z.enum(['technical', 'cultural', 'final', 'other']),
            rating: z.number().min(1).max(5),
            recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
            comments: z.string(),
            strengths: z.string().optional(),
            concerns: z.string().optional(),
            position_id: z.string().optional(),
            is_confidential: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Feedback submitted',
      content: { 'application/json': { schema: FeedbackSchema } },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Only managers and admins can submit feedback' },
    404: { description: 'Person not found' },
  },
});
