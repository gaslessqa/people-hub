import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';
import { StatusDefinitionsList } from '@/components/features/statuses/status-definitions-list';
import type { StatusDefinition } from '@/components/features/statuses/status-definition-form';

export const metadata = {
  title: 'Configuración de Estados | People Hub',
};

async function getPageData() {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || !['hr_admin', 'super_admin'].includes(profile.role) || !profile.is_active) {
    redirect('/dashboard');
  }

  const { data: statuses } = await supabase
    .from('status_definitions')
    .select('id, status_type, status_value, label, color, order_index, is_active')
    .order('status_type', { ascending: true })
    .order('order_index', { ascending: true });

  return { statuses: (statuses ?? []) as StatusDefinition[] };
}

export default async function AdminStatusesPage() {
  const { statuses } = await getPageData();

  return (
    <div className="space-y-6" data-testid="statusConfigPage">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración de Estados</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los estados disponibles para candidatos, empleados y externos.
        </p>
      </div>

      <StatusDefinitionsList initialStatuses={statuses} />
    </div>
  );
}
