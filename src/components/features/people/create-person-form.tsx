'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { createPersonSchema, type CreatePersonFormData } from '@/lib/schemas/people';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

interface EmailWarning {
  existing_person_id: string;
  existing_person_name: string;
}

interface DuplicateCheckResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const EMAIL_DEBOUNCE_MS = 400;

export function CreatePersonForm() {
  const router = useRouter();
  const [emailWarning, setEmailWarning] = useState<EmailWarning | null>(null);
  const [newPersonId, setNewPersonId] = useState<string | null>(null);
  const [emailDuplicate, setEmailDuplicate] = useState<DuplicateCheckResult | null>(null);
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<CreatePersonFormData>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      current_company: '',
      current_position: '',
      location: '',
      notes: '',
    },
  });

  const { isSubmitting } = form.formState;
  const watchedEmail = form.watch('email');

  // Real-time email duplicate check
  useEffect(() => {
    const email = watchedEmail?.trim();

    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);

    // Clear duplicate if email is empty or invalid format
    if (!email || !email.includes('@')) {
      setEmailDuplicate(null);
      return;
    }

    emailDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/people/search?q=${encodeURIComponent(email)}&field=email&limit=1`
        );
        if (!res.ok) return;
        const data: DuplicateCheckResult[] = await res.json();
        setEmailDuplicate(data[0] ?? null);
      } catch {
        // Ignore network errors for duplicate check
      }
    }, EMAIL_DEBOUNCE_MS);

    return () => {
      if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
    };
  }, [watchedEmail]);

  const onSubmit = async (data: CreatePersonFormData) => {
    const response = await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? 'Error al crear la persona');
      return;
    }

    if (result.email_warning) {
      setEmailWarning(result.email_warning);
      setNewPersonId(result.id);
      toast.warning('Persona creada, pero ya existe otra con el mismo email');
      return;
    }

    toast.success('Persona registrada correctamente');
    router.push(`/people/${result.id}`);
  };

  // Post-submit email warning state (person was created but duplicate found)
  if (emailWarning && newPersonId) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Alert data-testid="email_warning_banner">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La persona fue creada, pero ya existe otra con el mismo email:{' '}
              <Link
                href={`/people/${emailWarning.existing_person_id}`}
                className="font-medium underline hover:no-underline"
                data-testid="email_warning_link"
              >
                {emailWarning.existing_person_name}
              </Link>
            </AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button onClick={() => router.push(`/people/${newPersonId}`)}>Ver perfil nuevo</Button>
            <Button variant="outline" asChild>
              <Link href={`/people/${emailWarning.existing_person_id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver perfil existente
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            data-testid="createPersonForm"
            className="space-y-6"
          >
            {/* Real-time email duplicate banner */}
            {emailDuplicate && (
              <Alert data-testid="email_duplicate_warning">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ya existe una persona con este email:{' '}
                  <Link
                    href={`/people/${emailDuplicate.id}`}
                    className="font-medium underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {emailDuplicate.first_name} {emailDuplicate.last_name}
                  </Link>
                  . Puedes continuar si es intencional.
                </AlertDescription>
              </Alert>
            )}

            {/* Name row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: María" data-testid="first_name_input" {...field} />
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
                      <Input placeholder="Ej: García" data-testid="last_name_input" {...field} />
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
                      <Input
                        type="email"
                        placeholder="maria@ejemplo.com"
                        data-testid="email_input"
                        {...field}
                      />
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
                      <Input
                        type="tel"
                        placeholder="+34 600 000 000"
                        data-testid="phone_input"
                        {...field}
                      />
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
                      placeholder="https://linkedin.com/in/maria-garcia"
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
                      <Input
                        placeholder="Ej: Acme Corp"
                        data-testid="current_company_input"
                        {...field}
                      />
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
                      <Input
                        placeholder="Ej: Senior Developer"
                        data-testid="current_position_input"
                        {...field}
                      />
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
                      <Input
                        placeholder="Ej: Madrid, España"
                        data-testid="location_input"
                        {...field}
                      />
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas iniciales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agrega cualquier nota relevante sobre esta persona..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="create_person_submit">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Guardando...' : 'Crear Persona'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
