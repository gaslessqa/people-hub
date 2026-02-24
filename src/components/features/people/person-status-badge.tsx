import { Badge } from '@/components/ui/badge';

interface PersonStatusBadgeProps {
  label: string;
  color: string;
}

export function PersonStatusBadge({ label, color }: PersonStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      style={{
        backgroundColor: color + '1a',
        color,
        borderColor: color + '40',
      }}
      data-testid="person-status-badge"
    >
      {label}
    </Badge>
  );
}
