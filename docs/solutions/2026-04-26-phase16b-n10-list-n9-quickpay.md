# Phase 16-B — N10 Receipt List + N9 Quick-Pay Link

> Extends Phase 16. No new schema. No new migrations.
> Adds: N10 landing list page, N10 new-receipt route, N9→N10 quick-pay links.

---

## Summary of changes

| Action | File |
|--------|------|
| MODIFY | `apps/grampanchayat-api/src/services/namuna10.service.ts` — add `list()` |
| MODIFY | `apps/grampanchayat-api/src/controllers/namuna10.controller.ts` — add `list` handler |
| MODIFY | `apps/grampanchayat-api/src/routes/tenant-namune.routes.ts` — wire `GET /10` |
| MODIFY | `apps/grampanchayat/lib/api/namuna10.ts` — add `listReceipts()` + new types |
| MODIFY | `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/page.tsx` — receipt list + search |
| CREATE | `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/new/page.tsx` — new receipt form |
| MODIFY | `apps/grampanchayat/components/admin/receipt-form.tsx` — accept `initialPropertyId` |
| MODIFY | `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna9/page.tsx` — quick-pay column |
| MODIFY | `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna9/[id]/page.tsx` — "वसुली नोंदवा" button |

---

## Step 1 — BE: `namuna10Service.list()`

**File:** `apps/grampanchayat-api/src/services/namuna10.service.ts`

Add `list()` method to `namuna10Service` object (after `getById`):

```ts
async list(
  gpId: string,
  filters: {
    q?: string          // search: receipt_no OR property_no OR payer_name ILIKE
    propertyId?: string
    fiscalYear?: string
    limit?: number
    offset?: number
  }
) {
  const limit = Math.min(filters.limit ?? 50, 100)
  const offset = filters.offset ?? 0

  const rows = await db.execute<{
    id: string
    receipt_no: string
    fiscal_year: string
    property_id: string
    property_no: string
    payer_name: string
    paid_at: Date | string
    payment_mode: string
    is_void: boolean
    total_paise: string | number | null
  }>(sql`
    SELECT
      r.id,
      r.receipt_no,
      r.fiscal_year,
      r.property_id,
      p.property_no,
      r.payer_name,
      r.paid_at,
      r.payment_mode,
      r.is_void,
      t.total_paise
    FROM gp_namuna10_receipts r
    JOIN gp_properties p ON p.id = r.property_id
    LEFT JOIN gp_namuna10_receipt_totals t ON t.receipt_id = r.id
    WHERE r.gp_id = ${gpId}
      ${filters.propertyId ? sql`AND r.property_id = ${filters.propertyId}::uuid` : sql``}
      ${filters.fiscalYear ? sql`AND r.fiscal_year = ${filters.fiscalYear}` : sql``}
      ${filters.q ? sql`AND (
        r.receipt_no ILIKE ${'%' + filters.q + '%'}
        OR p.property_no ILIKE ${'%' + filters.q + '%'}
        OR r.payer_name ILIKE ${'%' + filters.q + '%'}
      )` : sql``}
    ORDER BY r.paid_at DESC, r.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `)

  return {
    items: rows.map((row) => ({
      id: row.id,
      receiptNo: row.receipt_no,
      fiscalYear: row.fiscal_year,
      propertyId: row.property_id,
      propertyNo: row.property_no,
      payerName: row.payer_name,
      paidAt: asIsoString(row.paid_at) ?? new Date().toISOString(),
      paymentMode: row.payment_mode,
      isVoid: row.is_void,
      totalPaise: asNumber(row.total_paise),
    })),
    limit,
    offset,
  }
},
```

Note: `asNumber` and `asIsoString` helper functions already exist in this file.

---

## Step 2 — BE: controller + route

**File:** `apps/grampanchayat-api/src/controllers/namuna10.controller.ts`

Add `list` handler to `Namuna10Controller` class (before `getById`):

