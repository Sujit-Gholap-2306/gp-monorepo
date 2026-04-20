import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { AdminSidebar } from '@/components/admin/sidebar'

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

  const { data: admin } = await supabase
    .from('gp_admins')
    .select('id, role')
    .eq('gp_id', tenant.id)
    .eq('user_id', user.id)
    .single()

  if (!admin) redirect(`/${subdomain}/login?error=unauthorized`)

  return (
    <div className="min-h-screen flex bg-gp-surface">
      <AdminSidebar tenantName={tenant.name_mr} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
