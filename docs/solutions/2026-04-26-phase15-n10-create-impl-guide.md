# Phase 15 — N10 Create Endpoint Implementation Guide

> Phase 15 = **one API endpoint**: `POST /:subdomain/namuna10`
> Single DB transaction: allocate receipt no → validate → insert receipt → insert lines → update N09 paid_paise.
> No UI (Phase 16). No N05 cashbook wiring (Phase 18).

---

## Files to create / modify

| Action | File |
|--------|------|
| CREATE | `apps/grampanchayat-api/src/db/schema/namuna10-receipts.ts` ✅ done Phase 14 |
| CREATE | `apps/grampanchayat-api/src/services/namuna10.service.ts` |
| CREATE | `apps/grampanchayat-api/src/controllers/namuna10.controller.ts` |
| CREATE | `apps/grampanchayat-api/src/types/namuna10.dto.ts` |
| MODIFY | `apps/grampanchayat-api/src/routes/tenant-namune.routes.ts` — add POST /10 |

Style references:
- Service: `apps/grampanchayat-api/src/services/namuna9.service.ts`
- Controller: `apps/grampanchayat-api/src/controllers/namuna9.controller.ts`
- DTO: `apps/grampanchayat-api/src/types/namuna9.dto.ts`

---

## Request shape (Zod DTO)

```ts
// apps/grampanchayat-api/src/types/namuna10.dto.ts

import { z } from 'zod'

export const namuna10CreateBodySchema = z.object({
  propertyId:    z.string().uuid(),
  payerName:     z.string().min(1).max(200),
  fiscalYear:    z.string().regex(/^\d{4}-\d{2}$/, 'must be YYYY-YY'),
  paidAt:        z.string().datetime(),          // ISO8601
  paymentMode:   z.enum(['cash', 'upi', 'cheque', 'neft', 'other']),
  reference:     z.string().max(200).optional(), // cheque no / UPI ref
  lines: z.array(z.object({
    demandLineId: z.string().uuid(),
    amountPaise:  z.number().int().positive(),
  })).min(1),
  discountPaise:   z.number().int().min(0).default(0),
  lateFeePaise:    z.number().int().min(0).default(0),
  noticeFeePaise:  z.number().int().min(0).default(0),
  otherPaise:      z.number().int().min(0).default(0),
  otherReason:     z.string().max(500).optional(),
})

export type Namuna10CreateBody = z.infer<typeof namuna10CreateBodySchema>
```

---

## Response shape

```ts
{
  id:          string   // receipt UUID
  receiptNo:   string   // '2026-27/000142'
  fiscalYear:  string
  propertyId:  string
  payerName:   string
  paidAt:      string   // ISO8601
  paymentMode: string
  lines: Array<{
    id:           string
    demandLineId: string
    amountPaise:  number
  }>
  totals: {
    linesTotalPaise: number
    totalPaise:      number   // lines - discount + lateFee + noticeFee + other
  }
}
```

---

## Service — exact transaction order

**File:** `apps/grampanchayat-api/src/services/namuna10.service.ts`

