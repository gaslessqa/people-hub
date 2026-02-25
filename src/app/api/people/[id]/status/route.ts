import { NextResponse, type NextRequest } from 'next/server';
import { verifyStaff } from '@/lib/api/verify-staff';
import {
  isValidTransition,
  getValidNextStatuses,
} from '@/components/features/people/status-machine';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/people/[id]/status - Get valid next status definitions for a person
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = await verifyStaff();

    // Get current status (latest record)
    const { data: currentStatusRecord } = await supabase
      .from('person_statuses')
      .select('status_definitions(status_value)')
      .eq('person_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentStatusDef = currentStatusRecord?.status_definitions as
      | { status_value: string }
      | null
      | undefined;
    const currentStatusValue = currentStatusDef?.status_value ?? null;

    const validValues = currentStatusValue ? getValidNextStatuses(currentStatusValue) : [];

    if (validValues.length === 0) {
      return NextResponse.json({ statuses: [] });
    }

    const { data, error } = await supabase
      .from('status_definitions')
      .select('id, label, color, status_value')
      .eq('is_active', true)
      .in('status_value', validValues);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Preserve state machine order
    const ordered = validValues
      .map(v => data?.find(d => d.status_value === v))
      .filter((d): d is NonNullable<typeof d> => d !== undefined);

    return NextResponse.json({ statuses: ordered });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/people/[id]/status - Change person status
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { profile: staffProfile, supabase } = await verifyStaff();

    const body: unknown = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 });
    }

    const { status_definition_id, comment } = body as Record<string, unknown>;

    if (!status_definition_id || typeof status_definition_id !== 'string') {
      return NextResponse.json(
        { error: 'El campo status_definition_id es requerido.' },
        { status: 400 }
      );
    }

    if (comment !== undefined && (typeof comment !== 'string' || comment.length > 500)) {
      return NextResponse.json(
        { error: 'El comentario no puede exceder 500 caracteres.' },
        { status: 400 }
      );
    }

    // Verify person exists
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id')
      .eq('id', id)
      .single();

    if (personError || !person) {
      return NextResponse.json({ error: 'Persona no encontrada.' }, { status: 404 });
    }

    // Get current status (latest record)
    const { data: currentStatusRecord } = await supabase
      .from('person_statuses')
      .select('status_definitions(status_value, label)')
      .eq('person_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentStatusDef = currentStatusRecord?.status_definitions as
      | { status_value: string; label: string }
      | null
      | undefined;
    const currentStatusValue = currentStatusDef?.status_value ?? null;

    // Fetch the new status definition
    const { data: newStatusDef, error: statusDefError } = await supabase
      .from('status_definitions')
      .select('id, label, color, status_value, status_type')
      .eq('id', status_definition_id)
      .eq('is_active', true)
      .single();

    if (statusDefError || !newStatusDef) {
      return NextResponse.json(
        { error: 'Definición de estado no encontrada o inactiva.' },
        { status: 404 }
      );
    }

    // Validate transition via state machine
    if (currentStatusValue && !isValidTransition(currentStatusValue, newStatusDef.status_value)) {
      const validNext = (VALID_NEXT_LABELS[currentStatusValue] ?? []).join(', ') || 'ninguna';
      return NextResponse.json(
        {
          error: `Transición inválida: "${currentStatusValue}" → "${newStatusDef.status_value}". Transiciones válidas desde "${currentStatusValue}": ${validNext}.`,
        },
        { status: 400 }
      );
    }

    // Insert new status record
    const { error: insertError } = await supabase.from('person_statuses').insert({
      person_id: id,
      status_definition_id,
      comment: typeof comment === 'string' && comment.trim() ? comment.trim() : null,
      changed_by: staffProfile.id,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Log activity
    try {
      const description = comment
        ? `Estado cambiado a "${newStatusDef.label}": ${comment}`
        : `Estado cambiado a "${newStatusDef.label}"`;

      await supabase.from('activity_log').insert({
        person_id: id,
        performed_by: staffProfile.id,
        action_type: 'status_changed',
        old_value: {
          status_value: currentStatusValue,
          label: currentStatusDef?.label ?? null,
        } as Json,
        new_value: {
          status_value: newStatusDef.status_value,
          label: newStatusDef.label,
          color: newStatusDef.color,
        } as Json,
        description,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ message: 'Estado actualizado correctamente' }, { status: 201 });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Human-readable labels for error messages
const VALID_NEXT_LABELS: Record<string, string[]> = {
  lead: ['applied', 'rejected'],
  applied: ['screening', 'rejected', 'withdrawn'],
  screening: ['interviewing', 'rejected', 'withdrawn'],
  interviewing: ['finalist', 'rejected', 'withdrawn'],
  finalist: ['offer', 'rejected'],
  offer: ['hired', 'rejected', 'withdrawn'],
  hired: ['active', 'terminated'],
  active: ['probation', 'on_leave', 'terminated'],
  probation: ['active', 'terminated'],
  on_leave: ['active', 'terminated'],
};
