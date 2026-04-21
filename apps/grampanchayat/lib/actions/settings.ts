'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { uploadFile } from '@/lib/storage'
import type { VillageInfo, ContactInfo } from '@/lib/types'

export async function updateGpSettings(subdomain: string, formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const [tenant, { data: { user } }] = await Promise.all([
    getTenant(subdomain),
    supabase.auth.getUser(),
  ])
  if (!tenant || !user) throw new Error('Unauthorized')

  const logoFile = formData.get('logo') as File | null
  let logo_url: string | undefined
  if (logoFile && logoFile.size > 0) {
    logo_url = await uploadFile(tenant.id, 'logo', logoFile)
  }

  const village: VillageInfo = {
    name_mr: (formData.get('village_name_mr') as string) || undefined,
    name_en: (formData.get('village_name_en') as string) || undefined,
    taluka: (formData.get('taluka') as string) || undefined,
    district: (formData.get('district') as string) || undefined,
    pincode: (formData.get('pincode') as string) || undefined,
  }

  const contact: ContactInfo = {
    phone: (formData.get('phone') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    address_mr: (formData.get('address_mr') as string) || undefined,
    address_en: (formData.get('address_en') as string) || undefined,
  }

  const { error } = await supabase
    .from('gp_tenants')
    .update({
      name_mr: formData.get('name_mr') as string,
      name_en: formData.get('name_en') as string,
      established: (formData.get('established') as string) || null,
      village,
      contact,
      portal_theme: formData.get('portal_theme') as string || 'civic-elegant',
      ...(logo_url ? { logo_url } : {}),
    })
    .eq('id', tenant.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/${subdomain}/admin/settings`)
  revalidatePath(`/${subdomain}`)
}
