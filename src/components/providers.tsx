'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side providers wrapper
 *
 * This component wraps all client-side context providers.
 * Add new providers here to make them available throughout the app.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
