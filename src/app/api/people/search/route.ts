import { NextResponse, type NextRequest } from 'next/server';
import { verifyStaff } from '@/lib/api/verify-staff';

// GET /api/people/search?q=&limit=10&field=email
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await verifyStaff();

    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.trim() ?? '';
    const field = searchParams.get('field'); // 'email' for exact match
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 20);

    if (!q) {
      return NextResponse.json([]);
    }

    let query = supabase
      .from('people')
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        current_company,
        person_statuses (
          created_at,
          status_definitions (
            label,
            color
          )
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (field === 'email') {
      // Exact match for duplicate email check
      query = query.eq('email', q);
    } else {
      // ILIKE search across name, email, company
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,current_company.ilike.%${q}%`
      );
    }

    const { data: people, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Shape: resolve latest status per person
    const results = (people ?? []).map(person => {
      const statuses = person.person_statuses ?? [];
      const latest = statuses.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const statusDef = latest?.status_definitions as
        | { label: string; color: string }
        | null
        | undefined;

      return {
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        current_company: person.current_company,
        current_status_label: statusDef?.label ?? null,
        current_status_color: statusDef?.color ?? null,
      };
    });

    return NextResponse.json(results);
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
