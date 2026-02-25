import { NextResponse, type NextRequest } from 'next/server';
import { verifyHrAdmin } from '@/lib/api/verify-hr-admin';
import { updateStatusSchema } from '@/lib/schemas/statuses';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/statuses/[id] - Update label, color, order_index, or is_active
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = await verifyHrAdmin();

    const body: unknown = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ message: 'Sin cambios' });
    }

    const { data, error } = await supabase
      .from('status_definitions')
      .update(parsed.data)
      .eq('id', id)
      .select('id, status_type, status_value, label, color, order_index, is_active')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Definición de estado no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ status: data });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/admin/statuses/[id] - Soft-delete if unused, error if in use
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = await verifyHrAdmin();

    // Verify the status definition exists
    const { data: statusDef, error: fetchError } = await supabase
      .from('status_definitions')
      .select('id, label, status_value')
      .eq('id', id)
      .single();

    if (fetchError || !statusDef) {
      return NextResponse.json({ error: 'Definición de estado no encontrada.' }, { status: 404 });
    }

    // Check if any person currently uses this status
    const { count, error: countError } = await supabase
      .from('person_statuses')
      .select('id', { count: 'exact', head: true })
      .eq('status_definition_id', id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar el estado "${statusDef.label}": hay ${count} persona(s) asignadas a este estado.`,
        },
        { status: 409 }
      );
    }

    // Soft-delete: set is_active = false
    const { error: updateError } = await supabase
      .from('status_definitions')
      .update({ is_active: false })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Estado desactivado correctamente.' });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
