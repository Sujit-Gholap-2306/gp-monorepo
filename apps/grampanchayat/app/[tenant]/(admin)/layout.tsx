import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { AdminSidebar } from '@/components/admin/sidebar'
import { getMe } from '@/lib/api/gp-admins'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${subdomain}/login`)

  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  try {
    await getMe(subdomain, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch {
    redirect(`/${subdomain}/login?error=unauthorized`)
  }

  return (
    <div className="min-h-screen flex bg-gp-surface">
      <AdminSidebar tenantName={tenant.name_mr} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
