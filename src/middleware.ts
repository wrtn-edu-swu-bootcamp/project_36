import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // API 라우트, 홈페이지, 정적 파일은 middleware를 건너뜀
  if (
    pathname.startsWith('/api/') || 
    pathname === '/' ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 인증 관련 페이지 정의
  const publicPages = ['/login', '/register'];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // 공개 페이지는 항상 접근 허용 (무한 루프 방지)
  if (isPublicPage) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuth = !!token;

    // 보호된 페이지인데 인증되지 않은 경우
    if (!isAuth) {
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
