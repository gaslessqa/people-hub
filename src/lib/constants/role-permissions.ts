import type { UserRole } from '@/lib/types';

export interface Permission {
  label: string;
  description: string;
}

export interface RolePermissionConfig {
  role: UserRole;
  label: string;
  permissions: string[];
}

export const PERMISSIONS: Permission[] = [
  { label: 'Ver personas', description: 'Acceso a la lista de candidatos y empleados' },
  { label: 'Crear personas', description: 'Agregar nuevos candidatos o empleados' },
  { label: 'Editar personas', description: 'Modificar datos de candidatos o empleados' },
  { label: 'Ver vacantes', description: 'Acceso a la lista de posiciones abiertas' },
  { label: 'Crear vacantes', description: 'Abrir nuevas posiciones de reclutamiento' },
  { label: 'Editar vacantes', description: 'Modificar posiciones existentes' },
  { label: 'Dar feedback', description: 'Agregar evaluaciones a candidatos' },
  { label: 'Ver todo el feedback', description: 'Ver evaluaciones de otros usuarios' },
  { label: 'Gestionar usuarios', description: 'Crear, editar y desactivar cuentas de sistema' },
  { label: 'Asignar roles', description: 'Cambiar el rol de usuarios del sistema' },
];

export const ROLE_PERMISSIONS: RolePermissionConfig[] = [
  {
    role: 'recruiter',
    label: 'Recruiter',
    permissions: [
      'Ver personas',
      'Crear personas',
      'Editar personas',
      'Ver vacantes',
      'Dar feedback',
    ],
  },
  {
    role: 'manager',
    label: 'Manager',
    permissions: ['Ver personas', 'Ver vacantes', 'Dar feedback', 'Ver todo el feedback'],
  },
  {
    role: 'hr_admin',
    label: 'HR Admin',
    permissions: [
      'Ver personas',
      'Crear personas',
      'Editar personas',
      'Ver vacantes',
      'Crear vacantes',
      'Editar vacantes',
      'Dar feedback',
      'Ver todo el feedback',
    ],
  },
  {
    role: 'super_admin',
    label: 'Super Admin',
    permissions: [
      'Ver personas',
      'Crear personas',
      'Editar personas',
      'Ver vacantes',
      'Crear vacantes',
      'Editar vacantes',
      'Dar feedback',
      'Ver todo el feedback',
      'Gestionar usuarios',
      'Asignar roles',
    ],
  },
];
