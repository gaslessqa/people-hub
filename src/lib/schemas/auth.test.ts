import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createUserSchema,
  changeRoleSchema,
} from './auth';

// =============================================================================
// Helpers
// =============================================================================

/** Returns messages for errors at a given field path */
function getFieldMessages(
  result: { success: false; error: { issues: { path: (string | number)[]; message: string }[] } },
  field: string
): string[] {
  return result.error.issues.filter(i => i.path[0] === field).map(i => i.message);
}

/** Returns all error messages from a failed parse */
function getAllMessages(result: {
  success: false;
  error: { issues: { message: string }[] };
}): string[] {
  return result.error.issues.map(i => i.message);
}

// =============================================================================
// STORY-PH-6: registerSchema
// =============================================================================

describe('registerSchema', () => {
  const validPayload = {
    full_name: 'Juan García',
    email: 'juan@empresa.com',
    password: 'SecurePass1!',
    confirm_password: 'SecurePass1!',
  };

  describe('Happy path', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 2 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, full_name: 'AB' });
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 100 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, full_name: 'A'.repeat(100) });
      expect(result.success).toBe(true);
    });
  });

  describe('full_name validation', () => {
    it('should reject name shorter than 2 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, full_name: 'A' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'full_name')).toContain(
          'El nombre debe tener al menos 2 caracteres'
        );
      }
    });

    it('should reject name longer than 100 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, full_name: 'A'.repeat(101) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'full_name')).toContain(
          'El nombre no puede exceder 100 caracteres'
        );
      }
    });

    it('should reject empty name', () => {
      const result = registerSchema.safeParse({ ...validPayload, full_name: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const result = registerSchema.safeParse({ ...validPayload, email: 'no-es-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'email')).toContain('Por favor ingresa un email válido');
      }
    });

    it('should reject email without domain', () => {
      const result = registerSchema.safeParse({ ...validPayload, email: 'user@' });
      expect(result.success).toBe(false);
    });

    it('should reject email without @', () => {
      const result = registerSchema.safeParse({ ...validPayload, email: 'usersindoble.com' });
      expect(result.success).toBe(false);
    });
  });

  describe('password policy (TC-03 parametrized)', () => {
    it('should reject password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'Ab1!',
        confirm_password: 'Ab1!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe tener al menos 8 caracteres'
        );
      }
    });

    it('should reject password without uppercase letter', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'lowercase1!',
        confirm_password: 'lowercase1!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe contener al menos una letra mayúscula'
        );
      }
    });

    it('should reject password without lowercase letter', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'UPPERCASE1!',
        confirm_password: 'UPPERCASE1!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe contener al menos una letra minúscula'
        );
      }
    });

    it('should reject password without a number', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'NoNumbers!',
        confirm_password: 'NoNumbers!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe contener al menos un número'
        );
      }
    });

    it('should reject password without a special character', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'NoSpecial1',
        confirm_password: 'NoSpecial1',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe contener al menos un carácter especial'
        );
      }
    });

    it('should accept password with all required characteristics', () => {
      const validPasswords = ['SecurePass1!', 'MyP@ssw0rd', 'Test#1234', 'Hello$World9'];
      for (const password of validPasswords) {
        const result = registerSchema.safeParse({
          ...validPayload,
          password,
          confirm_password: password,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('password confirmation (.refine)', () => {
    it('should reject when passwords do not match', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'SecurePass1!',
        confirm_password: 'DifferentPass1!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'confirm_password')).toContain(
          'Las contraseñas no coinciden'
        );
      }
    });

    it('should accept when passwords match exactly', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'SecurePass1!',
        confirm_password: 'SecurePass1!',
      });
      expect(result.success).toBe(true);
    });

    it('should be case-sensitive in password matching', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'SecurePass1!',
        confirm_password: 'securepass1!',
      });
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// STORY-PH-7: loginSchema
// =============================================================================

