import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySuperAdmin } from '@/lib/api/verify-super-admin';
import { createUserSchema } from '@/lib/schemas/auth';

// GET /api/admin/users - List all users
export async function GET() {
  try {
    const { supabase } = await verifySuperAdmin();

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: profiles });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user via invite
export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile } = await verifySuperAdmin();

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { full_name, email, role } = parsed.data;
    const adminClient = createAdminClient();

    // Invite user by email (no plain-text password)
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name,
          invited_by: adminProfile.id,
        },
      }
    );

    if (inviteError) {
      if (
        inviteError.message.includes('already been registered') ||
        inviteError.message.includes('already registered')
      ) {
        return NextResponse.json({ error: 'Este email ya está registrado.' }, { status: 409 });
      }
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    if (!inviteData.user) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 });
    }

    // Update the profile with the specified role
    // (trigger creates it with default 'recruiter')
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ role, full_name })
      .eq('auth_user_id', inviteData.user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Log activity
    try {
      await adminClient.from('activity_log').insert({
        person_id: null,
        performed_by: adminProfile.id,
        action_type: 'user_created',
        new_value: { email, role, full_name },
        description: `Usuario ${email} creado con rol ${role}`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ message: 'Invitación enviada correctamente' }, { status: 201 });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
