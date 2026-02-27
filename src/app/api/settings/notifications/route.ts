import { NextResponse, type NextRequest } from 'next/server';
import { verifyAnyRole } from '@/lib/api/verify-any-role';
import { notificationSettingsSchema } from '@/lib/schemas/notifications';
import { getNotificationSettings } from '@/lib/notifications/types';
import type { Json } from '@/types/supabase';

// GET /api/settings/notifications — get current user's notification preferences
export async function GET() {
  try {
    const { supabase, profile } = await verifyAnyRole();

    const { data: prefsRow } = await supabase
      .from('user_preferences')
      .select('notification_settings')
      .eq('user_id', profile.id)
      .maybeSingle();

    const settings = getNotificationSettings(prefsRow?.notification_settings ?? null);
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/settings/notifications — update current user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const { supabase, profile } = await verifyAnyRole();

    const body: unknown = await request.json();
    const parsed = notificationSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Upsert user_preferences row
    const { error } = await supabase.from('user_preferences').upsert(
      {
        user_id: profile.id,
        notification_settings: parsed.data as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: parsed.data });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
