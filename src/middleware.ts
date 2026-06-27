import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const path = req.nextUrl.pathname
  const isAuthPage = path.startsWith('/login')

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|landing|agenda).*)'],
}
