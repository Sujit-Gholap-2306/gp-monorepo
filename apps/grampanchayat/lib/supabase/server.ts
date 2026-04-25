import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — cookie writes are no-ops outside of middleware/route handlers
          }
        },
      },
    }
  )
}

/**
 * JWT for `Authorization: Bearer` when calling grampanchayat-api from a Server Component / Route Handler.
 * Tries getSession → refreshSession → parsing `sb-<ref>-auth-token` cookies (incl. chunked).
 */
export async function getSupabaseAccessToken(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const { data: s0 } = await supabase.auth.getSession()
  if (s0.session?.access_token) return s0.session.access_token

  const { data: ref, error } = await supabase.auth.refreshSession()
  if (!error && ref.session?.access_token) return ref.session.access_token

  const { data: s1 } = await supabase.auth.getSession()
  if (s1.session?.access_token) return s1.session.access_token

  return readAccessTokenFromAuthCookies()
}

async function readAccessTokenFromAuthCookies(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  let ref: string
  try {
    ref = new URL(url).hostname.split('.')[0] ?? ''
  } catch {
    return null
  }
  if (!ref) return null

  const prefix = `sb-${ref}-auth-token`
  const cookieStore = await cookies()
  const parts = cookieStore
    .getAll()
    .filter((c) => c.name === prefix || c.name.startsWith(`${prefix}.`))
    .sort((a, b) => {
      if (a.name === prefix) return -1
      if (b.name === prefix) return 1
      const ai = Number.parseInt(a.name.slice(prefix.length + 1), 10)
      const bi = Number.parseInt(b.name.slice(prefix.length + 1), 10)
      return (Number.isNaN(ai) ? 0 : ai) - (Number.isNaN(bi) ? 0 : bi)
    })

  if (parts.length === 0) return null

  const merged = parts.map((p) => p.value).join('')
  try {
    const parsed = JSON.parse(merged) as { access_token?: string }
    return parsed.access_token ?? null
  } catch {
    return null
  }
}
