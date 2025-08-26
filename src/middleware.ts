import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/admin',
  '/manage-stores',
  '/history',
  '/analytics'
];

// Define auth routes that should redirect if already authenticated
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies or headers
  const token = request.cookies.get('refreshToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const isAuthenticated = !!token;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth routes while already authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
