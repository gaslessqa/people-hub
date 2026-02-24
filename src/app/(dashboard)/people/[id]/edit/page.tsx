import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { EditPersonForm } from '@/components/features/people/edit-person-form';

interface EditPersonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPersonPage({ params }: EditPersonPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: person, error } = await supabase.from('people').select('*').eq('id', id).single();

  if (error || !person) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/people/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al perfil
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Persona</h1>
          <p className="text-muted-foreground">
            {person.first_name} {person.last_name}
          </p>
        </div>
      </div>

      <EditPersonForm person={person} />
    </div>
  );
}
