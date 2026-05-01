import { beforeAll, describe, expect, it } from 'vitest'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../helpers/db.ts'
import { gpNamuna9Demands, gpTenants } from '../../src/db/schema/index.ts'
import { calcPropertyTax } from '../../src/lib/tax-calc.ts'
import { currentFiscalYear, fyMonthNo } from '../../src/lib/fiscal.ts'

const PREFERRED_SUBDOMAIN = 'test-gp'
let gpId: string
let fiscalYear: string

function asNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

function indiaDateString(input: Date | string): string {
  const d = input instanceof Date ? input : new Date(input)
  const india = new Date(d.getTime() + 5.5 * 60 * 60 * 1000)
  const year = india.getUTCFullYear()
  const month = String(india.getUTCMonth() + 1).padStart(2, '0')
  const day = String(india.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

beforeAll(async () => {
  // Prefer the seeded demo GP, fall back to any GP with N09 demands
  const [preferred] = await db
    .select({ id: gpTenants.id })
    .from(gpTenants)
    .where(eq(gpTenants.subdomain, PREFERRED_SUBDOMAIN))
    .limit(1)

  if (preferred) {
    gpId = preferred.id
  } else {
    const [fallback] = await db
      .select({ gpId: gpNamuna9Demands.gpId, count: sql<number>`COUNT(*)` })
      .from(gpNamuna9Demands)
      .groupBy(gpNamuna9Demands.gpId)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(1)

    if (!fallback) throw new Error('No N09 demand data. Run: pnpm seed:demo or generate demands first.')
    gpId = fallback.gpId
    console.warn(`[invariants] '${PREFERRED_SUBDOMAIN}' not found — using GP ${gpId}`)
  }

  fiscalYear = currentFiscalYear()
})

describe('INV-1 — N08 ↔ N09 demand totals match', () => {
  it('current_paise per head matches calcPropertyTax() output (±1 paise)', async () => {
    const rows = await db.execute<{
      property_id: string
      property_no: string
      property_type: string
      length_ft: number | null
      width_ft: number | null
      lighting_tax_paise: number | string | null
      sanitation_tax_paise: number | string | null
      water_tax_paise: number | string | null
      land_rate_per_sqft: string | null
      construction_rate_per_sqft: string | null
      new_construction_rate_per_sqft: string | null
      default_lighting_paise: number | string | null
      default_sanitation_paise: number | string | null
      default_water_paise: number | string | null
      tax_head: string
      current_paise: number | string
    }>(sql`
      SELECT
        p.id AS property_id,
        p.property_no,
        p.property_type,
        p.length_ft,
        p.width_ft,
        p.lighting_tax_paise,
        p.sanitation_tax_paise,
        p.water_tax_paise,
        r.land_rate_per_sqft,
        r.construction_rate_per_sqft,
        r.new_construction_rate_per_sqft,
        r.default_lighting_paise,
        r.default_sanitation_paise,
        r.default_water_paise,
        dl.tax_head,
        dl.current_paise
      FROM gp_properties p
      JOIN gp_namuna9_demands d
        ON d.property_id = p.id
       AND d.gp_id = ${gpId}
       AND d.fiscal_year = ${fiscalYear}
      JOIN gp_namuna9_demand_lines dl ON dl.demand_id = d.id
      LEFT JOIN gp_property_type_rates r
        ON r.gp_id = p.gp_id
       AND r.property_type = p.property_type
      WHERE p.gp_id = ${gpId}
      ORDER BY p.property_no, dl.tax_head
    `)

    expect(rows.length).toBeGreaterThan(0)

    const byProperty = new Map<string, typeof rows>()
    for (const row of rows) {
      const list = byProperty.get(row.property_id) ?? []
      list.push(row)
      byProperty.set(row.property_id, list)
    }

    let sawOverrideLighting = false
    let sawZeroArea = false
    let sawNullDefaultLighting = false

    for (const [, propertyRows] of byProperty) {
      const base = propertyRows[0]!
      const expected = calcPropertyTax(
        {
          lengthFt: base.length_ft,
          widthFt: base.width_ft,
          lightingTaxPaise: base.lighting_tax_paise,
          sanitationTaxPaise: base.sanitation_tax_paise,
          waterTaxPaise: base.water_tax_paise,
        },
        {
          landRatePerSqft: base.land_rate_per_sqft,
          constructionRatePerSqft: base.construction_rate_per_sqft,
          newConstructionRatePerSqft: base.new_construction_rate_per_sqft,
          defaultLightingPaise: base.default_lighting_paise,
          defaultSanitationPaise: base.default_sanitation_paise,
          defaultWaterPaise: base.default_water_paise,
        },
        { useNewConstructionRate: base.property_type === 'navi_rcc' }
      )

      const actualByHead = new Map(
        propertyRows.map((r) => [r.tax_head, asNumber(r.current_paise)])
      )

      const diffs = {
        house: Math.abs((actualByHead.get('house') ?? -1) - expected.houseTaxPaise),
        lighting: Math.abs((actualByHead.get('lighting') ?? -1) - expected.lightingPaise),
        sanitation: Math.abs((actualByHead.get('sanitation') ?? -1) - expected.sanitationPaise),
        water: Math.abs((actualByHead.get('water') ?? -1) - expected.waterPaise),
      }

      expect(diffs.house, `${base.property_no} house diff`).toBeLessThanOrEqual(1)
      expect(diffs.lighting, `${base.property_no} lighting diff`).toBeLessThanOrEqual(1)
      expect(diffs.sanitation, `${base.property_no} sanitation diff`).toBeLessThanOrEqual(1)
      expect(diffs.water, `${base.property_no} water diff`).toBeLessThanOrEqual(1)

      if (base.lighting_tax_paise != null) {
        sawOverrideLighting = true
        expect(actualByHead.get('lighting')).toBe(asNumber(base.lighting_tax_paise))
      }

      const areaSqFt = (base.length_ft ?? 0) * (base.width_ft ?? 0)
      if (areaSqFt === 0) {
        sawZeroArea = true
        expect(actualByHead.get('house') ?? 0).toBe(0)
      }

      if (base.default_lighting_paise == null && base.lighting_tax_paise == null) {
        sawNullDefaultLighting = true
        expect(actualByHead.get('lighting') ?? 0).toBe(0)
      }
    }

    expect(sawOverrideLighting).toBe(true)
    expect(sawZeroArea).toBe(true)
    expect(sawNullDefaultLighting).toBe(true)
  })
})

describe('INV-2 — N09 no overpayment + generated columns', () => {
  it('paid_paise is never greater than previous+current', async () => {
    const [result] = await db.execute<{ violations: number }>(sql`
      SELECT COUNT(*)::int AS violations
      FROM gp_namuna9_demand_lines dl
      JOIN gp_namuna9_demands d ON d.id = dl.demand_id
      WHERE d.gp_id = ${gpId}
        AND d.fiscal_year = ${fiscalYear}
        AND dl.paid_paise > dl.previous_paise + dl.current_paise
    `)
    expect(result.violations).toBe(0)
  })

  it('values are non-negative and generated formula/status are correct', async () => {
    const [nonNeg] = await db.execute<{ violations: number }>(sql`
      SELECT COUNT(*)::int AS violations
      FROM gp_namuna9_demand_lines dl
      JOIN gp_namuna9_demands d ON d.id = dl.demand_id
      WHERE d.gp_id = ${gpId}
        AND d.fiscal_year = ${fiscalYear}
        AND (dl.paid_paise < 0 OR dl.current_paise < 0 OR dl.previous_paise < 0)
    `)
    expect(nonNeg.violations).toBe(0)

    const [drift] = await db.execute<{ drift: number }>(sql`
      SELECT COUNT(*)::int AS drift
      FROM gp_namuna9_demand_lines dl
      JOIN gp_namuna9_demands d ON d.id = dl.demand_id
      WHERE d.gp_id = ${gpId}
        AND d.fiscal_year = ${fiscalYear}
        AND dl.total_due_paise IS DISTINCT FROM
            (dl.previous_paise + dl.current_paise - dl.paid_paise)
    `)
    expect(drift.drift).toBe(0)

    const [statusDrift] = await db.execute<{ violations: number }>(sql`
      SELECT COUNT(*)::int AS violations
      FROM gp_namuna9_demand_lines dl
      JOIN gp_namuna9_demands d ON d.id = dl.demand_id
      WHERE d.gp_id = ${gpId}
        AND d.fiscal_year = ${fiscalYear}
        AND dl.status IS DISTINCT FROM CASE
          WHEN dl.previous_paise + dl.current_paise = 0 THEN 'paid'
          WHEN dl.paid_paise = 0 THEN 'pending'
          WHEN dl.paid_paise >= dl.previous_paise + dl.current_paise THEN 'paid'
          ELSE 'partial'
        END
    `)
    expect(statusDrift.violations).toBe(0)
  })
})

describe('INV-3 — 3-way tie: N10 = N05 net = N06 month total', () => {
  it('tax-head totals match for busiest receipt month', async () => {
    const [monthRow] = await db.execute<{
      month_start: string
      count: number | string
    }>(sql`
      SELECT
        date_trunc('month', r.paid_at AT TIME ZONE 'Asia/Kolkata')::date::text AS month_start,
        COUNT(*)::int AS count
      FROM gp_namuna10_receipts r
      WHERE r.gp_id = ${gpId}
        AND r.fiscal_year = ${fiscalYear}
        AND r.is_void = false
      GROUP BY date_trunc('month', r.paid_at AT TIME ZONE 'Asia/Kolkata')
      ORDER BY COUNT(*) DESC, month_start DESC
      LIMIT 1
    `)

    expect(monthRow).toBeTruthy()

    const monthStart = monthRow.month_start
    const fyMonth = fyMonthNo(new Date(`${monthStart}T00:00:00+05:30`))

    const [n10] = await db.execute<{ n10_total: number | string | null }>(sql`
      SELECT COALESCE(SUM(t.total_paise), 0)::bigint AS n10_total
      FROM gp_namuna10_receipts r
      JOIN gp_namuna10_receipt_totals t ON t.receipt_id = r.id
      WHERE r.gp_id = ${gpId}
        AND r.fiscal_year = ${fiscalYear}
        AND date_trunc('month', r.paid_at AT TIME ZONE 'Asia/Kolkata')::date = ${monthStart}::date
        AND r.is_void = false
    `)

    const [n05] = await db.execute<{ n05_net: number | string | null }>(sql`
      SELECT
        COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount_paise ELSE -amount_paise END), 0)::bigint AS n05_net
      FROM gp_namuna05_cashbook_entries
      WHERE gp_id = ${gpId}
        AND fiscal_year = ${fiscalYear}
        AND fy_month_no = ${fyMonth}
        AND account_head IN ('property_tax_house','property_tax_lighting','property_tax_sanitation','property_tax_water')
        AND source_type = 'namuna10'
    `)

    const [n06] = await db.execute<{ n06_total: number | string | null }>(sql`
      SELECT COALESCE(SUM(month_total_paise), 0)::bigint AS n06_total
      FROM gp_namuna06_view
      WHERE gp_id = ${gpId}
        AND fiscal_year = ${fiscalYear}
        AND fy_month_no = ${fyMonth}
        AND account_head IN ('property_tax_house','property_tax_lighting','property_tax_sanitation','property_tax_water')
    `)

    const n10Total = asNumber(n10.n10_total)
    const n05Net = asNumber(n05.n05_net)
    const n06Total = asNumber(n06.n06_total)

    expect(n10Total).toBeGreaterThan(0)
    expect(n10Total).toBe(n05Net)
    expect(n10Total).toBe(n06Total)
  })
})

describe('INV-4 — N10 receipt math integrity', () => {
  it('computed_total equals view total and receipt constraints hold', async () => {
    const rows = await db.execute<{
      receipt_id: string
      receipt_no: string
      discount_paise: number | string
      late_fee_paise: number | string
      notice_fee_paise: number | string
      other_paise: number | string
      lines_total: number | string
      view_total: number | string
      computed_total: number | string
    }>(sql`
      SELECT
        r.id AS receipt_id,
        r.receipt_no,
        r.discount_paise,
        r.late_fee_paise,
        r.notice_fee_paise,
        r.other_paise,
        SUM(rl.amount_paise)::bigint AS lines_total,
        COALESCE(t.total_paise, 0)::bigint AS view_total,
        (SUM(rl.amount_paise) - r.discount_paise + r.late_fee_paise + r.notice_fee_paise + r.other_paise)::bigint AS computed_total
      FROM gp_namuna10_receipts r
      JOIN gp_namuna10_receipt_lines rl ON rl.receipt_id = r.id
      LEFT JOIN gp_namuna10_receipt_totals t ON t.receipt_id = r.id
      WHERE r.gp_id = ${gpId}
        AND r.fiscal_year = ${fiscalYear}
      GROUP BY r.id, r.receipt_no, r.discount_paise, r.late_fee_paise, r.notice_fee_paise, r.other_paise, t.total_paise
      ORDER BY r.receipt_no
    `)

    expect(rows.length).toBeGreaterThan(0)

    const receiptNoRegex = /^\d{4}-\d{2}\/\d{6}$/
    const seenReceiptNos = new Set<string>()

    for (const row of rows) {
      const linesTotal = asNumber(row.lines_total)
      const viewTotal = asNumber(row.view_total)
      const computedTotal = asNumber(row.computed_total)
      const discount = asNumber(row.discount_paise)
      const late = asNumber(row.late_fee_paise)
      const notice = asNumber(row.notice_fee_paise)
      const other = asNumber(row.other_paise)

      expect(computedTotal, `${row.receipt_no} computed vs view`).toBe(viewTotal)
      expect(linesTotal, `${row.receipt_no} lines_total`).toBeGreaterThan(0)
      expect(computedTotal, `${row.receipt_no} total`).toBeGreaterThan(0)
      expect(discount).toBeGreaterThanOrEqual(0)
      expect(late).toBeGreaterThanOrEqual(0)
      expect(notice).toBeGreaterThanOrEqual(0)
      expect(other).toBeGreaterThanOrEqual(0)
      expect(row.receipt_no).toMatch(receiptNoRegex)
      expect(seenReceiptNos.has(row.receipt_no)).toBe(false)
      seenReceiptNos.add(row.receipt_no)
    }

    const [orphans] = await db.execute<{ orphan_count: number }>(sql`
      SELECT COUNT(*)::int AS orphan_count
      FROM gp_namuna10_receipt_lines rl
      LEFT JOIN gp_namuna9_demand_lines dl ON dl.id = rl.demand_line_id
      LEFT JOIN gp_namuna10_receipts r ON r.id = rl.receipt_id
      WHERE r.gp_id = ${gpId}
        AND r.fiscal_year = ${fiscalYear}
        AND dl.id IS NULL
    `)
    expect(orphans.orphan_count).toBe(0)
  })
})

describe('INV-5 — Void reversal posts on void date and mirrors original', () => {
  it('voided receipt has mirror reversal entries and N09 reversal effect', async () => {
    const [voided] = await db.execute<{
      id: string
      receipt_no: string
      paid_at: string
      voided_at: string
      fiscal_year: string
    }>(sql`
      SELECT id, receipt_no, paid_at::text, voided_at::text, fiscal_year
      FROM gp_namuna10_receipts
      WHERE gp_id = ${gpId}
        AND fiscal_year = ${fiscalYear}
        AND is_void = true
      ORDER BY voided_at DESC
      LIMIT 1
    `)

    expect(voided).toBeTruthy()
    expect(voided.voided_at).toBeTruthy()

    const [voidCount] = await db.execute<{ count: number }>(sql`
      SELECT COUNT(*)::int AS count
      FROM gp_namuna05_cashbook_entries
      WHERE source_id = ${voided.id}
        AND source_type = 'namuna10_void'
    `)
    expect(voidCount.count).toBeGreaterThan(0)

    const [dateMismatch] = await db.execute<{ mismatches: number }>(sql`
      SELECT COUNT(*)::int AS mismatches
      FROM gp_namuna05_cashbook_entries
      WHERE source_id = ${voided.id}
        AND source_type = 'namuna10_void'
        AND entry_date::text <> ${indiaDateString(voided.voided_at)}
    `)
    expect(dateMismatch.mismatches).toBe(0)

    const [typeMismatch] = await db.execute<{ mismatches: number }>(sql`
      WITH original AS (
        SELECT account_head, entry_type, amount_paise
        FROM gp_namuna05_cashbook_entries
        WHERE source_id = ${voided.id} AND source_type = 'namuna10'
      ),
      reversed AS (
        SELECT account_head, entry_type, amount_paise
        FROM gp_namuna05_cashbook_entries
        WHERE source_id = ${voided.id} AND source_type = 'namuna10_void'
      )
      SELECT COUNT(*)::int AS mismatches
      FROM (
        SELECT
          o.account_head,
          o.amount_paise,
          o.entry_type AS original_type,
          r.entry_type AS reverse_type
        FROM original o
        JOIN reversed r
          ON r.account_head = o.account_head
         AND r.amount_paise = o.amount_paise
      ) t
      WHERE NOT (
        (t.original_type = 'credit' AND t.reverse_type = 'debit')
        OR
        (t.original_type = 'debit' AND t.reverse_type = 'credit')
      )
    `)
    expect(typeMismatch.mismatches).toBe(0)

    const [amountMismatch] = await db.execute<{ mismatches: number }>(sql`
      WITH original AS (
        SELECT account_head, COALESCE(SUM(amount_paise), 0)::bigint AS amt
        FROM gp_namuna05_cashbook_entries
        WHERE source_id = ${voided.id} AND source_type = 'namuna10'
        GROUP BY account_head
      ),
      reversed AS (
        SELECT account_head, COALESCE(SUM(amount_paise), 0)::bigint AS amt
        FROM gp_namuna05_cashbook_entries
        WHERE source_id = ${voided.id} AND source_type = 'namuna10_void'
        GROUP BY account_head
      )
      SELECT COUNT(*)::int AS mismatches
      FROM (
        SELECT
          COALESCE(o.account_head, r.account_head) AS account_head,
          COALESCE(o.amt, 0) AS original_amt,
          COALESCE(r.amt, 0) AS reverse_amt
        FROM original o
        FULL OUTER JOIN reversed r USING (account_head)
      ) x
      WHERE x.original_amt <> x.reverse_amt
    `)
    expect(amountMismatch.mismatches).toBe(0)

    const [n09AfterVoid] = await db.execute<{ non_zero_lines: number }>(sql`
      SELECT COUNT(*)::int AS non_zero_lines
      FROM gp_namuna9_demand_lines dl
      JOIN gp_namuna10_receipt_lines rl ON rl.demand_line_id = dl.id
      WHERE rl.receipt_id = ${voided.id}
        AND dl.paid_paise <> 0
    `)
    expect(n09AfterVoid.non_zero_lines).toBe(0)
  })
})
