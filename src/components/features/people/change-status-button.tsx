'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusChangeModal } from './status-change-modal';

interface ChangeStatusButtonProps {
  personId: string;
  currentStatusValue: string | null;
}

export function ChangeStatusButton({ personId, currentStatusValue }: ChangeStatusButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button data-testid="change_status_btn" onClick={() => setOpen(true)}>
        <ArrowUpDown className="mr-2 h-4 w-4" />
        Cambiar Estado
      </Button>

      <StatusChangeModal
        open={open}
        onOpenChange={setOpen}
        personId={personId}
        currentStatusValue={currentStatusValue}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
