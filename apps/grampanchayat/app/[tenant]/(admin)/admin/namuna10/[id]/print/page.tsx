import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { getReceipt } from '@/lib/api/namuna10'
import { taxHeadLabel } from '@/lib/tax/labels'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { Namuna10PrintActions } from '@/components/admin/namuna10-print-actions'

type PageProps = {
  params: Promise<{ tenant: string, id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `नमुना-10-${id}` }
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminNamuna10PrintPage({ params }: PageProps) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-xl border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना १० प्रिंट</h1>
        <p className="mt-2 text-sm text-gp-muted">हा विभाग Pro योजनेत उपलब्ध आहे.</p>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

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
    loadError = message || 'पावती प्रिंट माहिती लोड अयशस्वी'
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}
      </div>
    )
  }
  if (!receipt) notFound()

  const backHref = `/${subdomain}/admin/namuna10`
  const detailHref = `/${subdomain}/admin/namuna10/${receipt.id}`

  return (
    <div className="mx-auto max-w-3xl">
      <style>{`
        @page { size: A5 portrait; margin: 10mm; }
        @media print {
          html, body { background: white !important; }
          body * { visibility: hidden !important; }
          [data-namuna10-print-root="true"],
          [data-namuna10-print-root="true"] * { visibility: visible !important; }
          [data-namuna10-print-root="true"] {
            position: absolute !important;
            inset: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          [data-namuna10-print-root="true"] table {
            width: 100% !important;
            table-layout: fixed;
          }
          [data-namuna10-print-root="true"] thead {
            display: table-header-group;
          }
        }
      `}</style>

      <Namuna10PrintActions backHref={backHref} detailHref={detailHref} />

      <article
        data-namuna10-print-root="true"
        className="rounded-lg border border-gp-border bg-white p-6 text-[13px] text-black print:rounded-none print:border-0 print:p-0"
      >
        <header className="border-b border-black pb-3 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-black/70">Namuna 10</p>
          <h1 className="mt-1 text-lg font-bold">{tenant.name_mr}</h1>
          <p className="mt-1 text-sm">कर वसुली पावती</p>
        </header>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p><span className="font-semibold">पावती क्र.:</span> {receipt.receiptNo}</p>
            <p className="mt-1"><span className="font-semibold">दिनांक:</span> {formatDateTime(receipt.paidAt)}</p>
            <p className="mt-1"><span className="font-semibold">आर्थिक वर्ष:</span> {receipt.fiscalYear}</p>
            <p className="mt-1"><span className="font-semibold">Payment mode:</span> {receipt.paymentMode.toUpperCase()}</p>
          </div>
          <div>
            <p><span className="font-semibold">मालमत्ता क्रमांक:</span> {receipt.property.propertyNo}</p>
            <p className="mt-1"><span className="font-semibold">मालक:</span> {receipt.owner.nameMr}</p>
            <p className="mt-1"><span className="font-semibold">भरणारे नाव:</span> {receipt.payerName}</p>
            <p className="mt-1"><span className="font-semibold">Reference:</span> {receipt.reference || '—'}</p>
          </div>
        </section>

        <section className="mt-5">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-black">
                <th className="px-2 py-2 text-left font-semibold">कर प्रकार</th>
                <th className="px-2 py-2 text-right font-semibold">रक्कम</th>
              </tr>
            </thead>
            <tbody>
              {receipt.lines.map((line) => (
                <tr key={line.id} className="border-b border-black/20">
                  <td className="px-2 py-2">{line.taxHead ? taxHeadLabel(line.taxHead, 'bill') : 'कर रक्कम'}</td>
                  <td className="px-2 py-2 text-right">₹{rupees(line.amountPaise)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-black">
                <td className="px-2 py-2 font-semibold">लाईन एकूण</td>
                <td className="px-2 py-2 text-right font-semibold">₹{rupees(receipt.totals.linesTotalPaise)}</td>
              </tr>
              {receipt.discountPaise > 0 && (
                <tr>
                  <td className="px-2 py-1">Discount</td>
                  <td className="px-2 py-1 text-right">- ₹{rupees(receipt.discountPaise)}</td>
                </tr>
              )}
              {receipt.lateFeePaise > 0 && (
                <tr>
                  <td className="px-2 py-1">Late fee</td>
                  <td className="px-2 py-1 text-right">₹{rupees(receipt.lateFeePaise)}</td>
                </tr>
              )}
              {receipt.noticeFeePaise > 0 && (
                <tr>
                  <td className="px-2 py-1">Notice fee</td>
                  <td className="px-2 py-1 text-right">₹{rupees(receipt.noticeFeePaise)}</td>
                </tr>
              )}
              {receipt.otherPaise > 0 && (
                <tr>
                  <td className="px-2 py-1">Other{receipt.otherReason ? ` — ${receipt.otherReason}` : ''}</td>
                  <td className="px-2 py-1 text-right">₹{rupees(receipt.otherPaise)}</td>
                </tr>
              )}
              <tr className="border-t border-black text-base">
                <td className="px-2 py-2 font-bold">एकूण रक्कम</td>
                <td className="px-2 py-2 text-right font-bold">₹{rupees(receipt.totals.totalPaise)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="font-semibold">टीप</p>
            <p className="mt-2 text-xs text-black/75">
              ही पावती ग्रामपंचायत कर वसुलीसाठी देण्यात येत आहे. कृपया भविष्यातील संदर्भासाठी जतन करून ठेवा.
            </p>
            {receipt.isVoid && (
              <p className="mt-2 text-xs font-semibold text-red-700">
                Void: {receipt.voidReason || 'कारण नमूद नाही'}
              </p>
            )}
          </div>
          <div className="flex items-end justify-end">
            <div className="w-40 border-t border-black pt-2 text-center text-sm">
              अधिकृत सही
            </div>
          </div>
        </section>
      </article>
    </div>
  )
}
