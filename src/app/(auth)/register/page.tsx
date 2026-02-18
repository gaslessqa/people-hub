'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/auth-context';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth';
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
import { PasswordInput } from '@/components/ui/password-input';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: RegisterFormData) => {
    const { error } = await signUp(data.email, data.password, data.full_name);

    if (error) {
      toast.error(error);
      return;
    }

    setRegisteredEmail(data.email);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="w-full max-w-md px-4" data-testid="registerPage">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Mail className="h-7 w-7" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">¡Revisa tu email!</CardTitle>
            <CardDescription>Enviamos un enlace de confirmación a tu correo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4" data-testid="register-success-screen">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800 text-sm">
                Hemos enviado un email de confirmación a{' '}
                <span className="font-semibold">{registeredEmail}</span>. Por favor revisa tu
                bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground text-center">
              ¿No recibiste el email?{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={async () => {
                  const { error } = await signUp(registeredEmail, '****', 'resend');
                  if (!error) {
                    toast.success('Email de confirmación reenviado');
                  }
                }}
                data-testid="register-resend-btn"
              >
                Reenviar email
              </button>
            </p>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-primary hover:underline"
                data-testid="register-login-link"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4" data-testid="registerPage">
      <Card className="shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Users className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
          <CardDescription>Regístrate para acceder a People Hub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan García"
                        autoComplete="name"
                        disabled={isSubmitting}
                        data-testid="register-fullname-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        data-testid="register-email-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        data-testid="register-password-input"
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
                        data-testid="register-confirm-password-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage data-testid="register-error-alert" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="register-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
                data-testid="register-login-link"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        People Hub v1.0 • HR Management Platform
      </p>
    </div>
  );
}
