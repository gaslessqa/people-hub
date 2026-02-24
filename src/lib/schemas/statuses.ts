import { z } from 'zod';

export const createStatusSchema = z.object({
  status_type: z.enum(['candidate', 'employee', 'external'], {
    error: 'El tipo de estado es requerido.',
  }),
  status_value: z
    .string()
    .min(1, 'El valor del estado es requerido.')
    .max(50, 'El valor no puede exceder 50 caracteres.')
    .regex(/^[a-z0-9_]+$/, 'Solo se permiten letras minúsculas, números y guiones bajos.'),
  label: z
    .string()
    .min(1, 'La etiqueta es requerida.')
    .max(50, 'La etiqueta no puede exceder 50 caracteres.'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un valor hexadecimal válido (ej: #3b82f6).'),
  order_index: z
    .number({ error: 'El orden debe ser un número.' })
    .int('El orden debe ser un número entero.')
    .min(0, 'El orden debe ser mayor o igual a 0.'),
});

export const updateStatusSchema = z.object({
  label: z
    .string()
    .min(1, 'La etiqueta es requerida.')
    .max(50, 'La etiqueta no puede exceder 50 caracteres.')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un valor hexadecimal válido (ej: #3b82f6).')
    .optional(),
  order_index: z
    .number({ error: 'El orden debe ser un número.' })
    .int('El orden debe ser un número entero.')
    .min(0, 'El orden debe ser mayor o igual a 0.')
    .optional(),
  is_active: z.boolean().optional(),
});

export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
