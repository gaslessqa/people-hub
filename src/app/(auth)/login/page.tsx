'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/auth-context';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';

const isDev = process.env.NODE_ENV === 'development';

const demoCredentials = [
  { email: 'admin@peoplehub.dev', password: 'Admin123!', role: 'Super Admin' },
  { email: 'hr@peoplehub.dev', password: 'HrAdmin123!', role: 'HR Admin' },
  { email: 'recruiter@peoplehub.dev', password: 'Recruiter123!', role: 'Recruiter' },
  { email: 'manager@peoplehub.dev', password: 'Manager123!', role: 'Manager' },
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await signIn(data.email, data.password);

    if (error) {
      toast.error(error);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleDemoLogin = (email: string, password: string) => {
    form.setValue('email', email);
    form.setValue('password', password);
  };

  return (
    <div className="w-full max-w-md px-4" data-testid="loginPage">
      <Card className="shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Users className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">People Hub</CardTitle>
          <CardDescription>Plataforma de gestión de RRHH</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Demo credentials alert — development only */}
          {isDev && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 text-sm font-medium">
                Credenciales de Prueba
              </AlertTitle>
              <AlertDescription className="text-blue-700 text-xs mt-2 space-y-1">
                {demoCredentials.map(cred => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => handleDemoLogin(cred.email, cred.password)}
                    className="block w-full text-left hover:bg-blue-100 p-1 rounded transition-colors"
                  >
                    <span className="font-medium">{cred.role}:</span> {cred.email}
                  </button>
                ))}
              </AlertDescription>
            </Alert>
          )}

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
                        data-testid="login-email-input"
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
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        data-testid="login-password-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage data-testid="login-error-alert" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="login-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
                data-testid="login-forgot-password-link"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
            <p>
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
                data-testid="login-register-link"
              >
                Regístrate
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
