import { cache } from 'react'
import { createSupabaseServerClient } from './supabase/server'
import type { GpTenant } from './types'

export const getTenant = cache(async (subdomain: string): Promise<GpTenant | null> => {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('gp_tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .single()

  if (error || !data) return null

  // village and contact are jsonb — safe to narrow since we own the schema
  return data as GpTenant
})
