import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Auth Callback Route
 *
 * Handles:
 * - Email confirmation links (signUp flow)
 * - Password reset tokens
 *
 * Supabase sends the user to this URL with a token_hash and type.
 * We exchange the token for a session and redirect accordingly.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'email' | 'recovery' | 'signup' | null;
  const next = searchParams.get('next') ?? '/dashboard';
  const code = searchParams.get('code');

  let response = NextResponse.redirect(`${origin}${next}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(`${origin}${next}`);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

    if (error) {
      const errorUrl = new URL('/reset-password', origin);
      errorUrl.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(errorUrl);
    }

    return response;
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const errorUrl = new URL('/reset-password', origin);
      errorUrl.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(errorUrl);
    }

    return response;
  }

  // No token or code — redirect to login
  return NextResponse.redirect(new URL('/login', origin));
}