```ts
list = asyncHandler(async (req, res) => {
  const tenant = req.gpTenant
  if (!tenant) throw new ApiError(500, 'Tenant context missing')

  const q = typeof req.query.q === 'string' ? req.query.q : undefined
  const propertyId = typeof req.query.property_id === 'string' ? req.query.property_id : undefined
  const fiscalYear = typeof req.query.fiscal_year === 'string' ? req.query.fiscal_year : undefined
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const offset = req.query.offset ? Number(req.query.offset) : undefined

  const data = await namuna10Service.list(tenant.id, { q, propertyId, fiscalYear, limit, offset })
  return this.ok(res, data, 'Receipts loaded')
})
```

**File:** `apps/grampanchayat-api/src/routes/tenant-namune.routes.ts`

Add before the existing `GET /10/:id` line:

```ts
router.get('/10', requireFeature('tax'), namuna10Controller.list)
```

Final route order must be:
```ts
router.get('/10', requireFeature('tax'), namuna10Controller.list)
router.get('/10/:id', requireFeature('tax'), namuna10Controller.getById)
router.post('/10', requireFeature('tax'), namuna10Controller.create)
```

---

## Step 3 — FE: API client types + `listReceipts()`

**File:** `apps/grampanchayat/lib/api/namuna10.ts`

Add these types and function. Add after the existing `Namuna10CreateInput` type.

```ts
// ── List types ────────────────────────────────────────────────────────────

export type Namuna10ReceiptSummary = {
  id: string
  receiptNo: string
  fiscalYear: string
  propertyId: string
  propertyNo: string
  payerName: string
  paidAt: string
  paymentMode: string
  isVoid: boolean
  totalPaise: number
}

export type Namuna10ListResponse = {
  items: Namuna10ReceiptSummary[]
  limit: number
  offset: number
}

type RawReceiptSummary = {
  id: string
  receipt_no: string
  fiscal_year: string
  property_id: string
  property_no: string
  payer_name: string
  paid_at: string
  payment_mode: string
  is_void: boolean
  total_paise: number
}

type RawListResponse = {
  items: RawReceiptSummary[]
  limit: number
  offset: number
}

function normalizeReceiptSummary(raw: RawReceiptSummary): Namuna10ReceiptSummary {
  return {
    id: raw.id,
    receiptNo: raw.receipt_no,
    fiscalYear: raw.fiscal_year,
    propertyId: raw.property_id,
    propertyNo: raw.property_no,
    payerName: raw.payer_name,
    paidAt: raw.paid_at,
    paymentMode: raw.payment_mode,
    isVoid: raw.is_void,
    totalPaise: raw.total_paise,
  }
}
```

Add `listReceipts()` function after `getReceipt()`:

```ts
export async function listReceipts(
  subdomain: string,
  params?: {
    q?: string
    propertyId?: string
    fiscalYear?: string
    limit?: number
    offset?: number
  },
  init?: RequestInit
): Promise<Namuna10ListResponse> {
  const url = buildApiUrl(subdomain, tenantApiPaths.namune.n10List)
  const searchParams = new URLSearchParams()
  if (params?.q) searchParams.set('q', params.q)
  if (params?.propertyId) searchParams.set('property_id', params.propertyId)
  if (params?.fiscalYear) searchParams.set('fiscal_year', params.fiscalYear)
  if (params?.limit != null) searchParams.set('limit', String(params.limit))
  if (params?.offset != null) searchParams.set('offset', String(params.offset))

  const fullUrl = searchParams.size > 0 ? `${url}?${searchParams}` : url
  const raw = await apiFetch<RawListResponse>(fullUrl, { method: 'GET', ...init })
  return {
    items: raw.items.map(normalizeReceiptSummary),
    limit: raw.limit,
    offset: raw.offset,
  }
}
```

---

## Step 4 — N10 landing page (receipt list + search)

**File:** `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/page.tsx`

Replace the existing file completely. This is a server component.

