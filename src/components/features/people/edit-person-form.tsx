'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { updatePersonSchema, type UpdatePersonFormData } from '@/lib/schemas/people';
import type { Person } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SOURCE_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referido' },
  { value: 'job_board', label: 'Portal de Empleo' },
  { value: 'direct', label: 'Contacto Directo' },
  { value: 'other', label: 'Otro' },
] as const;

interface EditPersonFormProps {
  person: Person;
}

export function EditPersonForm({ person }: EditPersonFormProps) {
  const router = useRouter();

  const form = useForm<UpdatePersonFormData>({
    resolver: zodResolver(updatePersonSchema),
    defaultValues: {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone ?? '',
      linkedin_url: person.linkedin_url ?? '',
      current_company: person.current_company ?? '',
      current_position: person.current_position ?? '',
      location: person.location ?? '',
      source: person.source ?? undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: UpdatePersonFormData) => {
    const response = await fetch(`/api/people/${person.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, updated_at: person.updated_at }),
    });

    const result = await response.json();

    if (response.status === 409) {
      toast.error(result.error ?? 'Conflicto de edición. Recarga la página.');
      return;
    }

    if (!response.ok) {
      toast.error(result.error ?? 'Error al guardar los cambios');
      return;
    }

    toast.success('Cambios guardados correctamente');
    router.push(`/people/${person.id}`);
  };

  const handleCancel = () => router.push(`/people/${person.id}`);

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            data-testid="editPersonForm"
            className="space-y-6"
          >
            {/* Name row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input data-testid="first_name_input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido *</FormLabel>
                    <FormControl>
                      <Input data-testid="last_name_input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email + Phone row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" data-testid="email_input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" data-testid="phone_input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* LinkedIn URL */}
            <FormField
              control={form.control}
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      data-testid="linkedin_url_input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company + Position row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="current_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa Actual</FormLabel>
                    <FormControl>
                      <Input data-testid="current_company_input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Actual</FormLabel>
                    <FormControl>
                      <Input data-testid="current_position_input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location + Source row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input data-testid="location_input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger data-testid="source_select">
                          <SelectValue placeholder="Selecciona una fuente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                data-testid="cancel_edit_btn"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="edit_person_submit">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
