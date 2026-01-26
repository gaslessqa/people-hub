/**
 * Supabase Client Exports
 *
 * Use the appropriate client based on your context:
 *
 * - `createClient` from './client' - For Client Components (browser)
 * - `createClient` from './server' - For Server Components & Route Handlers
 * - `createAdminClient` from './admin' - For admin operations (server only, bypasses RLS)
 */

// Re-export for convenience
// Note: Import from specific files to ensure proper code splitting
export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { createAdminClient } from './admin';
