'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types'

async function getAuthorizedGp(subdomain: string) {
  const supabase = await createSupabaseServerClient()
  const [tenant, { data: { user } }] = await Promise.all([
    getTenant(subdomain),
    supabase.auth.getUser(),
  ])
  if (!tenant || !user) throw new Error('Unauthorized')
  return { supabase, tenant }
}

export async function createAnnouncement(subdomain: string, formData: FormData) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const is_published = formData.get('is_published') === 'true'

  const data: TablesInsert<'announcements'> = {
    gp_id: tenant.id,
    title_mr: formData.get('title_mr') as string,
    title_en: formData.get('title_en') as string,
    content_mr: (formData.get('content_mr') as string) || null,
    content_en: (formData.get('content_en') as string) || null,
    category: (formData.get('category') as string) || 'general',
    doc_url: (formData.get('doc_url') as string) || null,
    is_published,
    published_at: is_published ? new Date().toISOString() : null,
  }

  const { error } = await supabase.from('announcements').insert(data)
  if (error) throw new Error(error.message)

  revalidatePath(`/${subdomain}/announcements`)
  revalidatePath(`/${subdomain}/admin/announcements`)
  redirect(`/${subdomain}/admin/announcements`)
}

export async function updateAnnouncement(
  subdomain: string,
  id: string,
  formData: FormData,
) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const is_published = formData.get('is_published') === 'true'

  const { data: existing } = await supabase
    .from('announcements')
    .select('is_published, published_at')
    .eq('id', id)
    .single()

  const update: TablesUpdate<'announcements'> = {
    title_mr: formData.get('title_mr') as string,
    title_en: formData.get('title_en') as string,
    content_mr: (formData.get('content_mr') as string) || null,
    content_en: (formData.get('content_en') as string) || null,
    category: (formData.get('category') as string) || 'general',
    doc_url: (formData.get('doc_url') as string) || null,
    is_published,
    published_at:
      is_published && !existing?.is_published
        ? new Date().toISOString()
        : existing?.published_at ?? null,
  }

  const { error } = await supabase
    .from('announcements')
    .update(update)
    .eq('id', id)
    .eq('gp_id', tenant.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/${subdomain}/announcements`)
  revalidatePath(`/${subdomain}/admin/announcements`)
  redirect(`/${subdomain}/admin/announcements`)
}

export async function deleteAnnouncement(subdomain: string, id: string) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)
  await supabase
    .from('announcements')
    .delete()
    .eq('id', id)
    .eq('gp_id', tenant.id)
  revalidatePath(`/${subdomain}/announcements`)
  revalidatePath(`/${subdomain}/admin/announcements`)
}
