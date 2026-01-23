import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // API 라우트는 middleware를 건너뜀
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuth = !!token;
    const isAuthPage = pathname.startsWith('/login') || 
                       pathname.startsWith('/register');

    // 인증 페이지(/login, /register)인 경우
    if (isAuthPage) {
      if (isAuth) {
        // 이미 로그인된 사용자는 dashboard로 리디렉션
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      // 로그인 안 된 사용자는 접근 허용
      return NextResponse.next();
    }

    // 보호된 페이지인 경우
    if (!isAuth) {
      // 로그인 안 된 사용자는 로그인 페이지로 리디렉션
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      if (request.nextUrl.search) {
        loginUrl.searchParams.set('query', request.nextUrl.search);
      }
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // 에러 발생 시 요청을 그대로 통과시킴 (무한 루프 방지)
    // 개발 환경에서만 에러 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware error:', error);
    }
    return NextResponse.next();
  }
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
