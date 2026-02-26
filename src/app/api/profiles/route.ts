import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { verifyStaff } from '@/lib/api/verify-staff';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * GET /api/profiles?role=manager
 * Returns minimal profile data (id, full_name) filtered by role.
 * Accessible to all staff (recruiter, hr_admin, super_admin).
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await verifyStaff();

    const roleParam = request.nextUrl.searchParams.get('role');
    const VALID_ROLES: UserRole[] = ['recruiter', 'manager', 'hr_admin', 'super_admin'];
    const role =
      roleParam && (VALID_ROLES as string[]).includes(roleParam) ? (roleParam as UserRole) : null;

    let query = supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('is_active', true)
      .order('full_name');

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
