import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from "./lib/auth0";

const protectedRoutes = ['/panel/*'];

export async function proxy(request: NextRequest) {
  const session = await auth0.getSession();

  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  if (request.nextUrl.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/panel', request.url));
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};