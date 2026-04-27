import { notFound, redirect } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { ReceiptForm } from '@/components/admin/receipt-form'

type PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ propertyId?: string }>
}

export default async function AdminNamuna10NewPage({ params, searchParams }: PageProps) {
  const { tenant: subdomain } = await params
  const filters = await searchParams
  const propertyId = typeof filters.propertyId === 'string' ? filters.propertyId : undefined
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना १० (वसुली नोंदवही)</h1>
        <p className="mt-2 text-sm text-gp-muted">हा विभाग Pro योजनेत उपलब्ध आहे.</p>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gp-primary">नवीन पावती</h1>
        <p className="text-sm text-gp-muted">मालमत्ता शोधा, कर भरणा नोंदवा आणि पावती प्रिंट करा.</p>
      </div>
      <ReceiptForm
        subdomain={subdomain}
        accessToken={accessToken}
        initialPropertyId={propertyId}
      />
    </div>
  )
}
