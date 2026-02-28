import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isLoginPage = nextUrl.pathname === '/login';

  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', nextUrl));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
