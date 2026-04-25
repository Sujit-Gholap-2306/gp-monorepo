import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ChevronLeft } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { getNamuna8Property } from '@/lib/api/namuna8'
import { Namuna8DetailWorkbench } from '@/components/admin/namuna8-detail-workbench'

type PageProps = {
  params: Promise<{ tenant: string, id: string }>
}

export default async function AdminNamuna8DetailPage({ params }: PageProps) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-xl border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ८ (कर आकारणी)</h1>
        <p className="mt-2 text-sm text-gp-muted">
          हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.
        </p>
      </div>
    )
  }

  const cookieStore = await cookies()
  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) {
    redirect(`/${subdomain}/login`)
  }

  const init = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      cookie: cookieStore.toString(),
    },
  }

  let data: Awaited<ReturnType<typeof getNamuna8Property>> | null = null
  try {
    data = await getNamuna8Property(subdomain, id, init)
  } catch {
    notFound()
  }
  if (!data) notFound()

  return (
    <div className="space-y-4">
      <Link
        href={`/${subdomain}/admin/namuna8`}
        className="inline-flex items-center gap-1 text-sm text-gp-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>नमुना ८ यादीकडे परत</span>
      </Link>

      <Namuna8DetailWorkbench
        subdomain={subdomain}
        property={data}
        rateMaster={data.rateMaster}
        tenantName={tenant.name_mr}
      />
    </div>
  )
}
