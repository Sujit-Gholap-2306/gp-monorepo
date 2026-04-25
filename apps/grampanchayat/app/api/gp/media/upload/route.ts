import { NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { uploadFile } from '@/lib/storage'
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

  const formData = await request.formData()
  const subdomain = formData.get('subdomain')
  const folder = formData.get('folder')
  const file = formData.get('file')

  if (typeof subdomain !== 'string' || !subdomain) {
    return NextResponse.json({ message: 'subdomain is required' }, { status: 400 })
  }
  if (folder !== 'gallery' && folder !== 'events') {
    return NextResponse.json({ message: 'folder must be gallery or events' }, { status: 400 })
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: 'file is required' }, { status: 400 })
  }

  const tenant = await getTenant(subdomain)
  if (!tenant) {
    return NextResponse.json({ message: 'Tenant not found' }, { status: 404 })
  }

  try {
    await getMe(subdomain, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const url = await uploadFile(tenant.id, folder as 'gallery' | 'events', file)
  return NextResponse.json({ url })
}
