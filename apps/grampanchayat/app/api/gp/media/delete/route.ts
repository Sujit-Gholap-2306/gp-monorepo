import { NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { deleteFile } from '@/lib/storage'
import { getMe } from '@/lib/api/gp-admins'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  let body: { subdomain?: string; url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const { subdomain, url } = body
  if (typeof subdomain !== 'string' || !subdomain) {
    return NextResponse.json({ message: 'subdomain is required' }, { status: 400 })
  }
  if (typeof url !== 'string' || !url) {
    return NextResponse.json({ message: 'url is required' }, { status: 400 })
  }

  try {
    await getMe(subdomain, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await deleteFile(url)
  return NextResponse.json({ ok: true })
}
