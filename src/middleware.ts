import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. 응답 객체 초기화
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. Supabase 서버 클라이언트 설정
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options, path: '/' })
          )
        },
      },
    }
  )

  // 3. 현재 유저 정보 확인 (세션 유효성 검사)
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // --- [보호 로직 시작] ---

  // 비로그인 유저 보호: 오직 '/'만 허용하고 나머지는 '/'로 리다이렉트 (onboarding 허용)
  if (pathname !== '/onboarding' && pathname !== '/fbti' && !user && pathname !== '/') {
    const loginUrl = new URL('/', request.url)
    // 로그인이 필요한 페이지였다면, 로그인 후 돌아올 수 있게 쿼리 파라미터를 남길 수도 있습니다.
    // loginUrl.searchParams.set('redirectedFrom', pathname) 
    return NextResponse.redirect(loginUrl)
  }

  // 로그인 유저 보호: 로그인 상태에서 '/' 접근 시 '/home'으로 강제 이동
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser();
    const ADMIN_EMAILS = ['snakes0625@gmail.com']; // 혹은 DB role 확인

    if (!user || !ADMIN_EMAILS.includes(user.email!)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response
}

// 4. 미들웨어가 실행되지 않을 경로 설정 (이미지, API, 인증 콜백 등 제외)
export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 경로에서 미들웨어 실행:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - auth/callback (인증 콜백 라우트 - 필수 제외!)
     * - favicon.ico, manifest.json 등 정적 자산
     */
    '/((?!api|_next/static|_next/image|auth/callback|favicon.ico|manifest.json|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}