# Phase 16 — N10 Collection Desk UI Implementation Guide

> Phase 16 = 3 FE pages + 1 API client + endpoint wiring.
> No new BE code — calls Phase 15 `POST /namune/10` endpoint.
> No new migrations.

---

## Files to create / modify

| Action | File |
|--------|------|
| CREATE | `apps/grampanchayat/lib/api/namuna10.ts` |
| MODIFY | `apps/grampanchayat/lib/api/endpoints.ts` — add namuna10 paths |
| CREATE | `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/page.tsx` |
| CREATE | `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/[id]/page.tsx` |
| CREATE | `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/[id]/print/page.tsx` |
| CREATE | `apps/grampanchayat/components/admin/receipt-form.tsx` |
| MODIFY | `apps/grampanchayat/components/admin/sidebar.tsx` — add N10 nav entry |

Style references:
- Page pattern: `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna9/page.tsx`
- API client pattern: `apps/grampanchayat/lib/api/namuna9.ts` (Raw* + normalize*)
- Print pattern: `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna9/[id]/print/page.tsx`

---

## Step 1 — Add endpoints to `endpoints.ts`

```ts
// in tenantApiPaths object:
n10Create: 'namune/10',
n10ById:   (id: string) => `namune/10/${id}`,
n10List:   'namune/10',
```

---

## Step 2 — API client `lib/api/namuna10.ts`

BE returns snake_case (via `keysToSnake`). FE uses `Raw*` + `normalize*` pattern.

```ts
import { apiFetch, buildApiUrl } from './client'
import { tenantApiPaths } from './endpoints'

// ── Public types (camelCase) ──────────────────────────────────────────────

export type Namuna10ReceiptLine = {
  id:           string
  demandLineId: string
  amountPaise:  number
}

export type Namuna10Totals = {
  linesTotalPaise: number
  totalPaise:      number
}

export type Namuna10Receipt = {
  id:          string
  receiptNo:   string
  fiscalYear:  string
  propertyId:  string
  payerName:   string
  paidAt:      string
  paymentMode: string
  reference:   string | null
  discountPaise:   number
  lateFeePaise:    number
  noticeFeePaise:  number
  otherPaise:      number
  otherReason:     string | null
  isVoid:      boolean
  lines:       Namuna10ReceiptLine[]
  totals:      Namuna10Totals
}

export type Namuna10CreateInput = {
  propertyId:     string
  payerName:      string
  fiscalYear:     string
  paidAt:         string   // ISO8601
  paymentMode:    'cash' | 'upi' | 'cheque' | 'neft' | 'other'
  reference?:     string
  lines: Array<{
    demandLineId: string
    amountPaise:  number
  }>
  discountPaise?:   number
  lateFeePaise?:    number
  noticeFeePaise?:  number
  otherPaise?:      number
  otherReason?:     string
}

// ── Raw types (snake_case — matches BE JSON) ──────────────────────────────

type RawReceiptLine = {
  id:            string
  demand_line_id: string
  amount_paise:  number
}

type RawTotals = {
  lines_total_paise: number
  total_paise:       number
}

type RawReceipt = {
  id:           string
  receipt_no:   string
  fiscal_year:  string
  property_id:  string
  payer_name:   string
  paid_at:      string
  payment_mode: string
  reference:    string | null
  discount_paise:   number
  late_fee_paise:   number
  notice_fee_paise: number
  other_paise:      number
  other_reason:     string | null
  is_void:      boolean
  lines:        RawReceiptLine[]
  totals:       RawTotals
}

// ── Normalizers ───────────────────────────────────────────────────────────

function normalizeLine(raw: RawReceiptLine): Namuna10ReceiptLine {
  return {
    id:           raw.id,
    demandLineId: raw.demand_line_id,
    amountPaise:  raw.amount_paise,
  }
}

function normalizeReceipt(raw: RawReceipt): Namuna10Receipt {
  return {
    id:          raw.id,
    receiptNo:   raw.receipt_no,
    fiscalYear:  raw.fiscal_year,
    propertyId:  raw.property_id,
    payerName:   raw.payer_name,
    paidAt:      raw.paid_at,
    paymentMode: raw.payment_mode,
    reference:   raw.reference,
    discountPaise:   raw.discount_paise,
    lateFeePaise:    raw.late_fee_paise,
    noticeFeePaise:  raw.notice_fee_paise,
    otherPaise:      raw.other_paise,
    otherReason:     raw.other_reason,
    isVoid:      raw.is_void,
    lines:       raw.lines.map(normalizeLine),
    totals: {
      linesTotalPaise: raw.totals.lines_total_paise,
      totalPaise:      raw.totals.total_paise,
    },
  }
}

// ── Fetch functions ───────────────────────────────────────────────────────

export async function createReceipt(
  subdomain: string,
  body: Namuna10CreateInput,
  init?: RequestInit
): Promise<Namuna10Receipt> {
  const raw = await apiFetch<RawReceipt>(
    buildApiUrl(subdomain, tenantApiPaths.n10Create),
    { method: 'POST', body: JSON.stringify(body), ...init }
  )
  return normalizeReceipt(raw)
}

export async function getReceipt(
  subdomain: string,
  id: string,
  init?: RequestInit
): Promise<Namuna10Receipt> {
  const raw = await apiFetch<RawReceipt>(
    buildApiUrl(subdomain, tenantApiPaths.n10ById(id)),
    { method: 'GET', ...init }
  )
  return normalizeReceipt(raw)
}
```