```ts
import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db/index.ts'
import {
  gpNamuna10ReceiptLines,
  gpNamuna10Receipts,
  gpNamuna9DemandLines,
  gpNamuna9Demands,
  gpReceiptSequences,
  gpTenants,
} from '../db/schema/index.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import type { Namuna10CreateBody } from '../types/namuna10.dto.ts'

function formatReceiptNo(fiscalYear: string, seq: number): string {
  return `${fiscalYear}/${String(seq).padStart(6, '0')}`
}

export const namuna10Service = {
  async create(gpId: string, createdBy: string, body: Namuna10CreateBody) {
    // Gate: onboarding must be complete before live collection
    const [tenant] = await db
      .select({ onboardingComplete: gpTenants.onboardingComplete })
      .from(gpTenants)
      .where(eq(gpTenants.id, gpId))
      .limit(1)
    if (!tenant) throw new ApiError(404, 'Tenant not found')
    if (!tenant.onboardingComplete) {
      throw new ApiError(409, 'GP onboarding अपूर्ण आहे. आधी onboarding पूर्ण करा.')
    }

    return await db.transaction(async (tx) => {
      // Step 1 — Allocate receipt number (row-locked, concurrency-safe)
      const [seq] = await tx.execute<{ allocated: number }>(sql`
        INSERT INTO gp_receipt_sequences (gp_id, fiscal_year, next_no)
        VALUES (${gpId}, ${body.fiscalYear}, 2)
        ON CONFLICT (gp_id, fiscal_year) DO UPDATE
          SET next_no    = gp_receipt_sequences.next_no + 1,
              updated_at = now()
        RETURNING next_no - 1 AS allocated
      `)
      const receiptNo = formatReceiptNo(body.fiscalYear, seq!.allocated)

      // Step 2 — Validate each line and lock demand-lines
      const demandLineIds = body.lines.map((l) => l.demandLineId)

      const lockedLines = await tx.execute<{
        id: string
        gp_id: string
        property_id: string
        total_due_paise: number
      }>(sql`
        SELECT
          dl.id,
          d.gp_id,
          d.property_id,
          dl.total_due_paise
        FROM gp_namuna9_demand_lines dl
        JOIN gp_namuna9_demands d ON d.id = dl.demand_id
        WHERE dl.id = ANY(${demandLineIds}::uuid[])
        FOR UPDATE
      `)

      if (lockedLines.length !== demandLineIds.length) {
        throw new ApiError(422, 'One or more demand lines not found')
      }

      const lineMap = new Map(lockedLines.map((row) => [row.id, row]))

      for (const line of body.lines) {
        const locked = lineMap.get(line.demandLineId)
        if (!locked) throw new ApiError(422, `Demand line ${line.demandLineId} not found`)
        if (locked.gp_id !== gpId) throw new ApiError(403, 'Demand line belongs to another GP')
        if (locked.property_id !== body.propertyId) {
          throw new ApiError(422, `Demand line ${line.demandLineId} does not belong to property ${body.propertyId}`)
        }
        if (line.amountPaise > locked.total_due_paise) {
          throw new ApiError(
            422,
            `amountPaise ${line.amountPaise} exceeds total_due_paise ${locked.total_due_paise} for line ${line.demandLineId}`
          )
        }
      }

      // Step 3 — Insert receipt header
      const [receipt] = await tx
        .insert(gpNamuna10Receipts)
        .values({
          gpId,
          propertyId:      body.propertyId,
          payerName:       body.payerName,
          fiscalYear:      body.fiscalYear,
          receiptNo,
          paidAt:          new Date(body.paidAt),
          paymentMode:     body.paymentMode,
          reference:       body.reference,
          discountPaise:   body.discountPaise,
          lateFeePaise:    body.lateFeePaise,
          noticeFeePaise:  body.noticeFeePaise,
          otherPaise:      body.otherPaise,
          otherReason:     body.otherReason,
          createdBy,
        })
        .returning()

      if (!receipt) throw new ApiError(500, 'Receipt insert failed')

      // Step 4 — Insert receipt lines
      const insertedLines = await tx
        .insert(gpNamuna10ReceiptLines)
        .values(
          body.lines.map((line) => ({
            receiptId:    receipt.id,
            demandLineId: line.demandLineId,
            amountPaise:  line.amountPaise,
          }))
        )
        .returning()

      // Step 5 — Update paid_paise on each demand-line
      // Use UNNEST for batch update — one DB hit regardless of line count
      const lineIds     = body.lines.map((l) => l.demandLineId)
      const lineAmounts = body.lines.map((l) => l.amountPaise)
      const now = new Date()

      await tx.execute(sql`
        UPDATE gp_namuna9_demand_lines AS t
        SET paid_paise = t.paid_paise + v.amount_paise,
            updated_at = ${now}
        FROM (
          SELECT UNNEST(${lineIds}::uuid[])   AS demand_line_id,
                 UNNEST(${lineAmounts}::bigint[]) AS amount_paise
        ) AS v
        WHERE t.id = v.demand_line_id
      `)

      const linesTotalPaise = body.lines.reduce((sum, l) => sum + l.amountPaise, 0)
      const totalPaise = linesTotalPaise
        - body.discountPaise
        + body.lateFeePaise
        + body.noticeFeePaise
        + body.otherPaise

      return {
        id:          receipt.id,
        receiptNo:   receipt.receiptNo,
        fiscalYear:  receipt.fiscalYear,
        propertyId:  receipt.propertyId,
        payerName:   receipt.payerName,
        paidAt:      receipt.paidAt.toISOString(),
        paymentMode: receipt.paymentMode,
        lines:       insertedLines.map((l) => ({
          id:           l.id,
          demandLineId: l.demandLineId,
          amountPaise:  l.amountPaise,
        })),
        totals: { linesTotalPaise, totalPaise },
      }
    })
  },
}
```

