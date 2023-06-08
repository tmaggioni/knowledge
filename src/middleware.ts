import { type NextRequest, NextResponse } from 'next/server'

import { type JWTPayload } from 'jose'

import { verifyAuth } from './lib/auth'

interface UserJwtPayload extends JWTPayload {
  jti: string
  iat: number
  userid: string
  parent: string
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('user-token')?.value
  const verifiedToken = token && (await verifyAuth(token))

  if (
    (req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register')) &&
    !verifiedToken
  ) {
    return
  }

  if (!verifiedToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (
    req.url.includes('/login') ||
    (req.url.includes('/register') && verifiedToken)
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (
    (req.url.includes('/entity') ||
      req.url.includes('/users') ||
      req.url.includes('/bankAccount')) &&
    (verifiedToken as UserJwtPayload).parent
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/users',
    '/login',
    '/',
    '/register',
    '/dashboard/entity',
    '/dashboard/bankAccount',
    '/dashboard/users',
  ],
}
