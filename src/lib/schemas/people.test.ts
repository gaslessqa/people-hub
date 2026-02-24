import { describe, it, expect } from 'vitest';
import { createPersonSchema, updatePersonSchema } from './people';

// =============================================================================
// Helpers
// =============================================================================

function getFieldMessages(
  result: { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } },
  field: string
): string[] {
  return result.error.issues.filter(i => i.path[0] === field).map(i => i.message);
}

// =============================================================================
// STORY-PH-12: createPersonSchema
// =============================================================================

describe('createPersonSchema', () => {
  const validPayload = {
    first_name: 'María',
    last_name: 'García',
    email: 'maria@empresa.com',
  };

  describe('Happy path — required fields', () => {
    it('should accept valid minimal payload (required fields only)', () => {
      const result = createPersonSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should accept complete valid payload with all optional fields', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        phone: '+34 600 000 000',
        linkedin_url: 'https://linkedin.com/in/maria-garcia',
        current_company: 'Acme Corp',
        current_position: 'Senior Developer',
        location: 'Madrid, España',
        source: 'linkedin',
        notes: 'Referida por Juan López',
      });
      expect(result.success).toBe(true);
    });

    it('should accept an empty string for linkedin_url', () => {
      const result = createPersonSchema.safeParse({ ...validPayload, linkedin_url: '' });
      expect(result.success).toBe(true);
    });

    it('should accept all valid source values', () => {
      const sources = ['linkedin', 'referral', 'job_board', 'direct', 'other'] as const;
      for (const source of sources) {
        const result = createPersonSchema.safeParse({ ...validPayload, source });
        expect(result.success).toBe(true);
      }
    });

    it('should accept payload without source (optional)', () => {
      const result = createPersonSchema.safeParse({ ...validPayload });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBeUndefined();
      }
    });
  });

  describe('first_name validation', () => {
    it('should reject empty first_name', () => {
      const result = createPersonSchema.safeParse({ ...validPayload, first_name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'first_name')).toContain('El nombre es requerido');
      }
    });

    it('should reject first_name longer than 100 characters', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        first_name: 'A'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'first_name')).toContain(
          'El nombre no puede exceder 100 caracteres'
        );
      }
    });

    it('should accept first_name with exactly 100 characters', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        first_name: 'A'.repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('last_name validation', () => {
    it('should reject empty last_name', () => {
      const result = createPersonSchema.safeParse({ ...validPayload, last_name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'last_name')).toContain('El apellido es requerido');
      }
    });

    it('should reject last_name longer than 100 characters', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        last_name: 'B'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'last_name')).toContain(
          'El apellido no puede exceder 100 caracteres'
        );
      }
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const result = createPersonSchema.safeParse({ ...validPayload, email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'email')).toContain('Por favor ingresa un email válido');
      }
    });

    it('should reject email without domain', () => {
      const result = createPersonSchema.safeParse({ ...validPayload, email: 'user@' });
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = createPersonSchema.safeParse({ ...validPayload, email: '' });
      expect(result.success).toBe(false);
    });

    it('should accept email with subdomain', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        email: 'user@mail.empresa.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('phone validation', () => {
    it('should reject phone longer than 20 characters', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        phone: '1'.repeat(21),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'phone')).toContain(
          'El teléfono no puede exceder 20 caracteres'
        );
      }
    });

    it('should accept phone with exactly 20 characters', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        phone: '1'.repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it('should accept undefined phone (optional)', () => {
      const result = createPersonSchema.safeParse({ ...validPayload });
      expect(result.success).toBe(true);
    });
  });

  describe('linkedin_url validation', () => {
    it('should reject an invalid URL format', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        linkedin_url: 'not-a-url',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'linkedin_url')).toContain(
          'Por favor ingresa una URL válida (ej: https://linkedin.com/in/...)'
        );
      }
    });

    it('should accept a valid https URL', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        linkedin_url: 'https://linkedin.com/in/maria-garcia',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty string for linkedin_url', () => {
      const result = createPersonSchema.safeParse({ ...validPayload, linkedin_url: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('source validation', () => {
    it('should reject an invalid source value', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        source: 'twitter',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'source')).toContain(
          'Por favor selecciona una fuente válida'
        );
      }
    });

    it('should reject source with wrong casing', () => {
      const result = createPersonSchema.safeParse({ ...validPayload, source: 'LinkedIn' });
      expect(result.success).toBe(false);
    });
  });

  describe('notes validation', () => {
    it('should reject notes longer than 500 characters', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        notes: 'N'.repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'notes')).toContain(
          'Las notas no pueden exceder 500 caracteres'
        );
      }
    });

    it('should accept notes with exactly 500 characters', () => {
      const result = createPersonSchema.safeParse({
        ...validPayload,
        notes: 'N'.repeat(500),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('required fields — missing values', () => {
    it('should reject payload missing first_name', () => {
      const result = createPersonSchema.safeParse({ last_name: 'García', email: 'a@b.com' });
      expect(result.success).toBe(false);
    });

    it('should reject payload missing last_name', () => {
      const result = createPersonSchema.safeParse({ first_name: 'María', email: 'a@b.com' });
      expect(result.success).toBe(false);
    });

    it('should reject payload missing email', () => {
      const result = createPersonSchema.safeParse({ first_name: 'María', last_name: 'García' });
      expect(result.success).toBe(false);
    });

    it('should reject empty payload', () => {
      const result = createPersonSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// STORY-PH-15: updatePersonSchema
// =============================================================================

describe('updatePersonSchema', () => {
  describe('Happy path — partial updates', () => {
    it('should accept an empty object (no changes)', () => {
      const result = updatePersonSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept updating only first_name', () => {
      const result = updatePersonSchema.safeParse({ first_name: 'Juan' });
      expect(result.success).toBe(true);
    });

    it('should accept updating only email', () => {
      const result = updatePersonSchema.safeParse({ email: 'nuevo@empresa.com' });
      expect(result.success).toBe(true);
    });

    it('should accept updating multiple fields at once', () => {
      const result = updatePersonSchema.safeParse({
        first_name: 'Pedro',
        last_name: 'Martínez',
        current_company: 'Nueva Empresa',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Validation still applies to provided fields', () => {
    it('should reject invalid email when email is provided', () => {
      const result = updatePersonSchema.safeParse({ email: 'not-valid' });
      expect(result.success).toBe(false);
    });

    it('should reject first_name exceeding 100 characters', () => {
      const result = updatePersonSchema.safeParse({ first_name: 'A'.repeat(101) });
      expect(result.success).toBe(false);
    });

    it('should reject invalid source when source is provided', () => {
      const result = updatePersonSchema.safeParse({ source: 'unknown' });
      expect(result.success).toBe(false);
    });
  });

  describe('notes field excluded', () => {
    it('should not have notes field in updatePersonSchema', () => {
      // updatePersonSchema omits notes — providing it should be ignored or rejected
      const schema = updatePersonSchema.shape;
      expect('notes' in schema).toBe(false);
    });
  });
});
