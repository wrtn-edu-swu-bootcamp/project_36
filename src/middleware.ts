import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');

  // 인증 페이지(/login, /register)인 경우
  if (isAuthPage) {
    if (isAuth) {
      // 이미 로그인된 사용자는 dashboard로 리디렉션
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // 로그인 안 된 사용자는 접근 허용
    return NextResponse.next();
  }

  // 보호된 페이지인 경우
  if (!isAuth) {
    // 로그인 안 된 사용자는 로그인 페이지로 리디렉션
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/medicines/:path*',
    '/schedule/:path*',
    '/settings/:path*',
    '/mypage/:path*',
    '/my-medicines/:path*',
    '/education/:path*',
    '/login',
    '/register',
  ],
};
