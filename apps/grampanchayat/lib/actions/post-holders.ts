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

export async function createPostHolder(subdomain: string, formData: FormData) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const photoFile = formData.get('photo') as File | null
  let photo_url: string | null = null
  if (photoFile && photoFile.size > 0) {
    photo_url = await uploadFile(tenant.id, 'events', photoFile)
  }

  const data: TablesInsert<'post_holders'> = {
    gp_id: tenant.id,
    name_mr: formData.get('name_mr') as string,
    name_en: formData.get('name_en') as string,
    post_mr: formData.get('post_mr') as string,
    post_en: formData.get('post_en') as string,
    phone: (formData.get('phone') as string) || null,
    photo_url,
    sort_order: Number(formData.get('sort_order') ?? 0),
    is_active: true,
  }

  const { error } = await supabase.from('post_holders').insert(data)
  if (error) throw new Error(error.message)

  revalidatePath(`/${subdomain}/post-holders`)
  revalidatePath(`/${subdomain}/admin/post-holders`)
  redirect(`/${subdomain}/admin/post-holders`)
}

export async function updatePostHolder(
  subdomain: string,
  id: string,
  formData: FormData,
) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const photoFile = formData.get('photo') as File | null
  let photo_url: string | undefined
  if (photoFile && photoFile.size > 0) {
    photo_url = await uploadFile(tenant.id, 'events', photoFile)
  }

  const update: TablesUpdate<'post_holders'> = {
    name_mr: formData.get('name_mr') as string,
    name_en: formData.get('name_en') as string,
    post_mr: formData.get('post_mr') as string,
    post_en: formData.get('post_en') as string,
    phone: (formData.get('phone') as string) || null,
    sort_order: Number(formData.get('sort_order') ?? 0),
    is_active: formData.get('is_active') === 'true',
    ...(photo_url ? { photo_url } : {}),
  }

  const { error } = await supabase
    .from('post_holders')
    .update(update)
    .eq('id', id)
    .eq('gp_id', tenant.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/${subdomain}/post-holders`)
  revalidatePath(`/${subdomain}/admin/post-holders`)
  redirect(`/${subdomain}/admin/post-holders`)
}

export async function deletePostHolder(subdomain: string, id: string) {
  const { supabase, tenant } = await getAuthorizedGp(subdomain)

  const { data } = await supabase
    .from('post_holders')
    .select('photo_url')
    .eq('id', id)
    .eq('gp_id', tenant.id)
    .single()

  if (data?.photo_url) await deleteFile(data.photo_url)

  await supabase.from('post_holders').delete().eq('id', id).eq('gp_id', tenant.id)
  revalidatePath(`/${subdomain}/post-holders`)
  revalidatePath(`/${subdomain}/admin/post-holders`)
}
