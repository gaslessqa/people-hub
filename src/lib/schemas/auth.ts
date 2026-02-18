import { z } from 'zod';

// =============================================================================
// Password validation rules
// =============================================================================

const PASSWORD_MIN_LENGTH = 8;

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial');

// =============================================================================
// STORY-PH-6: User Registration
// =============================================================================

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: z.string().email('Por favor ingresa un email válido'),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine(data => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// =============================================================================
// STORY-PH-7: User Login
// =============================================================================

export const loginSchema = z.object({
  email: z.string().email('Por favor ingresa un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// =============================================================================
// STORY-PH-8: Password Recovery
// =============================================================================

export const forgotPasswordSchema = z.object({
  email: z.string().email('Por favor ingresa un email válido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine(data => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// =============================================================================
// STORY-PH-9: User Management CRUD
// =============================================================================

export const createUserSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string().email('Por favor ingresa un email válido'),
  role: z.enum(['recruiter', 'manager', 'hr_admin', 'super_admin'], {
    error: 'Por favor selecciona un rol válido',
  }),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// =============================================================================
// STORY-PH-10: Role Assignment
// =============================================================================

export const changeRoleSchema = z.object({
  role: z.enum(['recruiter', 'manager', 'hr_admin', 'super_admin'], {
    error: 'Por favor selecciona un rol válido',
  }),
});

export type ChangeRoleFormData = z.infer<typeof changeRoleSchema>;
