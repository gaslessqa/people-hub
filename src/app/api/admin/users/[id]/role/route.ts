import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySuperAdmin } from '@/lib/api/verify-super-admin';
import { changeRoleSchema } from '@/lib/schemas/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/users/[id]/role - Change a user's role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { profile: adminProfile } = await verifySuperAdmin();

    const body = await request.json();
    const parsed = changeRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Rol inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { role: newRole } = parsed.data;
    const adminClient = createAdminClient();

    // Fetch target profile
    const { data: targetProfile, error: fetchError } = await adminClient
      .from('profiles')
      .select('role, email, is_active')
      .eq('id', id)
      .single();

    if (fetchError || !targetProfile) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // If changing AWAY from super_admin, ensure there's at least one other active super_admin
    if (targetProfile.role === 'super_admin' && newRole !== 'super_admin') {
      const { count } = await adminClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'super_admin')
        .eq('is_active', true);

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'No se puede cambiar el rol: debe existir al menos un Super Admin activo.' },
          { status: 400 }
        );
      }
    }

    // Update role
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    try {
      await adminClient.from('activity_log').insert({
        person_id: null,
        performed_by: adminProfile.id,
        action_type: 'user_role_changed',
        old_value: { role: targetProfile.role },
        new_value: { role: newRole },
        description: `Rol de ${targetProfile.email} cambiado de ${targetProfile.role} a ${newRole}`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ message: 'Rol actualizado correctamente' });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
