'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { uploadFile, deleteFile } from '@/lib/storage'
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

export async function createEvent(subdomain: string, formData: FormData) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const data: TablesInsert<'events'> = {
    gp_id: tenant.id,
    title_mr: formData.get('title_mr') as string,
    title_en: formData.get('title_en') as string,
    description_mr: (formData.get('description_mr') as string) || null,
    description_en: (formData.get('description_en') as string) || null,
    event_date: formData.get('event_date') as string,
    location_mr: (formData.get('location_mr') as string) || null,
    location_en: (formData.get('location_en') as string) || null,
    is_published: formData.get('is_published') === 'true',
  }

  const { data: created, error } = await supabase
    .from('events')
    .insert(data)
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/${subdomain}/events`)
  revalidatePath(`/${subdomain}/admin/events`)
  redirect(`/${subdomain}/admin/events/${created.id}/media`)
}

export async function updateEvent(
  subdomain: string,
  id: string,
  formData: FormData,
) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const update: TablesUpdate<'events'> = {
    title_mr: formData.get('title_mr') as string,
    title_en: formData.get('title_en') as string,
    description_mr: (formData.get('description_mr') as string) || null,
    description_en: (formData.get('description_en') as string) || null,
    event_date: formData.get('event_date') as string,
    location_mr: (formData.get('location_mr') as string) || null,
    location_en: (formData.get('location_en') as string) || null,
    is_published: formData.get('is_published') === 'true',
  }

  const { error } = await supabase
    .from('events')
    .update(update)
    .eq('id', id)
    .eq('gp_id', tenant.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/${subdomain}/events`)
  revalidatePath(`/${subdomain}/admin/events`)
  redirect(`/${subdomain}/admin/events`)
}

export async function deleteEvent(subdomain: string, id: string) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  // Delete all media files first
  const { data: media } = await supabase
    .from('event_media')
    .select('url')
    .eq('event_id', id)
    .eq('gp_id', tenant.id)

  if (media) await Promise.all(media.map((m) => deleteFile(m.url)))

  await supabase.from('events').delete().eq('id', id).eq('gp_id', tenant.id)
  revalidatePath(`/${subdomain}/events`)
  revalidatePath(`/${subdomain}/admin/events`)
}

export async function toggleEventPublished(
  subdomain: string,
  id: string,
  published: boolean,
) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)
  await supabase
    .from('events')
    .update({ is_published: published })
    .eq('id', id)
    .eq('gp_id', tenant.id)
  revalidatePath(`/${subdomain}/events`)
  revalidatePath(`/${subdomain}/admin/events`)
}

export async function addEventMedia(
  subdomain: string,
  eventId: string,
  formData: FormData,
) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  const url = await uploadFile(tenant.id, 'events', file)
  const type = file.type.startsWith('video/') ? 'video' : 'photo'

  const { data: existing } = await supabase
    .from('event_media')
    .select('sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (existing?.sort_order ?? -1) + 1

  await supabase.from('event_media').insert({
    event_id: eventId,
    gp_id: tenant.id,
    url,
    type,
    caption: (formData.get('caption') as string) || null,
    sort_order,
  })

  revalidatePath(`/${subdomain}/admin/events/${eventId}/media`)
}

export async function deleteEventMedia(
  subdomain: string,
  eventId: string,
  mediaId: string,
  url: string,
) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)
  await deleteFile(url)
  await supabase
    .from('event_media')
    .delete()
    .eq('id', mediaId)
    .eq('gp_id', tenant.id)
  revalidatePath(`/${subdomain}/admin/events/${eventId}/media`)
}
