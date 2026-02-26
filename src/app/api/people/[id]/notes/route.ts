import { NextResponse, type NextRequest } from 'next/server';
import { verifyAnyRole } from '@/lib/api/verify-any-role';
import { verifyStaff } from '@/lib/api/verify-staff';
import { createNoteSchema } from '@/lib/schemas/feedback';
import type { Json } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/people/[id]/notes
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = await verifyAnyRole();

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('person_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!notes || notes.length === 0) {
      return NextResponse.json({ notes: [] });
    }

    // Bulk-resolve created_by names
    const authorIds = [...new Set(notes.map(n => n.created_by))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', authorIds);

    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]));

    const enriched = notes.map(note => ({
      ...note,
      created_by_name: profileMap[note.created_by] ?? null,
    }));

    return NextResponse.json({ notes: enriched });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/people/[id]/notes
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { profile, supabase } = await verifyStaff();

    const body: unknown = await request.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { content } = parsed.data;

    // Verify person exists
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id')
      .eq('id', id)
      .single();

    if (personError || !person) {
      return NextResponse.json({ error: 'Persona no encontrada.' }, { status: 404 });
    }

    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        person_id: id,
        created_by: profile.id,
        content,
        is_private: false,
      })
      .select('*')
      .single();

    if (insertError || !note) {
      return NextResponse.json(
        { error: insertError?.message ?? 'Error al crear nota' },
        { status: 500 }
      );
    }

    // Log activity (non-blocking)
    try {
      await supabase.from('activity_log').insert({
        person_id: id,
        performed_by: profile.id,
        action_type: 'note_added',
        new_value: { content } as Json,
        description: `Nota agregada`,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json({ ...note, created_by_name: profile.full_name }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
