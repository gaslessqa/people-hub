'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const PERIODS = [
  { label: '7 días', value: 7 },
  { label: '30 días', value: 30 },
  { label: '90 días', value: 90 },
  { label: 'Todo', value: 0 },
];

interface PeriodFilterProps {
  currentPeriod: number;
}

export function PeriodFilter({ currentPeriod }: PeriodFilterProps) {
  const router = useRouter();

  return (
    <div className="flex gap-2" data-testid="dashboard-date-picker">
      {PERIODS.map(({ label, value }) => (
        <Button
          key={value}
          variant={currentPeriod === value ? 'default' : 'outline'}
          size="sm"
          onClick={() => router.push(`/dashboard?period=${value}`)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
