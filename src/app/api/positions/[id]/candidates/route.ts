import { NextResponse, type NextRequest } from 'next/server';
import { verifyStaff } from '@/lib/api/verify-staff';
import { assignCandidateSchema } from '@/lib/schemas/positions';
import { sendNotification } from '@/lib/notifications/service';
import { buildCandidateAssignedEmail } from '@/lib/email/templates/candidate-assigned';
import { NOTIFICATION_TYPES } from '@/lib/notifications/types';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/positions/[id]/candidates - Assign a candidate to a position
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, profile } = await verifyStaff();

    // Verify position exists and is open (include hiring_manager_id for notification)
    const { data: position, error: posError } = await supabase
      .from('positions')
      .select('id, title, status, hiring_manager_id')
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

    // Verify person exists (include contact info for email)
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id, first_name, last_name, email, phone')
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

    // Log activity (non-blocking)
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

    // PH-39: Notify manager (non-blocking)
    if (position.hiring_manager_id) {
      void notifyManager({
        managerProfileId: position.hiring_manager_id,
        person,
        positionTitle: position.title,
        positionId: id,
        recruiterName: profile.full_name ?? 'Recruiter',
      });
    }

    return NextResponse.json({ id: newAssignment.id }, { status: 201 });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

interface NotifyManagerParams {
  managerProfileId: string;
  person: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  positionTitle: string;
  positionId: string;
  recruiterName: string;
}

async function notifyManager(params: NotifyManagerParams): Promise<void> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminSupabase = createAdminClient();

    const { data: manager } = await adminSupabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', params.managerProfileId)
      .maybeSingle();

    if (!manager?.email) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const candidateName = `${params.person.first_name} ${params.person.last_name}`;

    const emailContent = buildCandidateAssignedEmail({
      managerName: manager.full_name ?? 'Manager',
      candidateName,
      candidateEmail: params.person.email,
      candidatePhone: params.person.phone,
      positionTitle: params.positionTitle,
      recruiterName: params.recruiterName,
      candidateProfileUrl: `${appUrl}/people/${params.person.id}`,
    });

    await sendNotification({
      recipientProfileId: manager.id,
      recipientEmail: manager.email,
      notificationType: NOTIFICATION_TYPES.NEW_CANDIDATE_ASSIGNED,
      payload: {
        person_id: params.person.id,
        position_id: params.positionId,
        position_title: params.positionTitle,
        candidate_name: candidateName,
      },
      email: { ...emailContent, to: manager.email },
    });
  } catch (err) {
    console.error('[PH-39] Failed to notify manager:', err);
  }
}