```tsx
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { listReceipts } from '@/lib/api/namuna10'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'

type PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ q?: string; fiscal_year?: string }>
}

export default async function AdminNamuna10Page({ params, searchParams }: PageProps) {
  const { tenant: subdomain } = await params
  const { q, fiscal_year: fiscalYear } = await searchParams
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना १० (वसुली नोंदवही)</h1>
        <p className="mt-2 text-sm text-gp-muted">हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.</p>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  const init = { headers: { Authorization: `Bearer ${accessToken}` } }

  let data: Awaited<ReturnType<typeof listReceipts>> | null = null
  try {
    data = await listReceipts(subdomain, { q, fiscalYear, limit: 50 }, init)
  } catch {
    // show empty state — non-fatal
  }

  const newReceiptHref = `/${subdomain}/admin/namuna10/new`

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">नमुना १० — वसुली नोंदवही</h1>
          <p className="text-sm text-gp-muted">कर वसुली पावत्या</p>
        </div>
        <Link
          href={newReceiptHref}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          नवीन पावती
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="पावती क्र., मालमत्ता क्र., भरणारे नाव"
          className="h-9 flex-1 rounded-md border border-gp-border bg-white px-3 text-sm"
        />
        <button
          type="submit"
          className="h-9 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
        >
          शोधा
        </button>
        {q && (
          <Link
            href={`/${subdomain}/admin/namuna10`}
            className="inline-flex h-9 items-center rounded-md border border-gp-border px-3 text-sm hover:bg-gp-surface"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Receipt list */}
      <div className="overflow-hidden rounded-lg border border-gp-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="px-3 py-2 font-medium">पावती क्र.</th>
              <th className="px-3 py-2 font-medium">मालमत्ता</th>
              <th className="px-3 py-2 font-medium">भरणारे</th>
              <th className="px-3 py-2 text-right font-medium">रक्कम</th>
              <th className="px-3 py-2 font-medium">दिनांक</th>
              <th className="px-3 py-2 font-medium">प्रकार</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gp-muted">
                  {q ? 'कोणतीही पावती सापडली नाही' : 'अद्याप कोणतीही पावती नाही'}
                </td>
              </tr>
            )}
            {data?.items.map((receipt) => (
              <tr
                key={receipt.id}
                className={`border-t border-gp-border ${receipt.isVoid ? 'opacity-50' : ''}`}
              >
                <td className="px-3 py-2 font-medium">
                  <Link
                    href={`/${subdomain}/admin/namuna10/${receipt.id}`}
                    className="text-gp-primary hover:underline"
                  >
                    {receipt.receiptNo}
                  </Link>
                  {receipt.isVoid && (
                    <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-700">Void</span>
                  )}
                </td>
                <td className="px-3 py-2">{receipt.propertyNo}</td>
                <td className="px-3 py-2">{receipt.payerName}</td>
                <td className="px-3 py-2 text-right font-semibold">₹{rupees(receipt.totalPaise)}</td>
                <td className="px-3 py-2 text-gp-muted">
                  {new Date(receipt.paidAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-3 py-2 uppercase text-gp-muted text-xs">{receipt.paymentMode}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/${subdomain}/admin/namuna10/${receipt.id}/print`}
                    className="text-xs text-gp-muted hover:text-foreground"
                  >
                    Print
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## Step 5 — New receipt page `/admin/namuna10/new`

**File:** `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/new/page.tsx`

Server component shell. Accepts optional `propertyId` searchParam — passes it to `ReceiptForm` for auto-loading.

```tsx
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
  const { propertyId } = await searchParams
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
      <ReceiptForm subdomain={subdomain} initialPropertyId={propertyId} />
    </div>
  )
}
```

---

## Step 6 — Update `ReceiptForm` for `initialPropertyId`

**File:** `apps/grampanchayat/components/admin/receipt-form.tsx`

### Changes required:

**1. Update `Props` type:**
```ts
type Props = {
  subdomain: string
  initialPropertyId?: string   // ← add this
}
```

**2. Update function signature:**
```ts
export function ReceiptForm({ subdomain, initialPropertyId }: Props) {
```

**3. Add `useEffect` to auto-load property when `initialPropertyId` is provided.**

Add this import at the top:
```ts
import { useState, useEffect, type FormEvent } from 'react'
```

Add this effect inside the component, after all the `useState` declarations:

```ts
useEffect(() => {
  if (!initialPropertyId) return

  let cancelled = false

  async function autoLoad() {
    const token = await getAccessToken()
    if (!token || cancelled) return

    setLoadingSearch(true)
    try {
      const data = await listNamuna9(
        subdomain,
        { propertyId: initialPropertyId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (cancelled) return
      if (data.items.length > 0) {
        setResults(data.items)
        selectDemand(data.items[0])
      }
    } catch {
      // silent — user can search manually
    } finally {
      if (!cancelled) setLoadingSearch(false)
    }
  }

  autoLoad()
  return () => { cancelled = true }
}, [initialPropertyId])  // eslint-disable-line react-hooks/exhaustive-deps
```

