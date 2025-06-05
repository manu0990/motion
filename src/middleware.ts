import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || request.cookies.get('__Secure-next-auth.session-token')?.value;

  const protectedPaths = ['/home', '/api/auth/signout'];
  const publicPath = ['/', '/auth/signin', '/auth/signup'];

  const isprotectedPath = protectedPaths.includes(path);
  const isPublicPath = publicPath.includes(path);

  if (path.startsWith('/verify/')) {
    return NextResponse.next();
  }

  if (sessionToken && isPublicPath) {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  if (path === '/api/auth/signout' && !sessionToken) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  if (!sessionToken && isprotectedPath) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/api/auth/signout",
    "/auth/signin",
    "/verify/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};