import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft, Printer } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { getReceipt } from '@/lib/api/namuna10'
import { taxHeadLabel } from '@/lib/tax/labels'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ tenant: string, id: string }>
}

function DetailCard({ label, value, subtle }: { label: string, value: string, subtle?: boolean }) {
  return (
    <div className="rounded-md border border-gp-border bg-gp-surface p-3">
      <p className="text-xs text-gp-muted">{label}</p>
      <p className={`mt-1 ${subtle ? 'text-sm text-foreground' : 'font-medium text-foreground'}`}>{value}</p>
    </div>
  )
}

export default async function AdminNamuna10DetailPage({ params }: PageProps) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना १० (वसुली नोंदवही)</h1>
        <p className="mt-2 text-sm text-gp-muted">
          हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.
        </p>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) {
    redirect(`/${subdomain}/login`)
  }

  const init = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }

  let receipt: Awaited<ReturnType<typeof getReceipt>> | null = null
  let loadError: string | null = null
  try {
    receipt = await getReceipt(subdomain, id, init)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/not found|404/i.test(message)) notFound()
    loadError = message || 'पावती माहिती लोड अयशस्वी'
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}
      </div>
    )
  }
  if (!receipt) notFound()

  const printHref = `/${subdomain}/admin/namuna10/${receipt.id}/print`

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/${subdomain}/admin/namuna10`}
          className="inline-flex items-center gap-1 text-sm text-gp-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>वसुली डेस्ककडे परत</span>
        </Link>
        <Link
          href={printHref}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-gp-border bg-card px-3 text-sm transition-colors hover:bg-gp-surface"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>Print Receipt</span>
        </Link>
      </div>

      <div className="rounded-lg border border-gp-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gp-primary">पावती तपशील — {receipt.receiptNo}</h1>
            <p className="mt-1 text-sm text-gp-muted">
              वर्ष {receipt.fiscalYear} · दिनांक {new Date(receipt.paidAt).toLocaleDateString('en-IN')}
            </p>
          </div>
          {receipt.isVoid && (
            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
              Void
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailCard label="मालमत्ता क्रमांक" value={receipt.property.propertyNo} />
          <DetailCard label="मालक" value={receipt.owner.nameMr} />
          <DetailCard label="भरणारे नाव" value={receipt.payerName} />
          <DetailCard label="एकूण पावती" value={`₹${rupees(receipt.totals.totalPaise)}`} />
          <DetailCard label="वार्ड" value={receipt.property.wardNumber || '—'} subtle />
          <DetailCard label="मालमत्ता प्रकार" value={receipt.property.propertyType} subtle />
          <DetailCard label="Payment mode" value={receipt.paymentMode.toUpperCase()} subtle />
          <DetailCard label="Reference" value={receipt.reference || '—'} subtle />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gp-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="px-3 py-2 font-medium">कर प्रकार</th>
              <th className="px-3 py-2 text-right font-medium">भरलेली रक्कम</th>
            </tr>
          </thead>
          <tbody>
            {receipt.lines.map((line) => (
              <tr key={line.id} className="border-t border-gp-border">
                <td className="px-3 py-2 font-medium">
                  {line.taxHead ? taxHeadLabel(line.taxHead, 'bill') : 'कर रक्कम'}
                </td>
                <td className="px-3 py-2 text-right font-semibold">₹{rupees(line.amountPaise)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gp-border bg-gp-surface font-semibold">
            <tr>
              <td className="px-3 py-2">लाईन एकूण</td>
              <td className="px-3 py-2 text-right">₹{rupees(receipt.totals.linesTotalPaise)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-gp-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Adjustments</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gp-muted">Discount</dt>
              <dd>₹{rupees(receipt.discountPaise)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gp-muted">Late fee</dt>
              <dd>₹{rupees(receipt.lateFeePaise)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gp-muted">Notice fee</dt>
              <dd>₹{rupees(receipt.noticeFeePaise)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gp-muted">Other</dt>
              <dd>₹{rupees(receipt.otherPaise)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-gp-border pt-2 font-semibold">
              <dt>Net total</dt>
              <dd>₹{rupees(receipt.totals.totalPaise)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gp-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">नोंदी</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-gp-muted">इतर कारण</dt>
              <dd className="mt-1 text-foreground">{receipt.otherReason || '—'}</dd>
            </div>
            {receipt.owner.nameEn && (
              <div>
                <dt className="text-gp-muted">Owner (English)</dt>
                <dd className="mt-1 text-foreground">{receipt.owner.nameEn}</dd>
              </div>
            )}
            {receipt.isVoid && (
              <div>
                <dt className="text-gp-muted">Void reason</dt>
                <dd className="mt-1 text-foreground">{receipt.voidReason || '—'}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
