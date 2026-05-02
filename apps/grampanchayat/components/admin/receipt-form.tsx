'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { createReceipt } from '@/lib/api/namuna10'
import { listNamuna9, type Namuna9Demand } from '@/lib/api/namuna9'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'
import { taxHeadLabel } from '@/lib/tax/labels'
import { TAX_HEADS, type TaxHead } from '@/lib/tax/heads'

type Props = {
  subdomain: string
  accessToken?: string
  initialPropertyId?: string
}

type AmountErrors = Partial<Record<TaxHead, string>>

const PAYMENT_MODE_OPTIONS = [
  { value: 'cash', label: 'रोख' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'neft', label: 'NEFT' },
  { value: 'other', label: 'इतर' },
] as const

function formatPaiseInput(paise: number): string {
  return (paise / 100).toFixed(2).replace(/\.00$/, '')
}

function parseRupeesToPaise(value: string): number | null {
  const normalized = value.replace(/,/g, '').trim()
  if (!normalized) return 0
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null

  const [whole, fraction = ''] = normalized.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

export function ReceiptForm({ subdomain, accessToken, initialPropertyId }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [results, setResults] = useState<Namuna9Demand[]>([])
  const [selectedDemand, setSelectedDemand] = useState<Namuna9Demand | null>(null)
  const [amounts, setAmounts] = useState<Record<TaxHead, string>>({
    house: '',
    lighting: '',
    sanitation: '',
  })
  const [amountErrors, setAmountErrors] = useState<AmountErrors>({})
  const [payerName, setPayerName] = useState('')
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'cheque' | 'neft' | 'other'>('cash')
  const [reference, setReference] = useState('')
  const [discount, setDiscount] = useState('')
  const [lateFee, setLateFee] = useState('')
  const [noticeFee, setNoticeFee] = useState('')
  const [other, setOther] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function getAccessToken() {
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? accessToken ?? null
  }

  function selectDemand(demand: Namuna9Demand) {
    setSelectedDemand(demand)
    setPayerName(demand.owner.nameMr)
    setAmountErrors({})
    setPaymentMode('cash')
    setReference('')
    setDiscount('')
    setLateFee('')
    setNoticeFee('')
    setOther('')
    setOtherReason('')
    setAmounts({
      house: formatPaiseInput(demand.lines.find((line) => line.taxHead === 'house')?.totalDuePaise ?? 0),
      lighting: formatPaiseInput(demand.lines.find((line) => line.taxHead === 'lighting')?.totalDuePaise ?? 0),
      sanitation: formatPaiseInput(demand.lines.find((line) => line.taxHead === 'sanitation')?.totalDuePaise ?? 0),
    })
  }

  useEffect(() => {
    if (!initialPropertyId) return

    let cancelled = false

    async function autoLoad() {
      const token = await getAccessToken()
      if (!token || cancelled) return

      setLoadingSearch(true)
      setSelectedDemand(null)

      try {
        const data = await listNamuna9(
          subdomain,
          { propertyId: initialPropertyId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (cancelled) return
        setResults(data.items)
        if (data.items[0]) {
          selectDemand(data.items[0])
        }
      } catch {
        // User can search manually if preload fails.
      } finally {
        if (!cancelled) setLoadingSearch(false)
      }
    }

    void autoLoad()

    return () => {
      cancelled = true
    }
  }, [initialPropertyId, subdomain])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!query.trim()) {
      gpToast.error('मालमत्ता क्रमांक किंवा मालक नाव टाका')
      return
    }

    const token = await getAccessToken()
    if (!token) {
      gpToast.error('Login session मिळाली नाही. कृपया पुन्हा login करा.')
      return
    }

    setLoadingSearch(true)
    setSelectedDemand(null)

    try {
      const data = await listNamuna9(
        subdomain,
        { q: query.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResults(data.items)
      if (data.items.length === 0) {
        gpToast.warning('जुळणारी मागणी नोंद सापडली नाही')
      }
    } catch (error) {
      gpToast.fromError(error, 'मागणी शोध अयशस्वी')
    } finally {
      setLoadingSearch(false)
    }
  }

  function validateSelectedLines(demand: Namuna9Demand) {
    const nextErrors: AmountErrors = {}
    const lines = demand.lines.flatMap((line) => {
      const rawValue = amounts[line.taxHead]
      const parsed = parseRupeesToPaise(rawValue)

      if (parsed == null) {
        nextErrors[line.taxHead] = 'वैध रक्कम टाका'
        return []
      }

      if (parsed === 0) return []

      if (parsed > line.totalDuePaise) {
        nextErrors[line.taxHead] = 'बाकी रकमेपेक्षा जास्त भरू शकत नाही'
        return []
      }

      return [{ demandLineId: line.id, amountPaise: parsed }]
    })

    setAmountErrors(nextErrors)
    return { lines, hasErrors: Object.keys(nextErrors).length > 0 }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedDemand) {
      gpToast.error('आधी मालमत्ता निवडा')
      return
    }
    if (!payerName.trim()) {
      gpToast.error('भरणारे नाव आवश्यक आहे')
      return
    }

    const token = await getAccessToken()
    if (!token) {
      gpToast.error('Login session मिळाली नाही. कृपया पुन्हा login करा.')
      return
    }

    const { lines, hasErrors } = validateSelectedLines(selectedDemand)
    if (hasErrors) return
    if (lines.length === 0) {
      gpToast.error('किमान एका करप्रकारासाठी रक्कम भरा')
      return
    }

    const discountPaise = parseRupeesToPaise(discount)
    const lateFeePaise = parseRupeesToPaise(lateFee)
    const noticeFeePaise = parseRupeesToPaise(noticeFee)
    const otherPaise = parseRupeesToPaise(other)
    if ([discountPaise, lateFeePaise, noticeFeePaise, otherPaise].some((value) => value == null)) {
      gpToast.error('Adjustment fields मध्ये वैध रक्कम टाका')
      return
    }

    setSubmitting(true)

    try {
      const receipt = await createReceipt(
        subdomain,
        {
          propertyId: selectedDemand.property.id,
          payerName: payerName.trim(),
          fiscalYear: selectedDemand.fiscalYear,
          paidAt: new Date().toISOString(),
          paymentMode,
          reference: reference.trim() || undefined,
          lines,
          discountPaise: discountPaise ?? 0,
          lateFeePaise: lateFeePaise ?? 0,
          noticeFeePaise: noticeFeePaise ?? 0,
          otherPaise: otherPaise ?? 0,
          otherReason: otherReason.trim() || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      gpToast.success(`पावती तयार झाली: ${receipt.receiptNo}`)
      router.push(`/${subdomain}/admin/namuna10/${receipt.id}/print`)
    } catch (error) {
      gpToast.fromError(error, 'पावती तयार अयशस्वी')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5 rounded-lg border border-gp-border bg-card p-4">
      <form onSubmit={handleSearch} className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">मालमत्ता शोधा</h2>
          <p className="text-xs text-gp-muted">मालमत्ता क्रमांक किंवा मालक नावाने शोधा</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gp-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="उदा. P-101 / रमेश शिंदे"
              className="h-10 w-full rounded-md border border-gp-border bg-white pl-8 pr-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loadingSearch}
            className="h-10 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover disabled:opacity-60"
          >
            {loadingSearch ? 'शोध चालू...' : 'शोधा'}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">शोध परिणाम</h3>
          <div className="grid gap-2">
            {results.map((demand) => (
              <button
                key={demand.id}
                type="button"
                onClick={() => selectDemand(demand)}
                className={`rounded-md border px-3 py-3 text-left transition-colors ${
                  selectedDemand?.id === demand.id
                    ? 'border-gp-primary bg-gp-surface'
                    : 'border-gp-border hover:bg-gp-surface'
                }`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {demand.property.propertyNo} · {demand.owner.nameMr}
                    </p>
                    <p className="text-xs text-gp-muted">
                      {demand.property.propertyType} · वार्ड {demand.property.wardNumber || '—'} · FY {demand.fiscalYear}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gp-primary">
                    बाकी ₹{rupees(demand.totals.totalDuePaise)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDemand && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-md border border-gp-border bg-gp-surface p-3 text-sm">
            <p className="font-medium text-foreground">
              निवडलेली मालमत्ता: {selectedDemand.property.propertyNo}
            </p>
            <p className="text-gp-muted">
              मालक: {selectedDemand.owner.nameMr} · वर्ष: {selectedDemand.fiscalYear}
            </p>
          </div>

          <div className="overflow-x-auto rounded-md border border-gp-border">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-gp-surface text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">करप्रकार</th>
                  <th className="px-3 py-2 text-right font-medium">मागील</th>
                  <th className="px-3 py-2 text-right font-medium">चालू</th>
                  <th className="px-3 py-2 text-right font-medium">बाकी</th>
                  <th className="px-3 py-2 font-medium">या वेळी भरणा</th>
                </tr>
              </thead>
              <tbody>
                {TAX_HEADS.map((head) => {
                  const line = selectedDemand.lines.find((item) => item.taxHead === head)
                  if (!line) return null

                  return (
                    <tr key={head} className="border-t border-gp-border">
                      <td className="px-3 py-2 font-medium">{taxHeadLabel(head, 'bill')}</td>
                      <td className="px-3 py-2 text-right">₹{rupees(line.previousPaise)}</td>
                      <td className="px-3 py-2 text-right">₹{rupees(line.currentPaise)}</td>
                      <td className="px-3 py-2 text-right font-semibold">₹{rupees(line.totalDuePaise)}</td>
                      <td className="px-3 py-2">
                        <input
                          value={amounts[head]}
                          onChange={(event) => setAmounts((current) => ({ ...current, [head]: event.target.value }))}
                          inputMode="decimal"
                          placeholder="0"
                          className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
                        />
                        {amountErrors[head] && (
                          <p className="mt-1 text-xs text-red-700">{amountErrors[head]}</p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs text-gp-muted">सूट</span>
              <input
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-gp-muted">लेट फी</span>
              <input
                value={lateFee}
                onChange={(event) => setLateFee(event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-gp-muted">नोटीस फी</span>
              <input
                value={noticeFee}
                onChange={(event) => setNoticeFee(event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-gp-muted">इतर</span>
              <input
                value={other}
                onChange={(event) => setOther(event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gp-muted">इतर कारण</span>
            <input
              value={otherReason}
              onChange={(event) => setOtherReason(event.target.value)}
              placeholder="इतर रकमेचे कारण"
              className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-xs text-gp-muted">भरणारे नाव</span>
              <input
                value={payerName}
                onChange={(event) => setPayerName(event.target.value)}
                className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-gp-muted">भरणा प्रकार</span>
              <select
                value={paymentMode}
                onChange={(event) => setPaymentMode(event.target.value as typeof paymentMode)}
                className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
              >
                {PAYMENT_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gp-muted">Reference / Transaction No.</span>
            <input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Optional"
              className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover disabled:opacity-60"
            >
              {submitting ? 'जतन करत आहे...' : 'पावती तयार करा'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
