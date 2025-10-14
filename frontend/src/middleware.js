import { NextResponse } from 'next/server';

/**
 * Middleware to block access to specific routes
 * This runs on every request before the page is rendered
 */
function middleware(request) {
  const { pathname } = request.nextUrl;

  // Block access to /profile page - redirect to home page
  if (pathname === '/profile' || pathname.startsWith('/profile/')) {
    console.log(`🚫 Blocked access to: ${pathname}`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 * This matcher ensures the middleware only runs on specific paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$|.*\\.webp$|.*\\.ico$).*)',
  ],
};

export default middleware;
