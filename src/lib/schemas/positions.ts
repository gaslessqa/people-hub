import { z } from 'zod';

// =============================================================================
// EPIC-PH-18: Position/Vacancy Management
// =============================================================================

export const createPositionSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  department: z.string().max(100, 'El departamento no puede exceder 100 caracteres').optional(),
  description: z.string().max(5000, 'La descripción no puede exceder 5000 caracteres').optional(),
  requirements: z.string().max(5000, 'Los requisitos no pueden exceder 5000 caracteres').optional(),
  location: z.string().max(100, 'La ubicación no puede exceder 100 caracteres').optional(),
  employment_type: z
    .enum(['full_time', 'part_time', 'contract', 'internship'], {
      error: 'Por favor selecciona un tipo de empleo válido',
    })
    .optional(),
  salary_min: z.number().min(0, 'El salario mínimo no puede ser negativo').optional(),
  salary_max: z.number().min(0, 'El salario máximo no puede ser negativo').optional(),
  salary_currency: z.string().max(10, 'La moneda no puede exceder 10 caracteres').optional(),
  hiring_manager_id: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export type CreatePositionFormData = z.infer<typeof createPositionSchema>;

export const updatePositionSchema = createPositionSchema.partial();

export type UpdatePositionFormData = z.infer<typeof updatePositionSchema>;

export const assignCandidateSchema = z.object({
  person_id: z.string().min(1, 'ID de persona requerido'),
});

export type AssignCandidateData = z.infer<typeof assignCandidateSchema>;

export const updateStageSchema = z.object({
  stage: z.enum(
    ['applied', 'screening', 'interviewing', 'finalist', 'offer', 'hired', 'rejected'],
    { error: 'Etapa inválida' }
  ),
});

export type UpdateStageData = z.infer<typeof updateStageSchema>;

export const closePositionSchema = z.object({
  action: z.enum(['filled', 'cancelled', 'on_hold'], {
    error: 'Acción de cierre inválida',
  }),
  hired_person_id: z.string().optional(),
  reason: z.string().max(500).optional(),
});

export type ClosePositionData = z.infer<typeof closePositionSchema>;
