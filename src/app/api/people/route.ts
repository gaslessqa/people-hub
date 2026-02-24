import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyStaff } from '@/lib/api/verify-staff';
import { createPersonSchema } from '@/lib/schemas/people';

// POST /api/people - Create a new person record
export async function POST(request: NextRequest) {
  try {
    const { profile: staffProfile } = await verifyStaff();

    const body: unknown = await request.json();
    const parsed = createPersonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { notes, linkedin_url, ...personData } = parsed.data;
    const adminClient = createAdminClient();

    // Check for existing person with same email (warning only, not error)
    let emailWarning: { existing_person_id: string; existing_person_name: string } | undefined;

    const { data: existingPerson } = await adminClient
      .from('people')
      .select('id, first_name, last_name')
      .eq('email', personData.email)
      .maybeSingle();

    if (existingPerson) {
      emailWarning = {
        existing_person_id: existingPerson.id,
        existing_person_name: `${existingPerson.first_name} ${existingPerson.last_name}`,
      };
    }

    // Insert new person
    const { data: newPerson, error: insertError } = await adminClient
      .from('people')
      .insert({
        ...personData,
        linkedin_url: linkedin_url || null,
        created_by: staffProfile.id,
      })
      .select('id')
      .single();

    if (insertError || !newPerson) {
      return NextResponse.json(
        { error: insertError?.message ?? 'Error al crear la persona' },
        { status: 500 }
      );
    }

    // Find the 'lead' status definition (first candidate status)
    const { data: leadStatus } = await adminClient
      .from('status_definitions')
      .select('id')
      .eq('status_type', 'candidate')
      .eq('status_value', 'lead')
      .eq('is_active', true)
      .single();

    // Insert initial status (lead)
    if (leadStatus) {
      await adminClient.from('person_statuses').insert({
        person_id: newPerson.id,
        status_definition_id: leadStatus.id,
        changed_by: staffProfile.id,
      });
    }

    // Log activity
    try {
      const description = notes
        ? `Persona creada. Nota inicial: ${notes}`
        : `Persona ${personData.first_name} ${personData.last_name} registrada en el sistema`;

      await adminClient.from('activity_log').insert({
        person_id: newPerson.id,
        performed_by: staffProfile.id,
        action_type: 'person_created',
        new_value: { ...personData, source: personData.source ?? null },
        description,
      });
    } catch {
      // Audit log failure does not block the operation
    }

    return NextResponse.json(
      { id: newPerson.id, ...(emailWarning ? { email_warning: emailWarning } : {}) },
      { status: 201 }
    );
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
