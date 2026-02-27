'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

export function DashboardRefresh() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      setLastUpdated(new Date());
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [router]);

  function handleRefresh() {
    setIsRefreshing(true);
    router.refresh();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  }

  const timeStr = lastUpdated.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Actualizado {timeStr}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        data-testid="dashboard-refresh-button"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="ml-1.5">Actualizar</span>
      </Button>
    </div>
  );
}
