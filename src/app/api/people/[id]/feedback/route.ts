import { NextResponse, type NextRequest } from 'next/server';
import { verifyAnyRole } from '@/lib/api/verify-any-role';
import { createFeedbackSchema } from '@/lib/schemas/feedback';
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
      .select('id')
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

    return NextResponse.json({ ...fb, given_by_name: profile.full_name }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
