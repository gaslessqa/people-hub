import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';
import { UsersTable } from '@/components/features/users/users-table';

export const metadata = {
  title: 'Gestión de Usuarios | People Hub',
};

async function getAdminData() {
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

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!adminProfile || adminProfile.role !== 'super_admin' || !adminProfile.is_active) {
    redirect('/dashboard');
  }

  const { data: allUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return { adminProfile, users: allUsers ?? [] };
}

export default async function AdminUsersPage() {
  const { adminProfile, users } = await getAdminData();

  return (
    <div className="space-y-6" data-testid="adminUsersPage">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-1">
          Administra los usuarios del sistema y sus roles de acceso.
        </p>
      </div>

      <UsersTable users={users} currentAdminId={adminProfile.id} />
    </div>
  );
}
