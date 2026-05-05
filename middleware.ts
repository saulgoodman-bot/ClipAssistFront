import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('ca_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAppPage = pathname.startsWith('/upload') || pathname.startsWith('/status') || pathname.startsWith('/clips') || pathname.startsWith('/export');

  // If doing something on /(app), and not logged in => go to login
  if (isAppPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If on login/register and ALREADY logged in => go to app
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/upload', request.url));
  }

  // Default route handling: redirect to /upload if logged in, or /login if not
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/upload', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
