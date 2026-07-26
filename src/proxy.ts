import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Unauthenticated — send to parent login (skip for all /login/* paths)
  if (!user) {
    if (!pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login/parent', request.url))
    }
    return supabaseResponse
  }

  // Fetch role once for all authenticated checks
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // Authenticated user on login page — redirect to their home
  if (pathname.startsWith('/login')) {
    const dest = role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Role-based route guarding
  if (pathname.startsWith('/teacher') && role !== 'teacher') {
    return NextResponse.redirect(new URL('/parent/dashboard', request.url))
  }
  if (pathname.startsWith('/parent') && role !== 'parent') {
    return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Exclude static files and Next.js internals; also skip server action POSTs
  // to avoid the proxy running on every form submission to the same URL.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
