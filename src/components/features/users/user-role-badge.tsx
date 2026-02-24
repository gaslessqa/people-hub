import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/lib/types';

const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  super_admin: {
    label: 'Super Admin',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200',
  },
  hr_admin: {
    label: 'HR Admin',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
  },
  manager: {
    label: 'Manager',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200',
  },
  recruiter: {
    label: 'Recruiter',
    className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
  },
};

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? { label: role, className: '' };

  return (
    <Badge variant="outline" className={config.className} data-testid="user-role-badge">
      {config.label}
    </Badge>
  );
}
