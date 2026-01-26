'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2, Info } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Demo credentials - these match users created in backend setup
const demoCredentials = [
  { email: 'admin@peoplehub.dev', password: 'Admin123!', role: 'Super Admin' },
  { email: 'hr@peoplehub.dev', password: 'HrAdmin123!', role: 'HR Admin' },
  { email: 'recruiter@peoplehub.dev', password: 'Recruiter123!', role: 'Recruiter' },
  { email: 'manager@peoplehub.dev', password: 'Manager123!', role: 'Manager' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Credenciales incorrectas. Por favor verifica tu email y contraseña.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu email antes de iniciar sesión.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError(null);
  };

  return (
    <div className="w-full max-w-md px-4">
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
          {/* Demo credentials alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 text-sm font-medium">
              Credenciales de Prueba
            </AlertTitle>
            <AlertDescription className="text-blue-700 text-xs mt-2 space-y-1">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDemoLogin(cred.email, cred.password)}
                  className="block w-full text-left hover:bg-blue-100 p-1 rounded transition-colors"
                >
                  <span className="font-medium">{cred.role}:</span> {cred.email}
                </button>
              ))}
            </AlertDescription>
          </Alert>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              ¿Olvidaste tu contraseña?{' '}
              <button className="text-primary hover:underline">Recuperar</button>
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
