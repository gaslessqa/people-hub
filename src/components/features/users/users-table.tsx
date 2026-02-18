'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Search } from 'lucide-react';

import type { Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';
import { CreateUserSheet } from './create-user-sheet';
import { EditUserSheet } from './edit-user-sheet';

interface UsersTableProps {
  users: Profile[];
  currentAdminId: string;
}

export function UsersTable({ users, currentAdminId }: UsersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const handleSuccess = useCallback(() => {
    setEditingUser(null);
    router.refresh();
  }, [router]);

  const filtered = users.filter(
    u =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4" data-testid="usersTable">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="users-search-input"
          />
        </div>
        <CreateUserSheet onSuccess={handleSuccess} />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Miembro desde</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {search ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(user => (
                <TableRow
                  key={user.id}
                  data-testid="user-table-row"
                  className={!user.is_active ? 'opacity-60' : undefined}
                >
                  <TableCell className="font-medium">
                    {user.full_name ?? '—'}
                    {user.id === currentAdminId && (
                      <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <UserRoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge isActive={user.is_active} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      data-testid="edit-user-btn"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditUserSheet
        user={editingUser}
        currentAdminId={currentAdminId}
        onClose={() => setEditingUser(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
