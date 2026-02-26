import { NextResponse, type NextRequest } from 'next/server';
import { verifyStaff } from '@/lib/api/verify-staff';
import { updateStageSchema } from '@/lib/schemas/positions';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string; personId: string }>;
}

// PATCH /api/positions/[id]/candidates/[personId] - Update pipeline stage
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, personId } = await params;
    const { supabase, profile } = await verifyStaff();

    // Verify assignment exists
    const { data: assignment, error: fetchError } = await supabase
      .from('person_positions')
      .select('id, stage')
      .eq('position_id', id)
      .eq('person_id', personId)
      .single();

    if (fetchError || !assignment) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = updateStageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { stage } = parsed.data;
    const oldStage = assignment.stage;

    const { error: updateError } = await supabase
      .from('person_positions')
      .update({ stage })
      .eq('id', assignment.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Fetch position title for activity log
    const { data: position } = await supabase
      .from('positions')
      .select('title')
      .eq('id', id)
      .single();

    // Log activity
    try {
      await supabase.from('activity_log').insert({
        person_id: personId,
        performed_by: profile.id,
        action_type: 'stage_changed',
        old_value: { stage: oldStage, position_id: id } as Json,
        new_value: { stage, position_id: id, position_title: position?.title ?? null } as Json,
        description: `Etapa actualizada a "${stage}" en vacante "${position?.title ?? id}"`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ message: 'Etapa actualizada correctamente' });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
