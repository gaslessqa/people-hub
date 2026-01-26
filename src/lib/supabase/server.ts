/**
 * Supabase Server Client
 *
 * Use this client in Server Components, Server Actions, and Route Handlers.
 * This client runs on the server and handles cookie-based auth.
 *
 * IMPORTANT: In Next.js 15+, cookies() is async. This client uses await.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { supabaseUrl, supabaseAnonKey } from '../config';

/**
 * Creates a Supabase client for server-side usage.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('people').select('*')
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In a Route Handler
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function GET() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('people').select('*')
 *   return Response.json(data)
 * }
 * ```
 */
export async function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Check your environment variables.');
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
