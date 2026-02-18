import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySuperAdmin } from '@/lib/api/verify-super-admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/users/[id] - Toggle user active status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { profile: adminProfile } = await verifySuperAdmin();

    // Cannot deactivate yourself
    if (id === adminProfile.id) {
      return NextResponse.json(
        { error: 'No puedes desactivar tu propia cuenta.' },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();
    const is_active =
      body !== null && typeof body === 'object' && 'is_active' in body
        ? (body as Record<string, unknown>).is_active
        : undefined;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'El campo is_active es requerido.' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get the target user's auth_user_id
    const { data: targetProfile, error: fetchError } = await adminClient
      .from('profiles')
      .select('auth_user_id, email, role')
      .eq('id', id)
      .single();

    if (fetchError || !targetProfile) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // If deactivating, sign out the user globally
    if (!is_active && targetProfile.auth_user_id) {
      await adminClient.auth.admin.signOut(targetProfile.auth_user_id, 'global');
    }

    // Update is_active in profiles
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ is_active })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    try {
      await adminClient.from('activity_log').insert({
        person_id: null,
        performed_by: adminProfile.id,
        action_type: is_active ? 'user_activated' : 'user_deactivated',
        new_value: { is_active },
        description: `Usuario ${targetProfile.email} ${is_active ? 'activado' : 'desactivado'}`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({
      message: `Usuario ${is_active ? 'activado' : 'desactivado'} correctamente`,
    });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Permanently delete a user (super_admin only)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { profile: adminProfile } = await verifySuperAdmin();

    if (id === adminProfile.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: targetProfile, error: fetchError } = await adminClient
      .from('profiles')
      .select('auth_user_id, email')
      .eq('id', id)
      .single();

    if (fetchError || !targetProfile) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // Delete auth user (cascades to profile via FK on delete)
    if (targetProfile.auth_user_id) {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(
        targetProfile.auth_user_id
      );

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    // Log activity
    try {
      await adminClient.from('activity_log').insert({
        person_id: null,
        performed_by: adminProfile.id,
        action_type: 'user_deleted',
        new_value: { email: targetProfile.email },
        description: `Usuario ${targetProfile.email} eliminado permanentemente`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
