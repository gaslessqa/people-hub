import { Badge } from '@/components/ui/badge';

interface UserStatusBadgeProps {
  isActive: boolean;
}

export function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  return isActive ? (
    <Badge
      variant="outline"
      className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      data-testid="user-status-badge"
    >
      Activo
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
      data-testid="user-status-badge"
    >
      Inactivo
    </Badge>
  );
}
