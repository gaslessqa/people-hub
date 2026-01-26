'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

/**
 * Auth context state interface
 */
interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

/**
 * Auth context value interface
 */
interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
};

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider component
 *
 * Provides authentication state and methods to child components.
 * Listens for auth state changes and syncs with Supabase.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(initialState);
  const supabase = createClient();

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }

      return data;
    },
    [supabase]
  );

  /**
   * Refresh the current user's profile
   */
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;

    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = error.message;

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales incorrectas. Por favor verifica tu email y contraseña.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor confirma tu email antes de iniciar sesión.';
        }

        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { error: errorMessage };
      }

      // Auth state change listener will handle the rest
      return { error: null };
    },
    [supabase]
  );

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    await supabase.auth.signOut();

    setState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null,
    });

    router.push('/login');
    router.refresh();
  }, [supabase, router]);

  /**
   * Initialize auth state and listen for changes
   */
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: null,
        });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          error: null,
        });
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: null,
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setState(prev => ({
          ...prev,
          session,
          user: session.user,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 *
 * @throws {Error} If used outside of AuthProvider
 * @returns Auth context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, profile, signOut, loading } = useAuth();
 *
 *   if (loading) return <Spinner />;
 *   if (!user) return <LoginButton />;
 *
 *   return (
 *     <div>
 *       <p>Welcome, {profile?.full_name}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook to check if user has a specific role
 *
 * @param allowedRoles - Array of allowed roles
 * @returns Whether the user has one of the allowed roles
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const hasAccess = useHasRole(['super_admin', 'hr_admin']);
 *
 *   if (!hasAccess) return <AccessDenied />;
 *
 *   return <AdminContent />;
 * }
 * ```
 */
export function useHasRole(allowedRoles: string[]): boolean {
  const { profile, loading } = useAuth();

  if (loading || !profile) return false;

  return allowedRoles.includes(profile.role);
}
