import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const ANY_ROLE = ['recruiter', 'manager', 'hr_admin', 'super_admin'] as const;

/**
 * Verifies the current request is from an active authenticated user
 * with any valid role (recruiter, manager, hr_admin, or super_admin).
 * Used for GET endpoints that all roles need read access to.
 * Returns the user's profile or throws a Response with the error.
 */
export async function verifyAnyRole() {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (
    !profile ||
    !ANY_ROLE.includes(profile.role as (typeof ANY_ROLE)[number]) ||
    !profile.is_active
  ) {
    throw new Response(
      JSON.stringify({
        error: 'Acceso denegado. Se requiere un rol válido.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return { supabase, profile };
}