---

## Step 3 — Collection desk page

**File:** `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/page.tsx`

This is a **client-heavy page** — property search + form submit happen client-side. Make it a server component shell that renders a client `ReceiptForm` component.

```tsx
// Server component — auth + tier check
export default async function AdminNamuna10Page({ params }) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return <TierGate feature="नमुना १०" />
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gp-primary">नमुना १० — वसुली नोंदवही</h1>
        <p className="text-sm text-gp-muted">कर वसुली नोंदवा</p>
      </div>
      <ReceiptForm subdomain={subdomain} accessToken={accessToken} />
    </div>
  )
}
```

---

## Step 4 — `ReceiptForm` component

**File:** `apps/grampanchayat/components/admin/receipt-form.tsx`

`'use client'` — all interaction here.

### UX flow:
```
[Property search input]
    ↓ type property no or owner name
    ↓ fetch GET /namune/9?q=... to find property + demand lines
[Show 4 demand-line rows]
    house     | मागील ₹X | चालू ₹Y | बाकी ₹Z | [amount input]
    lighting  | ...
    sanitation| ...
    water     | ...
[Adjustments section]
    discount  [input]
    late fee  [input]
    notice fee[input]
    other     [input] [reason input]
[Payer section]
    Payer name [text input] ← always text, no dropdown
    Payment mode [select: cash/upi/cheque/neft/other]
    Reference no [text input, optional]
[Submit button] → POST /namune/10 → on success → redirect to [id]/print
```

### Key implementation notes:

1. **Property search**: call `listNamuna9` with `q` param, pick first result. Show property no + owner name as confirmation before showing demand lines.