### N9 API filter check:
The `listNamuna9` function must support `propertyId` filter. Check `apps/grampanchayat/lib/api/namuna9.ts` — if `propertyId` is not in the filter params, add it. Also verify the BE `GET /namune/9` accepts `?property_id=` query param.

If `listNamuna9` does not support `propertyId` filter yet, use `q` with the property ID string as a workaround — or add the filter to both BE and FE as part of this phase.

---

## Step 7 — N9 list: add quick-pay column

**File:** `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna9/page.tsx`

In the receipts table, the last column currently has an arrow link to N9 detail. Add a second action column for quick-pay.

Find the table row where each demand is rendered (look for `demand.id` in `href`). Add a new `<td>` after the existing arrow:

```tsx
<td className="px-3 py-2">
  <Link
    href={`/${subdomain}/admin/namuna10/new?propertyId=${demand.property.id}`}
    className="inline-flex items-center gap-1 rounded-md border border-gp-border px-2 py-1 text-xs hover:bg-gp-surface"
    title="वसुली नोंदवा"
  >
    वसुली
  </Link>
</td>
```

Also add a `<th>` header for this column:
```tsx
<th className="px-3 py-2" />
```

**Only show this link when `demand.status !== 'paid'`** — no point collecting on a fully paid demand:
```tsx
{demand.status !== 'paid' && (
  <td className="px-3 py-2">
    <Link href={`/${subdomain}/admin/namuna10/new?propertyId=${demand.property.id}`} ...>
      वसुली
    </Link>
  </td>
)}
{demand.status === 'paid' && <td className="px-3 py-2" />}
```

---

## Step 8 — N9 detail: add "वसुली नोंदवा" button

**File:** `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna9/[id]/page.tsx`

Find the header area (where property name + ward are shown). Add a "वसुली नोंदवा" button alongside the existing print/back links.

The `demand.property.id` field is available on the `demand` object.

```tsx
import { IndianRupee } from 'lucide-react'

// In the page header action buttons area:
<Link
  href={`/${subdomain}/admin/namuna10/new?propertyId=${demand.property.id}`}
  className="inline-flex h-9 items-center gap-2 rounded-md bg-gp-primary px-3 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
>
  <IndianRupee className="h-4 w-4" aria-hidden="true" />
  वसुली नोंदवा
</Link>
```

Place this button only when `demand.status !== 'paid'`. When status is `paid`, show nothing (or a disabled/greyed "भरणा पूर्ण" badge).

---

## Verify gate

- [ ] `GET /namune/10` returns 50 most recent receipts for the tenant (no filters)
- [ ] `GET /namune/10?q=P-001` filters by property no
- [ ] `GET /namune/10?q=2026-27/000001` filters by receipt no
- [ ] N10 landing page shows receipt list — not blank
- [ ] N10 landing page search (server-side) filters the table
- [ ] "नवीन पावती" button goes to `/admin/namuna10/new`
- [ ] `/admin/namuna10/new` shows empty form — clerk must search
- [ ] `/admin/namuna10/new?propertyId=<uuid>` auto-loads that property's demand lines (no search needed)
- [ ] On submit → redirects to `/admin/namuna10/<id>/print`
- [ ] N9 list — "वसुली" link appears on pending/partial rows, absent on paid rows
- [ ] Clicking N9 list "वसुली" → N10 new page with property pre-loaded
- [ ] N9 detail — "वसुली नोंदवा" button visible when not paid, absent when paid
- [ ] Clicking N9 detail button → N10 new page with property pre-loaded
- [ ] `pnpm --filter grampanchayat typecheck` green
- [ ] `pnpm --filter @gp/grampanchayat-api typecheck` green

---

## What is NOT in this phase

- Pagination on the receipt list (limit=50 is sufficient for v1)
- Fiscal-year filter UI on the list page (can be added later)
- N9 receipt-history section on detail page (already shows via N9 service if wired; separate concern)
