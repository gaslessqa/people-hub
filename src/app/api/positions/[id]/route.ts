import { NextResponse, type NextRequest } from 'next/server';
import { verifyAnyRole } from '@/lib/api/verify-any-role';
import { verifyStaff } from '@/lib/api/verify-staff';
import { updatePositionSchema } from '@/lib/schemas/positions';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/positions/[id] - Full position detail with candidates
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = await verifyAnyRole();

    const { data: position, error } = await supabase
      .from('positions')
      .select(
        `
        *,
        hiring_manager:profiles!positions_hiring_manager_id_fkey (
          id,
          full_name,
          email
        ),
        recruiter:profiles!positions_recruiter_id_fkey (
          id,
          full_name,
          email
        ),
        person_positions (
          id,
          stage,
          assigned_at,
          updated_at,
          people (
            id,
            first_name,
            last_name,
            email,
            current_position,
            current_company
          )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error || !position) {
      return NextResponse.json({ error: 'Vacante no encontrada' }, { status: 404 });
    }

    return NextResponse.json(position);
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH /api/positions/[id] - Update position fields
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, profile } = await verifyStaff();

    // Verify position exists
    const { data: existing, error: fetchError } = await supabase
      .from('positions')
      .select('id, title, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Vacante no encontrada' }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = updatePositionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const fields = parsed.data;

    if (fields.title !== undefined) updateData.title = fields.title;
    if (fields.department !== undefined) updateData.department = fields.department || null;
    if (fields.description !== undefined) updateData.description = fields.description || null;
    if (fields.requirements !== undefined) updateData.requirements = fields.requirements || null;
    if (fields.location !== undefined) updateData.location = fields.location || null;
    if (fields.employment_type !== undefined)
      updateData.employment_type = fields.employment_type ?? null;
    if (fields.salary_min !== undefined) updateData.salary_min = fields.salary_min ?? null;
    if (fields.salary_max !== undefined) updateData.salary_max = fields.salary_max ?? null;
    if (fields.salary_currency !== undefined)
      updateData.salary_currency = fields.salary_currency || null;
    if (fields.hiring_manager_id !== undefined)
      updateData.hiring_manager_id = fields.hiring_manager_id || null;
    if (fields.priority !== undefined) updateData.priority = fields.priority;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { error: updateError } = await supabase.from('positions').update(updateData).eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    try {
      await supabase.from('activity_log').insert({
        performed_by: profile.id,
        action_type: 'position_updated',
        new_value: updateData as Json,
        description: `Vacante "${existing.title}" actualizada`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ message: 'Vacante actualizada correctamente' });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
