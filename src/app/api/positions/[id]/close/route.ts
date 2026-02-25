import { NextResponse, type NextRequest } from 'next/server';
import { verifyStaff } from '@/lib/api/verify-staff';
import { closePositionSchema } from '@/lib/schemas/positions';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/positions/[id]/close - Close or pause a position
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, profile } = await verifyStaff();

    // Verify position exists
    const { data: position, error: fetchError } = await supabase
      .from('positions')
      .select('id, title, status')
      .eq('id', id)
      .single();

    if (fetchError || !position) {
      return NextResponse.json({ error: 'Vacante no encontrada' }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = closePositionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { action, hired_person_id } = parsed.data;

    let updatePayload: Record<string, unknown>;
    let activityDescription: string;

    if (action === 'filled') {
      // Close as filled — require hired_person_id
      if (!hired_person_id) {
        return NextResponse.json(
          { error: 'Se requiere el ID de la persona contratada para cerrar como "filled"' },
          { status: 400 }
        );
      }

      // Update candidate's stage to 'hired'
      await supabase
        .from('person_positions')
        .update({ stage: 'hired' })
        .eq('position_id', id)
        .eq('person_id', hired_person_id);

      updatePayload = {
        status: 'closed',
        close_reason: 'filled',
        hired_person_id,
        closed_at: new Date().toISOString(),
      };
      activityDescription = `Vacante "${position.title}" cerrada (cubierta)`;
    } else if (action === 'cancelled') {
      updatePayload = {
        status: 'closed',
        close_reason: 'cancelled',
        closed_at: new Date().toISOString(),
      };
      activityDescription = `Vacante "${position.title}" cerrada (cancelada)`;
    } else {
      // on_hold
      updatePayload = {
        status: 'on_hold',
      };
      activityDescription = `Vacante "${position.title}" puesta en pausa`;
    }

    const { error: updateError } = await supabase
      .from('positions')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    try {
      await supabase.from('activity_log').insert({
        performed_by: profile.id,
        action_type: 'position_closed',
        old_value: { status: position.status } as Json,
        new_value: updatePayload as Json,
        description: activityDescription,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ message: activityDescription });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
