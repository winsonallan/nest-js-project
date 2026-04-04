import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/login') return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/admin')) {
    const userCookie = request.cookies.get('user')?.value;
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;
    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};