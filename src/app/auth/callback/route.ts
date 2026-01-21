import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            console.log('setAll called with', cookiesToSet.length, 'cookies')
            
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                httpOnly: false,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production', // localhost에서는 false
              })
            })
          },
        },
      }
    )

    // 코드를 세션으로 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }

    if (!data.session) {
      console.error('No session returned from exchangeCodeForSession')
      return NextResponse.redirect(`${origin}/?error=no_session`)
    }

    console.log('Session created:', !!data.session)
    console.log('User:', data.session?.user?.email)

    // 🔥 핵심: 명시적으로 세션을 다시 설정 (이게 쿠키 설정을 트리거함)
    const { error: setError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (setError) {
      console.error('setSession error:', setError.message)
      return NextResponse.redirect(`${origin}/?error=set_session_failed`)
    }

    const allCookies = response.cookies.getAll()
    console.log('Response cookies:', allCookies.map(c => c.name))

    return response
  }

  return NextResponse.redirect(`${origin}/?error=no_code_provided`)
}