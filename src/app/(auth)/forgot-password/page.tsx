'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/auth-context';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Always show success to avoid email enumeration
    const { error } = await requestPasswordReset(data.email);

    if (error) {
      // Silent — still show success message to avoid email enumeration
      toast.error('Error al procesar la solicitud. Intenta de nuevo.');
      return;
    }

    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md px-4" data-testid="forgotPasswordPage">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Mail className="h-7 w-7" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Revisa tu email</CardTitle>
            <CardDescription>
              Si existe una cuenta con ese email, recibirás instrucciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert
              className="bg-green-50 border-green-200"
              data-testid="forgot-password-success-alert"
            >
              <AlertDescription className="text-green-800 text-sm">
                Si existe una cuenta asociada a ese email, recibirás un enlace para restablecer tu
                contraseña. El enlace expira en 1 hora.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Link href="/login" className="text-sm text-primary hover:underline font-medium">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4" data-testid="forgotPasswordPage">
      <Card className="shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <KeyRound className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
          <CardDescription>Ingresa tu email y te enviaremos un enlace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        data-testid="forgot-password-email-input"
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
                data-testid="forgot-password-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
