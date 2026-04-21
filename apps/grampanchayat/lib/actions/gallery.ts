'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { uploadFile, deleteFile } from '@/lib/storage'

async function getAuthorizedGp(subdomain: string) {
  const supabase = await createSupabaseServerClient()
  const [tenant, { data: { user } }] = await Promise.all([
    getTenant(subdomain),
    supabase.auth.getUser(),
  ])
  if (!tenant || !user) throw new Error('Unauthorized')
  return { supabase, tenant }
}

export async function addGalleryItem(subdomain: string, formData: FormData) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  const url = await uploadFile(tenant.id, 'gallery', file)
  const type = file.type.startsWith('video/') ? 'video' : 'photo'

  const { data: last } = await supabase
    .from('gallery')
    .select('sort_order')
    .eq('gp_id', tenant.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (last?.sort_order ?? -1) + 1

  await supabase.from('gallery').insert({
    gp_id: tenant.id,
    url,
    type,
    caption_mr: (formData.get('caption_mr') as string) || null,
    caption_en: (formData.get('caption_en') as string) || null,
    sort_order,
  })

  revalidatePath(`/${subdomain}/gallery`)
  revalidatePath(`/${subdomain}/admin/gallery`)
}

export async function deleteGalleryItem(
  subdomain: string,
  id: string,
  url: string,
) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)
  await deleteFile(url)
  await supabase.from('gallery').delete().eq('id', id).eq('gp_id', tenant.id)
  revalidatePath(`/${subdomain}/gallery`)
  revalidatePath(`/${subdomain}/admin/gallery`)
}