describe('loginSchema', () => {
  const validPayload = {
    email: 'admin@peoplehub.dev',
    password: 'Admin123!',
  };

  describe('Happy path', () => {
    it('should accept valid login credentials', () => {
      const result = loginSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({ ...validPayload, email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'email')).toContain('Por favor ingresa un email válido');
      }
    });

    it('should reject empty email', () => {
      const result = loginSchema.safeParse({ ...validPayload, email: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('should reject empty password', () => {
      const result = loginSchema.safeParse({ ...validPayload, password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain('La contraseña es requerida');
      }
    });

    it('should accept any non-empty password (no policy check on login)', () => {
      // Login schema does NOT enforce password policy — that is for registration
      const result = loginSchema.safeParse({ ...validPayload, password: 'simple' });
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// STORY-PH-8: forgotPasswordSchema + resetPasswordSchema
// =============================================================================

describe('forgotPasswordSchema', () => {
  it('should accept valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@domain.com' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'no-valido' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFieldMessages(result, 'email')).toContain('Por favor ingresa un email válido');
    }
  });

  it('should reject empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const validPayload = {
    password: 'NewSecure1!',
    confirm_password: 'NewSecure1!',
  };

  describe('Happy path', () => {
    it('should accept valid new password with matching confirmation', () => {
      const result = resetPasswordSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });
  });

  describe('password policy (TC-06 parametrized)', () => {
    it('should reject password shorter than 8 characters', () => {
      const result = resetPasswordSchema.safeParse({ password: 'Ab1!', confirm_password: 'Ab1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe tener al menos 8 caracteres'
        );
      }
    });

    it('should reject password without uppercase', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'nouppercase1!',
        confirm_password: 'nouppercase1!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe contener al menos una letra mayúscula'
        );
      }
    });

    it('should reject password without lowercase', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NOLOWERCASE1!',
        confirm_password: 'NOLOWERCASE1!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe contener al menos una letra minúscula'
        );
      }
    });

    it('should reject password without a number', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NoNumber!',
        confirm_password: 'NoNumber!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe contener al menos un número'
        );
      }
    });

    it('should reject password without special character', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NoSpecial1',
        confirm_password: 'NoSpecial1',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'password')).toContain(
          'La contraseña debe contener al menos un carácter especial'
        );
      }
    });
  });

  describe('password confirmation (.refine)', () => {
    it('should reject when passwords do not match', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewSecure1!',
        confirm_password: 'OtherPass2@',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'confirm_password')).toContain(
          'Las contraseñas no coinciden'
        );
      }
    });

    it('should accept matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewSecure1!',
        confirm_password: 'NewSecure1!',
      });
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// STORY-PH-9: createUserSchema
// =============================================================================

describe('createUserSchema', () => {
  const validPayload = {
    full_name: 'Ana López',
    email: 'ana@empresa.com',
    role: 'recruiter' as const,
  };

  describe('Happy path', () => {
    it('should accept valid user data with recruiter role', () => {
      expect(createUserSchema.safeParse(validPayload).success).toBe(true);
    });

    it('should accept all valid roles', () => {
      const roles = ['recruiter', 'manager', 'hr_admin', 'super_admin'] as const;
      for (const role of roles) {
        const result = createUserSchema.safeParse({ ...validPayload, role });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('role validation', () => {
    it('should reject invalid role', () => {
      const result = createUserSchema.safeParse({ ...validPayload, role: 'god_mode' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getAllMessages(result)).toContain('Por favor selecciona un rol válido');
      }
    });

    it('should reject empty role string', () => {
      const result = createUserSchema.safeParse({ ...validPayload, role: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('full_name validation', () => {
    it('should reject name shorter than 2 characters', () => {
      const result = createUserSchema.safeParse({ ...validPayload, full_name: 'X' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'full_name')).toContain(
          'El nombre debe tener al menos 2 caracteres'
        );
      }
    });

    it('should reject name longer than 100 characters', () => {
      const result = createUserSchema.safeParse({ ...validPayload, full_name: 'X'.repeat(101) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'full_name')).toContain(
          'El nombre no puede exceder 100 caracteres'
        );
      }
    });
  });

  describe('email validation', () => {
    it('should reject invalid email', () => {
      const result = createUserSchema.safeParse({ ...validPayload, email: 'invalid' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getFieldMessages(result, 'email')).toContain('Por favor ingresa un email válido');
      }
    });
  });
});

// =============================================================================
// STORY-PH-10: changeRoleSchema
// =============================================================================

describe('changeRoleSchema', () => {
  describe('Happy path', () => {
    it('should accept recruiter role', () => {
      expect(changeRoleSchema.safeParse({ role: 'recruiter' }).success).toBe(true);
    });

    it('should accept manager role', () => {
      expect(changeRoleSchema.safeParse({ role: 'manager' }).success).toBe(true);
    });

    it('should accept hr_admin role', () => {
      expect(changeRoleSchema.safeParse({ role: 'hr_admin' }).success).toBe(true);
    });

    it('should accept super_admin role', () => {
      expect(changeRoleSchema.safeParse({ role: 'super_admin' }).success).toBe(true);
    });
  });

  describe('Role validation', () => {
    it('should reject unknown role value', () => {
      const result = changeRoleSchema.safeParse({ role: 'owner' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(getAllMessages(result)).toContain('Por favor selecciona un rol válido');
      }
    });

    it('should reject null role', () => {
      const result = changeRoleSchema.safeParse({ role: null });
      expect(result.success).toBe(false);
    });

    it('should reject undefined role', () => {
      const result = changeRoleSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject role with wrong casing', () => {
      const result = changeRoleSchema.safeParse({ role: 'Recruiter' });
      expect(result.success).toBe(false);
    });

    it('should reject role with spaces', () => {
      const result = changeRoleSchema.safeParse({ role: 'super admin' });
      expect(result.success).toBe(false);
    });
  });
});
