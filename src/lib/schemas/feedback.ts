import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido').max(5000, 'Máximo 5000 caracteres'),
});

export type CreateNoteFormData = z.infer<typeof createNoteSchema>;

export const createFeedbackSchema = z.object({
  feedback_type: z.enum(['technical', 'cultural', 'final', 'other'], {
    error: 'Selecciona un tipo de feedback',
  }),
  rating: z
    .number({ error: 'La valoración es requerida' })
    .int()
    .min(1, 'Mínimo 1 estrella')
    .max(5, 'Máximo 5 estrellas'),
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no'], {
    error: 'Selecciona una recomendación',
  }),
  strengths: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  concerns: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  comments: z.string().max(2000, 'Máximo 2000 caracteres'),
  position_id: z.string().optional(),
  is_confidential: z.boolean().default(false),
});

export type CreateFeedbackFormData = z.infer<typeof createFeedbackSchema>;
