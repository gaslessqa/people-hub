import { z } from 'zod';

// =============================================================================
// STORY-PH-12: Create Person Record
// =============================================================================

export const createPersonSchema = z.object({
  first_name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  last_name: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  email: z.string().email('Por favor ingresa un email válido'),
  phone: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional(),
  linkedin_url: z
    .string()
    .url('Por favor ingresa una URL válida (ej: https://linkedin.com/in/...)')
    .optional()
    .or(z.literal('')),
  current_company: z.string().max(100, 'La empresa no puede exceder 100 caracteres').optional(),
  current_position: z.string().max(100, 'El cargo no puede exceder 100 caracteres').optional(),
  location: z.string().max(100, 'La ubicación no puede exceder 100 caracteres').optional(),
  source: z
    .enum(['linkedin', 'referral', 'job_board', 'direct', 'other'], {
      error: 'Por favor selecciona una fuente válida',
    })
    .optional(),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

export type CreatePersonFormData = z.infer<typeof createPersonSchema>;

// =============================================================================
// STORY-PH-15: Edit Person Data
// =============================================================================

export const updatePersonSchema = createPersonSchema.omit({ notes: true }).partial();

export type UpdatePersonFormData = z.infer<typeof updatePersonSchema>;
