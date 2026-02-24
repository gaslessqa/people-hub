import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { CreatePersonForm } from '@/components/features/people/create-person-form';
import { Button } from '@/components/ui/button';

export default function NewPersonPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/people">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver a personas</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Persona</h1>
          <p className="text-muted-foreground">Registra un nuevo candidato, empleado o contacto</p>
        </div>
      </div>

      <CreatePersonForm />
    </div>
  );
}
