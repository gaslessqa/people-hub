'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import type { Profile } from '@/lib/types';
import { changeRoleSchema, type ChangeRoleFormData } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';
import { RolePermissionsMatrix } from './role-permissions-matrix';
import type { UserRole } from '@/lib/types';

const ROLE_OPTIONS = [
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'super_admin', label: 'Super Admin' },
] as const;

interface EditUserSheetProps {
  user: Profile | null;
  currentAdminId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserSheet({ user, currentAdminId, onClose, onSuccess }: EditUserSheetProps) {
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const form = useForm<ChangeRoleFormData>({
    resolver: zodResolver(changeRoleSchema),
    values: user ? { role: user.role } : { role: 'recruiter' },
  });

  const { isSubmitting } = form.formState;
  const isOwnAccount = user?.id === currentAdminId;

  const handleRoleChange = async (data: ChangeRoleFormData) => {
    if (!user) return;

    // Require confirmation when assigning super_admin
    if (data.role === 'super_admin' && user.role !== 'super_admin') {
      setPendingRole(data.role);
      setShowRoleConfirm(true);
      return;
    }

    await submitRoleChange(data.role);
  };

  const submitRoleChange = async (role: UserRole) => {
    if (!user) return;

    const response = await fetch(`/api/admin/users/${user.id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? 'Error al cambiar el rol');
      return;
    }

    toast.success('Rol actualizado correctamente');
    setShowRoleConfirm(false);
    setPendingRole(null);
    onSuccess();
  };

  const handleToggleStatus = async () => {
    if (!user || isOwnAccount) return;

    setIsTogglingStatus(true);

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !user.is_active }),
    });

    const result = await response.json();
    setIsTogglingStatus(false);

    if (!response.ok) {
      toast.error(result.error ?? 'Error al cambiar el estado');
      return;
    }

    toast.success(result.message);
    onSuccess();
  };

  if (!user) return null;

  return (
    <>
      <Sheet open={!!user} onOpenChange={open => !open && onClose()}>
        <SheetContent data-testid="edit-user-sheet">
          <SheetHeader>
            <SheetTitle>Editar usuario</SheetTitle>
            <SheetDescription>Modifica el rol o estado de la cuenta.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* User info */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2">
                <UserRoleBadge role={user.role} />
                <UserStatusBadge isActive={user.is_active} />
              </div>
            </div>

            {/* Role change form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRoleChange)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="edit-user-role-select">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || form.watch('role') === user.role}
                  data-testid="edit-user-role-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar rol'
                  )}
                </Button>
              </form>
            </Form>

            {/* Permissions matrix */}
            <RolePermissionsMatrix />

            {/* Status toggle */}
            {!isOwnAccount && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Estado de la cuenta</p>
                <Button
                  type="button"
                  variant={user.is_active ? 'destructive' : 'outline'}
                  className="w-full"
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus}
                  data-testid="toggle-user-status-btn"
                >
                  {isTogglingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {user.is_active ? 'Desactivar cuenta' : 'Activar cuenta'}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Super Admin role confirmation dialog */}
      <Dialog open={showRoleConfirm} onOpenChange={setShowRoleConfirm}>
        <DialogContent data-testid="role-change-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmar asignación de Super Admin
            </DialogTitle>
            <DialogDescription>
              Estás a punto de dar acceso total al sistema a{' '}
              <span className="font-semibold">{user.full_name}</span>. Este rol incluye gestión de
              usuarios y cambio de roles. ¿Estás seguro?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRoleConfirm(false);
                setPendingRole(null);
                form.setValue('role', user.role);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => pendingRole && submitRoleChange(pendingRole)}
              data-testid="role-change-confirm-btn"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
