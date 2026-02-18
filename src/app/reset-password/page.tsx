'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/auth-context';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();
  const [tokenError, setTokenError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'invalid_token') {
      setTokenError(
        'El enlace de recuperación no es válido o ha expirado. Por favor solicita uno nuevo.'
      );
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    const { error } = await updatePassword(data.password);

    if (error) {
      toast.error('No se pudo actualizar la contraseña. Por favor solicita un nuevo enlace.');
      return;
    }

    toast.success('Contraseña actualizada correctamente');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="w-full max-w-md px-4" data-testid="resetPasswordPage">
      <Card className="shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <KeyRound className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Nueva contraseña</CardTitle>
          <CardDescription>Elige una contraseña segura para tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokenError && (
            <Alert variant="destructive" data-testid="reset-password-error-alert">
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
          )}

          {!tokenError && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Mínimo 8 caracteres"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                          data-testid="reset-password-new-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Repite tu contraseña"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                          data-testid="reset-password-confirm-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="reset-password-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar contraseña'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Suspense fallback={<div className="w-full max-w-md px-4 text-center">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
