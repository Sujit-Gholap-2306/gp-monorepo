import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware-client'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'grampanchayat.co.in'
const RESERVED = new Set(['www', 'api', 'app', 'admin', 'mail', 'smtp'])

function extractSubdomain(host: string): string | null {
  const cleanHost = host.split(':')[0]
  if (cleanHost === ROOT_DOMAIN || cleanHost === 'localhost') return null

  const parts = cleanHost.split('.')
  if (parts.length < 2) return null

  const sub = parts[0]
  return RESERVED.has(sub) ? null : sub
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''

  // Local dev: ?tenant=nashik overrides subdomain detection
  const devTenant =
    process.env.NODE_ENV === 'development'
      ? request.nextUrl.searchParams.get('tenant')
      : null

  const subdomain = devTenant ?? extractSubdomain(host)

  if (!subdomain) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.searchParams.delete('tenant')
  url.pathname = `/${subdomain}${url.pathname}`

  const response = NextResponse.rewrite(url)
  response.headers.set('x-tenant', subdomain)

  // Refresh Supabase auth session on every request
  const supabase = createMiddlewareClient(request, response)
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
