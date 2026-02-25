import { NextResponse, type NextRequest } from 'next/server';
import { verifyAnyRole } from '@/lib/api/verify-any-role';
import { verifyStaff } from '@/lib/api/verify-staff';
import { createPositionSchema } from '@/lib/schemas/positions';
import type { Json } from '@/types/supabase';

// GET /api/positions - List positions
// Managers see only their own; all other roles see all
export async function GET(_request: NextRequest) {
  try {
    const { supabase, profile } = await verifyAnyRole();

    let query = supabase
      .from('positions')
      .select(
        `
        *,
        hiring_manager:profiles!positions_hiring_manager_id_fkey (
          id,
          full_name
        ),
        recruiter:profiles!positions_recruiter_id_fkey (
          id,
          full_name
        ),
        person_positions (
          id,
          stage
        )
      `
      )
      .order('created_at', { ascending: false });

    // Managers only see positions they manage
    if (profile.role === 'manager') {
      query = query.eq('hiring_manager_id', profile.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/positions - Create a new position
export async function POST(request: NextRequest) {
  try {
    const { supabase, profile } = await verifyStaff();

    const body: unknown = await request.json();
    const parsed = createPositionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      department,
      description,
      requirements,
      location,
      employment_type,
      salary_min,
      salary_max,
      salary_currency,
      hiring_manager_id,
      priority,
    } = parsed.data;

    const { data: newPosition, error: insertError } = await supabase
      .from('positions')
      .insert({
        title,
        department: department || null,
        description: description || null,
        requirements: requirements || null,
        location: location || null,
        employment_type: employment_type ?? null,
        salary_min: salary_min ?? null,
        salary_max: salary_max ?? null,
        salary_currency: salary_currency || null,
        hiring_manager_id: hiring_manager_id || null,
        recruiter_id: profile.id,
        priority: (priority ?? 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        status: 'open',
      })
      .select('id')
      .single();

    if (insertError || !newPosition) {
      return NextResponse.json(
        { error: insertError?.message ?? 'Error al crear la vacante' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from('activity_log').insert({
        performed_by: profile.id,
        action_type: 'position_created',
        new_value: { title, department: department ?? null, priority } as Json,
        description: `Vacante "${title}" creada`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ id: newPosition.id }, { status: 201 });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
