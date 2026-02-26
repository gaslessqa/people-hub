import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CreatePositionForm } from '@/components/features/positions/create-position-form';

export default function NewPositionPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/positions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Vacante</h1>
          <p className="text-muted-foreground">Crea una nueva posición para reclutar candidatos</p>
        </div>
      </div>

      <CreatePositionForm />
    </div>
  );
}
