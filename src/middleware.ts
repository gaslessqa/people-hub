/**
 * Next.js Middleware for Supabase Auth
 *
 * This middleware:
 * 1. Refreshes the user's session on each request
 * 2. Protects routes that require authentication
 * 3. Redirects unauthenticated users to login
 * 4. Redirects authenticated users away from auth pages
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/people', '/positions', '/settings', '/admin'];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow request to continue
    // The app will show appropriate error messages
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session if it exists
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
