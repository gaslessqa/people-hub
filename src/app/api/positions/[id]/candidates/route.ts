import { NextResponse, type NextRequest } from 'next/server';
import { verifyStaff } from '@/lib/api/verify-staff';
import { assignCandidateSchema } from '@/lib/schemas/positions';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/positions/[id]/candidates - Assign a candidate to a position
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, profile } = await verifyStaff();

    // Verify position exists and is open
    const { data: position, error: posError } = await supabase
      .from('positions')
      .select('id, title, status')
      .eq('id', id)
      .single();

    if (posError || !position) {
      return NextResponse.json({ error: 'Vacante no encontrada' }, { status: 404 });
    }

    if (position.status !== 'open') {
      return NextResponse.json(
        { error: 'Solo se pueden asignar candidatos a vacantes abiertas' },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();
    const parsed = assignCandidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { person_id } = parsed.data;

    // Verify person exists
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id, first_name, last_name')
      .eq('id', person_id)
      .single();

    if (personError || !person) {
      return NextResponse.json({ error: 'Persona no encontrada' }, { status: 404 });
    }

    // Check not already assigned
    const { data: existing } = await supabase
      .from('person_positions')
      .select('id')
      .eq('person_id', person_id)
      .eq('position_id', id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Esta persona ya está asignada a esta vacante' },
        { status: 409 }
      );
    }

    // Insert at 'applied' stage
    const { data: newAssignment, error: insertError } = await supabase
      .from('person_positions')
      .insert({
        person_id,
        position_id: id,
        stage: 'applied',
      })
      .select('id')
      .single();

    if (insertError || !newAssignment) {
      return NextResponse.json(
        { error: insertError?.message ?? 'Error al asignar candidato' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from('activity_log').insert({
        person_id,
        performed_by: profile.id,
        action_type: 'assigned_to_position',
        new_value: { position_id: id, position_title: position.title, stage: 'applied' } as Json,
        description: `Asignado a la vacante "${position.title}"`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ id: newAssignment.id }, { status: 201 });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
