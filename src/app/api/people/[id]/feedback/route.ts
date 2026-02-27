import { NextResponse, type NextRequest } from 'next/server';
import { verifyAnyRole } from '@/lib/api/verify-any-role';
import { createFeedbackSchema } from '@/lib/schemas/feedback';
import { sendNotification } from '@/lib/notifications/service';
import { buildFeedbackReceivedEmail } from '@/lib/email/templates/feedback-received';
import { NOTIFICATION_TYPES } from '@/lib/notifications/types';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/people/[id]/feedback
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = await verifyAnyRole();

    const positionId = request.nextUrl.searchParams.get('position_id');

    let query = supabase
      .from('feedback')
      .select('*')
      .eq('person_id', id)
      .order('created_at', { ascending: false });

    if (positionId) {
      query = query.eq('position_id', positionId);
    }

    const { data: feedbackList, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!feedbackList || feedbackList.length === 0) {
      return NextResponse.json({ feedback: [] });
    }

    // Bulk-resolve given_by names
    const authorIds = [...new Set(feedbackList.map(f => f.given_by))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', authorIds);

    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]));

    const enriched = feedbackList.map(fb => ({
      ...fb,
      given_by_name: profileMap[fb.given_by] ?? null,
    }));

    return NextResponse.json({ feedback: enriched });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/people/[id]/feedback
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { profile, supabase } = await verifyAnyRole();

    // Only manager, hr_admin, and super_admin can submit feedback
    const allowedRoles = ['manager', 'hr_admin', 'super_admin'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Solo managers y administradores pueden registrar feedback.' },
        { status: 403 }
      );
    }

    const body: unknown = await request.json();
    const parsed = createFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const {
      feedback_type,
      rating,
      recommendation,
      strengths,
      concerns,
      comments,
      position_id,
      is_confidential,
    } = parsed.data;

    // Verify person exists
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id, first_name, last_name')
      .eq('id', id)
      .single();

    if (personError || !person) {
      return NextResponse.json({ error: 'Persona no encontrada.' }, { status: 404 });
    }

    const { data: fb, error: insertError } = await supabase
      .from('feedback')
      .insert({
        person_id: id,
        given_by: profile.id,
        feedback_type,
        rating,
        recommendation,
        strengths: strengths ?? null,
        concerns: concerns ?? null,
        comments,
        position_id: position_id ?? null,
        is_confidential,
      })
      .select('*')
      .single();

    if (insertError || !fb) {
      return NextResponse.json(
        { error: insertError?.message ?? 'Error al registrar feedback' },
        { status: 500 }
      );
    }

    // Log activity (non-blocking)
    try {
      await supabase.from('activity_log').insert({
        person_id: id,
        performed_by: profile.id,
        action_type: 'feedback_added',
        new_value: { rating, recommendation, feedback_type, comments } as Json,
        description: `Feedback registrado (${rating}/5 estrellas)`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    // PH-40: Notify recruiter (non-blocking, skip if feedback is confidential)
    if (!is_confidential) {
      void notifyRecruiter({
        person,
        positionId: position_id ?? null,
        managerName: profile.full_name ?? 'Manager',
        rating,
        recommendation,
        comments,
      });
    }

    return NextResponse.json({ ...fb, given_by_name: profile.full_name }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

interface NotifyRecruiterParams {
  person: { id: string; first_name: string; last_name: string };
  positionId: string | null;
  managerName: string;
  rating: number;
  recommendation: string;
  comments: string;
}

async function notifyRecruiter(params: NotifyRecruiterParams): Promise<void> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminSupabase = createAdminClient();

    const candidateName = `${params.person.first_name} ${params.person.last_name}`;
    let positionTitle: string | null = null;
    let recruiterProfileId: string | null = null;
    let recruiterEmail: string | null = null;
    let recruiterName: string | null = null;

    // Resolve position + recruiter from position if available
    if (params.positionId) {
      const { data: position } = await adminSupabase
        .from('positions')
        .select('title, recruiter_id')
        .eq('id', params.positionId)
        .maybeSingle();

      if (position) {
        positionTitle = position.title;

        if (position.recruiter_id) {
          const { data: recruiter } = await adminSupabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', position.recruiter_id)
            .maybeSingle();

          if (recruiter?.email) {
            recruiterProfileId = recruiter.id;
            recruiterEmail = recruiter.email;
            recruiterName = recruiter.full_name;
          }
        }
      }
    }

    // Fallback: find recruiter from person's creator (created_by)
    if (!recruiterProfileId) {
      const { data: personRecord } = await adminSupabase
        .from('people')
        .select('created_by')
        .eq('id', params.person.id)
        .maybeSingle();

      if (personRecord?.created_by) {
        const { data: creator } = await adminSupabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', personRecord.created_by)
          .maybeSingle();

        if (creator?.email && creator.role === 'recruiter') {
          recruiterProfileId = creator.id;
          recruiterEmail = creator.email;
          recruiterName = creator.full_name;
        }
      }
    }

    if (!recruiterProfileId || !recruiterEmail) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const emailContent = buildFeedbackReceivedEmail({
      recruiterName: recruiterName ?? 'Recruiter',
      candidateName,
      positionTitle,
      managerName: params.managerName,
      rating: params.rating,
      recommendation: params.recommendation,
      commentsPreview: params.comments,
      feedbackUrl: `${appUrl}/people/${params.person.id}`,
    });

    await sendNotification({
      recipientProfileId: recruiterProfileId,
      recipientEmail: recruiterEmail,
      notificationType: NOTIFICATION_TYPES.FEEDBACK_RECEIVED,
      payload: {
        person_id: params.person.id,
        position_id: params.positionId,
        candidate_name: candidateName,
        rating: params.rating,
        recommendation: params.recommendation,
      },
      email: { ...emailContent, to: recruiterEmail },
    });
  } catch (err) {
    console.error('[PH-40] Failed to notify recruiter:', err);
  }
}
