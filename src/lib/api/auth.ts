import { createClient } from '@/lib/supabase/server';
import { unauthorizedError } from './responses';

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: unauthorizedError() };
  }

  return { user, error: null };
}

export async function requireAuth() {
  const { user, error } = await getAuthenticatedUser();

  if (error) {
    throw error;
  }

  return user!;
}
