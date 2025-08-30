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

// Cache for route matching to improve performance
const routeCache = new Map<string, boolean>();

// Optimized route matching function
function isRouteMatch(pathname: string, routes: string[]): boolean {
  const cacheKey = `${pathname}:${routes.join(',')}`;
  
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }
  
  const result = routes.some(route => pathname.startsWith(route));
  routeCache.set(cacheKey, result);
  
  // Limit cache size to prevent memory leaks
  if (routeCache.size > 1000) {
    const firstKey = routeCache.keys().next().value;
    routeCache.delete(firstKey);
  }
  
  return result;
}

// Fast token validation without complex parsing
function getTokenFromRequest(request: NextRequest): string | null {
  // Check cookies first (faster)
  const refreshToken = request.cookies.get('refreshToken')?.value;
  if (refreshToken) return refreshToken;
  
  // Fallback to headers
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Fast path: Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Fast path: Only process specific routes that need authentication checks
  const isProtectedRoute = isRouteMatch(pathname, protectedRoutes);
  const isAuthRoute = isRouteMatch(pathname, authRoutes);
  
  // If no special handling needed, continue immediately
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }
  
  // Fast token check
  const token = getTokenFromRequest(request);
  const isAuthenticated = !!token;

  // Fast redirects for protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Fast redirects for auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match only specific routes that need authentication checks
     * This significantly reduces middleware overhead
     */
    '/profile/:path*',
    '/admin/:path*',
    '/manage-stores/:path*',
    '/history/:path*',
    '/analytics/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password/:path*'
  ],
};
