/**
 * Supabase Browser Client
 *
 * Use this client in Client Components (components with 'use client' directive).
 * This client runs in the browser and uses the anon key.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { supabaseUrl, supabaseAnonKey } from '../config';

/**
 * Creates a Supabase client for browser/client-side usage.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * export function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase client...
 * }
 * ```
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Check your environment variables.');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
