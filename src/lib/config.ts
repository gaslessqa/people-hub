/**
 * Centralized configuration for People Hub
 * All environment variables are accessed here with validation
 *
 * IMPORTANT: NEXT_PUBLIC_* variables are statically replaced at build time.
 * Always access them directly, never dynamically via process.env[key]
 */

// =============================================================================
// Supabase Configuration
// =============================================================================

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// =============================================================================
// App Configuration
// =============================================================================

export const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// =============================================================================
// Validation
// =============================================================================

/**
 * Validates that required environment variables are set.
 * Call this in server-side code to catch missing config early.
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${errors.join('\n')}\n\n` +
        'Please check your .env file and ensure all required variables are set.\n' +
        'Get your credentials from: https://supabase.com/dashboard/project/ylkwhejmcymlowcqgibn/settings/api'
    );
  }
}

/**
 * Validates server-only configuration.
 * Call this only in server-side code (API routes, server components).
 */
export function validateServerConfig(): void {
  validateConfig();

  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will not work.');
  }
}

// =============================================================================
// Type-safe exports
// =============================================================================

export const config = {
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceRoleKey,
  },
  app: {
    url: appUrl,
  },
} as const;

export default config;