2. **Amount inputs**: default to `total_due_paise` for each head (full payment). Clerk can reduce. Zero = skip this head (don't include in `lines` array).

3. **Validation before submit**: each entered amount must be > 0 and ≤ `total_due_paise` for that line. Show inline error if not.

4. **Lines array**: only include heads where clerk entered amount > 0. Min 1 line required (DTO enforces via `z.array().min(1)`).

5. **On success**: redirect to `/[tenant]/admin/namuna10/[receiptId]/print`.

6. **Keyboard UX**: 
   - Tab order: search → amounts (house→lighting→sanitation→water) → adjustments → payer name → mode → reference → submit
   - Enter on submit button = submit form

7. **paidAt**: use `new Date().toISOString()` at submit time (current time).

8. **fiscalYear**: use `currentFiscalYear()` utility from `@/lib/tax/fiscal` or hardcode from a shared constant — do NOT let clerk pick FY.

### Auth: client component uses browser session token:
```ts
const { data } = await createSupabaseBrowserClient().auth.getSession()
const token = data.session?.access_token
```

---

## Step 5 — Receipt detail page

**File:** `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/[id]/page.tsx`

Server component. Fetch receipt by ID. Show:
- Receipt header (no, date, payer, mode, reference)
- 4 lines table (tax head, amount paid)
- Adjustments
- Total
- Link to print page

```tsx
export default async function ReceiptDetailPage({ params }) {
  const { tenant: subdomain, id } = await params
  // auth + fetch receipt
  const receipt = await getReceipt(subdomain, id, { headers: { Authorization: `Bearer ${accessToken}` } })
  // render detail
}
```

---

## Step 6 — Print page (बिल format)

**File:** `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna10/[id]/print/page.tsx`

Matches Balsane `बिल` sheet layout (A5 or thermal 80mm):

```
ग्रामपंचायत: {tenantName}
पावती क्रमांक: 2026-27/000001     दिनांक: 15/05/2026

मालमत्ता क्र.: P-001
मालक: {ownerName}
भरणारे: {payerName}
भरणा प्रकार: रोख

─────────────────────────────────
करांचा तपशील
─────────────────────────────────
घरपट्टी         ₹136.71
दिवाबत्ती         ₹0.00
स्वच्छता         ₹0.00
पाणीपट्टी         ₹0.00
─────────────────────────────────
एकूण कर         ₹136.71
५% सूट           -₹0.00
५% लेट फी        +₹0.00
नोटीस फी         +₹0.00
इतर              +₹0.00
─────────────────────────────────
एकूण भरणा       ₹136.71
─────────────────────────────────

स्वाक्षरी: _______________
```

Use `@media print` CSS + `window.print()` auto-triggered on page load.

---

## Step 7 — Sidebar nav entry

In `apps/grampanchayat/components/admin/sidebar.tsx`, add N10 entry under pro tier section (after N09):

```tsx
{ href: 'admin/namuna10', label: 'नमुना १०', labelEn: 'Collection', icon: Receipt, tier: 'pro' }
```

---

## Step 8 — BE: add GET endpoints (needed for this phase)

Phase 15 only built `POST /namune/10`. Phase 16 needs `GET /namune/10/:id` for the detail page.

Add to `namuna10.service.ts`:

```ts
async getById(gpId: string, receiptId: string) {
  // SELECT receipt + lines JOIN demand_lines for tax_head
  // JOIN gp_namuna10_receipt_totals view for totals
  // return normalized receipt shape
}
```

Add to controller + route:
```ts
router.get('/10/:id', requireFeature('tax'), namuna10Controller.getById)
```

---

## Tax head labels for N10 print

Use existing `taxHeadLabel(head, 'bill')` from `@/lib/tax/labels`.

From Balsane `बिल` sheet:
- `house` → `घरपट्टी`
- `lighting` → `दिवाबत्ती`  
- `sanitation` → `ज. सफाई कर`
- `water` → `पाणीपट्टी`

---

## Verify gate

- [ ] Property search → demand lines load
- [ ] Full payment → all 4 lines pre-filled → submit → receipt created → print opens
- [ ] Partial payment (only house) → lines array has 1 item → N09 status = `partial`
- [ ] Zero amount entered → that head excluded from lines
- [ ] Overpayment attempt → inline error before submit (client-side) + 422 from BE as fallback
- [ ] Print layout matches Balsane `बिल` (4 heads + adjustments + total)
- [ ] Tier gate: free tier sees upgrade prompt

---

## What is NOT in Phase 16

- No void UI (Phase 17)
- No receipt list/history page — only detail + print
- No N05/N06 wiring (Phase 18)
