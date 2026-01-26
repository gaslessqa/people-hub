/**
 * Supabase Admin Client
 *
 * WARNING: This client bypasses Row Level Security (RLS).
 * Only use this in server-side code where you need admin access.
 * NEVER expose this client to the browser.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { supabaseUrl, supabaseServiceRoleKey } from '../config';

/**
 * Creates a Supabase admin client that bypasses RLS.
 *
 * Use this client only when you need to:
 * - Perform operations that bypass RLS
 * - Access data across all users
 * - Perform admin operations (user management, etc.)
 *
 * @example
 * ```tsx
 * // In an API Route (server-side only)
 * import { createAdminClient } from '@/lib/supabase/admin'
 *
 * export async function POST() {
 *   const supabase = createAdminClient()
 *   // This bypasses RLS
 *   const { data } = await supabase.from('profiles').select('*')
 *   return Response.json(data)
 * }
 * ```
 */
export function createAdminClient() {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for admin operations. ' +
        'This key should only be used on the server.'
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