---

## Controller

```ts
// apps/grampanchayat-api/src/controllers/namuna10.controller.ts

import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { namuna10Service } from '../services/namuna10.service.ts'
import { namuna10CreateBodySchema } from '../types/namuna10.dto.ts'

class Namuna10Controller extends BaseController {
  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const actorId = req.supabaseUser?.id
    if (!actorId) throw new ApiError(401, 'Unauthorized')

    const parsed = namuna10CreateBodySchema.safeParse(req.body)
    if (!parsed.success) throw new ApiError(422, 'Invalid body', parsed.error.issues)

    const data = await namuna10Service.create(tenant.id, actorId, parsed.data)
    return this.created(res, data, 'Receipt created')
  })
}

export const namuna10Controller = new Namuna10Controller()
```

---

## Route

In `apps/grampanchayat-api/src/routes/tenant-namune.routes.ts` add:

```ts
import { namuna10Controller } from '../controllers/namuna10.controller.ts'

router.post('/10', requireFeature('tax'), namuna10Controller.create)
```

---

## Key rules (do not skip)

1. **`FOR UPDATE` on demand-lines** — prevents two concurrent receipts reading same `total_due_paise` and both passing the check. Must be raw SQL — Drizzle ORM has no `.forUpdate()` on joins.

2. **Batch `paid_paise` update with UNNEST** — one DB hit for all lines, same pattern as opening-balance import. Arrays must be same length and same order.

3. **`onboarding_complete` gate** — check BEFORE transaction. 409 if false.

4. **Receipt number is allocated inside the TX** — if TX rolls back (any error), sequence counter was already incremented. This is intentional — gaps in receipt sequence are acceptable (audit signal), reuse is not.

5. **`total_due_paise` is a GENERATED column** — DO NOT read it after updating `paid_paise` in same TX without re-fetching. The `FOR UPDATE` read gives you the pre-update value. Validation uses pre-update value intentionally (amount ≤ what was owed before this payment).

6. **Tier gate**: `requireFeature('tax')` — pro tier only.

---

## Verify gate

```bash
# Typecheck
npx tsc --noEmit

# Smoke tests (manual or integration):
# 1. Full payment → all 4 demand-lines → status = 'paid'
# 2. Partial payment → status = 'partial'
# 3. amount > total_due_paise → 422
# 4. demand_line belongs to different property → 422
# 5. onboarding_complete = false → 409
# 6. Two concurrent requests same demand-line → one succeeds, one 422
# 7. INV-4: every receipt_line.demand_line_id resolves to real N09 line
```

---

## What is NOT in Phase 15

- No GET endpoints (Phase 16)
- No void (Phase 17)
- No N05 cashbook wiring (Phase 18) — skip step 6 in §3C.3 for now
- No FE UI (Phase 16)
