import { NextResponse, type NextRequest } from 'next/server';
import { verifyHrAdmin } from '@/lib/api/verify-hr-admin';
import { createStatusSchema } from '@/lib/schemas/statuses';

// GET /api/admin/statuses - Fetch all status definitions
export async function GET() {
  try {
    const { supabase } = await verifyHrAdmin();

    const { data, error } = await supabase
      .from('status_definitions')
      .select('id, status_type, status_value, label, color, order_index, is_active')
      .order('status_type', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ statuses: data ?? [] });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/admin/statuses - Create new status definition
export async function POST(request: NextRequest) {
  try {
    const { supabase } = await verifyHrAdmin();

    const body: unknown = await request.json();
    const parsed = createStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status_type, status_value, label, color, order_index } = parsed.data;

    // Check uniqueness of status_value within the same type
    const { data: existing } = await supabase
      .from('status_definitions')
      .select('id')
      .eq('status_type', status_type)
      .eq('status_value', status_value)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: `Ya existe un estado con el valor "${status_value}" para el tipo "${status_type}".`,
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('status_definitions')
      .insert({ status_type, status_value, label, color, order_index, is_active: true })
      .select('id, status_type, status_value, label, color, order_index, is_active')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: data }, { status: 201 });
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
