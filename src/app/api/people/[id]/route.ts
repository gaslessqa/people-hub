import { NextResponse, type NextRequest } from 'next/server';
import { verifyStaff } from '@/lib/api/verify-staff';
import { updatePersonSchema } from '@/lib/schemas/people';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/people/[id] - Fetch full person profile
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = await verifyStaff();

    // Fetch person, status history, positions, and timeline in parallel
    const [personResult, statusHistoryResult, positionsResult, timelineResult] = await Promise.all([
      supabase.from('people').select('*').eq('id', id).single(),

      supabase
        .from('person_statuses')
        .select('id, created_at, comment, changed_by, status_definitions(*)')
        .eq('person_id', id)
        .order('created_at', { ascending: false })
        .limit(10),

      supabase.from('person_positions').select('stage, positions(id, title)').eq('person_id', id),

      supabase
        .from('activity_log')
        .select('action_type, description, created_at, performed_by')
        .eq('person_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    if (personResult.error || !personResult.data) {
      return NextResponse.json({ error: 'Persona no encontrada.' }, { status: 404 });
    }

    const statusHistory = statusHistoryResult.data ?? [];
    const currentStatusRaw = statusHistory[0];
    const currentStatusDef = currentStatusRaw?.status_definitions as
      | { id: string; label: string; color: string; status_value: string; status_type: string }
      | null
      | undefined;

    // Resolve performed_by names in bulk
    const performedByIds = [...new Set((timelineResult.data ?? []).map(e => e.performed_by))];
    let profileMap: Record<string, string> = {};
    if (performedByIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', performedByIds);
      profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]));
    }

    const timeline = (timelineResult.data ?? []).map(entry => ({
      action_type: entry.action_type,
      description: entry.description,
      performed_by_name: profileMap[entry.performed_by] ?? null,
      created_at: entry.created_at,
    }));

    const positions = (positionsResult.data ?? []).map(pp => {
      const pos = pp.positions as { id: string; title: string } | null;
      return {
        position_id: pos?.id ?? '',
        title: pos?.title ?? '',
        stage: pp.stage,
      };
    });

    return NextResponse.json({
      person: personResult.data,
      current_status: currentStatusDef
        ? {
            id: currentStatusDef.id,
            label: currentStatusDef.label,
            color: currentStatusDef.color,
            status_value: currentStatusDef.status_value,
            status_type: currentStatusDef.status_type,
          }
        : null,
      status_history: statusHistory.map(sh => ({
        id: sh.id,
        created_at: sh.created_at,
        comment: sh.comment,
        status_definition: sh.status_definitions,
      })),
      positions,
      timeline,
    });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH /api/people/[id] - Update person data (with optimistic locking)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { profile: staffProfile, supabase } = await verifyStaff();

    const rawBody: Record<string, unknown> = await request.json();

    // Extract updated_at for optimistic locking before schema validation
    const { updated_at: sentUpdatedAt, ...updateFields } = rawBody;

    const parsed = updatePersonSchema.safeParse(updateFields);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Fetch current person
    const { data: currentPerson, error: fetchError } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentPerson) {
      return NextResponse.json({ error: 'Persona no encontrada.' }, { status: 404 });
    }

    // Optimistic locking: compare updated_at
    if (
      sentUpdatedAt &&
      typeof sentUpdatedAt === 'string' &&
      new Date(sentUpdatedAt).toISOString() !== new Date(currentPerson.updated_at).toISOString()
    ) {
      return NextResponse.json(
        {
          error:
            'Conflicto de edición. Otro usuario modificó esta persona. Recarga para ver los cambios más recientes.',
        },
        { status: 409 }
      );
    }

    // Normalize empty strings to null for optional fields
    const updateData = {
      ...parsed.data,
      phone: parsed.data.phone || null,
      linkedin_url: parsed.data.linkedin_url || null,
      current_company: parsed.data.current_company || null,
      current_position: parsed.data.current_position || null,
      location: parsed.data.location || null,
    };

    // Compute diff for audit log
    const changedFields = (Object.keys(updateData) as (keyof typeof updateData)[]).filter(
      key => updateData[key] !== currentPerson[key as keyof typeof currentPerson]
    );

    if (changedFields.length === 0) {
      return NextResponse.json({ message: 'Sin cambios' });
    }

    const oldValue: Record<string, unknown> = {};
    const newValue: Record<string, unknown> = {};
    for (const field of changedFields) {
      oldValue[field] = currentPerson[field as keyof typeof currentPerson];
      newValue[field] = updateData[field];
    }

    // Apply update
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('people')
      .update({ ...updateData, updated_at: now })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    try {
      const changedLabels = changedFields.join(', ');
      await supabase.from('activity_log').insert({
        person_id: id,
        performed_by: staffProfile.id,
        action_type: 'person_updated',
        old_value: oldValue as Json,
        new_value: newValue as Json,
        description: `Campos actualizados: ${changedLabels}`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ message: 'Cambios guardados correctamente', updated_at: now });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
