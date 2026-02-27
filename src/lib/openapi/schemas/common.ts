/**
 * Common OpenAPI Schemas
 * Reusable schemas for error responses, common types, etc.
 */

import { registry, z } from '../registry';

// ============================================================================
// Common Type Schemas
// ============================================================================

export const UUIDSchema = z.string().openapi({
  description: 'UUID identifier',
  example: '550e8400-e29b-41d4-a716-446655440000',
});

export const TimestampSchema = z.string().openapi({
  description: 'ISO 8601 timestamp',
  example: '2025-01-15T10:30:00Z',
});

export const EmailSchema = z.string().email().openapi({
  description: 'Email address',
  example: 'user@example.com',
});

// ============================================================================
// Error Response Schemas
// ============================================================================

export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ description: 'Error message' }),
  })
  .openapi('ErrorResponse');

export const ValidationErrorSchema = z
  .object({
    error: z.string().openapi({ description: 'Validation error message' }),
    details: z
      .record(z.string(), z.array(z.string()))
      .optional()
      .openapi({ description: 'Field-level validation errors' }),
  })
  .openapi('ValidationError');

// ============================================================================
// Register Common Schemas
// ============================================================================

registry.register('ErrorResponse', ErrorResponseSchema);
registry.register('ValidationError', ValidationErrorSchema);

// ============================================================================
// System Endpoints
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Health check',
  description: 'Returns system status. No authentication required.',
  responses: {
    200: {
      description: 'System is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('healthy'),
            timestamp: z.string(),
            environment: z.string(),
          }),
        },
      },
    },
  },
});
