import { eq, sql } from 'drizzle-orm'
import { sqlBigintArray, sqlDate, sqlUuidArray } from '../lib/sql-helpers.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import {
  gpNamuna10ReceiptLines,
  gpNamuna10Receipts,
  gpTenants,
} from '../db/schema/index.ts'
import { currentFiscalYear } from '../lib/fiscal.ts'
import { isTaxHead } from '../lib/tax-head.ts'
import type { Namuna10CreateBody } from '../types/namuna10.dto.ts'

type AllocatedSeqRow = { allocated: number }

type LockedDemandLineRow = {
  id: string
  gp_id: string
  property_id: string
  total_due_paise: number
}

type ReceiptHeaderRow = {
  id: string
  receipt_no: string
  fiscal_year: string
  property_id: string
  property_no: string
  property_type: string
  ward_number: string
  owner_name_mr: string
  owner_name_en: string | null
  payer_name: string
  paid_at: Date | string
  payment_mode: string
  reference: string | null
  discount_paise: number | string
  late_fee_paise: number | string
  notice_fee_paise: number | string
  other_paise: number | string
  other_reason: string | null
  is_void: boolean
  voided_at: Date | string | null
  voided_by: string | null
  void_reason: string | null
  lines_total_paise: number | string | null
  total_paise: number | string | null
}

type ReceiptLineRow = {
  id: string
  demand_line_id: string
  tax_head: string
  amount_paise: number | string
}

type ReceiptListRow = {
  id: string
  receipt_no: string
  fiscal_year: string
  property_id: string
  property_no: string
  payer_name: string
  paid_at: Date | string
  payment_mode: string
  is_void: boolean
  total_paise: number | string | null
}

function asNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

function asIsoString(value: Date | string | null | undefined): string | null {
  if (value == null) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function formatReceiptNo(fiscalYear: string, seq: number): string {
  return `${fiscalYear}/${String(seq).padStart(6, '0')}`
}

export const namuna10Service = {
  async create(gpId: string, createdBy: string, body: Namuna10CreateBody) {
    const [tenant] = await db
      .select({ onboardingComplete: gpTenants.onboardingComplete })
      .from(gpTenants)
      .where(eq(gpTenants.id, gpId))
      .limit(1)

    if (!tenant) throw new ApiError(404, 'Tenant not found')
    if (!tenant.onboardingComplete) {
      throw new ApiError(409, 'GP onboarding अपूर्ण आहे. आधी onboarding पूर्ण करा.')
    }

    const activeFy = currentFiscalYear()
    if (body.fiscalYear !== activeFy) {
      throw new ApiError(
        422,
        `फक्त चालू आर्थिक वर्षासाठी (${activeFy}) वसुली नोंदवता येते`
      )
    }

    return db.transaction(async (tx) => {
      // Sequence gaps on TX rollback are intentional — receipt numbers are
      // never reused. Gaps are an audit signal, not a bug.
      const [seq] = await tx.execute<AllocatedSeqRow>(sql`
        INSERT INTO gp_receipt_sequences (gp_id, fiscal_year, next_no)
        VALUES (${gpId}, ${body.fiscalYear}, 2)
        ON CONFLICT (gp_id, fiscal_year) DO UPDATE
          SET next_no = gp_receipt_sequences.next_no + 1,
              updated_at = now()
        RETURNING next_no - 1 AS allocated
      `)

      if (!seq) throw new ApiError(500, 'Receipt sequence allocation failed')

      const receiptNo = formatReceiptNo(body.fiscalYear, seq.allocated)
      const demandLineIds = body.lines.map((line) => line.demandLineId)

      const lockedLines = await tx.execute<LockedDemandLineRow>(sql`
        SELECT
          dl.id,
          d.gp_id,
          d.property_id,
          dl.total_due_paise
        FROM gp_namuna9_demand_lines dl
        JOIN gp_namuna9_demands d ON d.id = dl.demand_id
        WHERE dl.id = ANY(${sqlUuidArray(demandLineIds)})
        FOR UPDATE
      `)

      if (lockedLines.length !== demandLineIds.length) {
        throw new ApiError(422, 'One or more demand lines not found')
      }

      const lockedLineById = new Map(lockedLines.map((row) => [row.id, row]))

      for (const line of body.lines) {
        const locked = lockedLineById.get(line.demandLineId)
        if (!locked) {
          throw new ApiError(422, `Demand line ${line.demandLineId} not found`)
        }
        if (locked.gp_id !== gpId) {
          throw new ApiError(403, 'Demand line belongs to another GP')
        }
        if (locked.property_id !== body.propertyId) {
          throw new ApiError(
            422,
            `Demand line ${line.demandLineId} does not belong to property ${body.propertyId}`
          )
        }
        if (line.amountPaise > locked.total_due_paise) {
          throw new ApiError(
            422,
            `amountPaise ${line.amountPaise} exceeds total_due_paise ${locked.total_due_paise} for line ${line.demandLineId}`
          )
        }
      }

      const [receipt] = await tx
        .insert(gpNamuna10Receipts)
        .values({
          gpId,
          propertyId:     body.propertyId,
          payerName:      body.payerName,
          fiscalYear:     body.fiscalYear,
          receiptNo,
          paidAt:         new Date(body.paidAt),
          paymentMode:    body.paymentMode,
          reference:      body.reference,
          discountPaise:  body.discountPaise,
          lateFeePaise:   body.lateFeePaise,
          noticeFeePaise: body.noticeFeePaise,
          otherPaise:     body.otherPaise,
          otherReason:    body.otherReason,
          createdBy,
        })
        .returning()

      if (!receipt) throw new ApiError(500, 'Receipt insert failed')

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

      const lineIds = body.lines.map((line) => line.demandLineId)
      const lineAmounts = body.lines.map((line) => line.amountPaise)
      const now = new Date()

      await tx.execute(sql`
        UPDATE gp_namuna9_demand_lines AS t
        SET paid_paise = t.paid_paise + v.amount_paise,
            updated_at = ${sqlDate(now)}
        FROM (
          SELECT UNNEST(${sqlUuidArray(lineIds)})    AS demand_line_id,
                 UNNEST(${sqlBigintArray(lineAmounts)}) AS amount_paise
        ) AS v
        WHERE t.id = v.demand_line_id
      `)

      const linesTotalPaise = body.lines.reduce((sum, line) => sum + line.amountPaise, 0)
      // Must match gp_namuna10_receipt_totals view formula exactly.
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
        reference:   receipt.reference ?? null,
        discountPaise: receipt.discountPaise,
        lateFeePaise: receipt.lateFeePaise,
        noticeFeePaise: receipt.noticeFeePaise,
        otherPaise: receipt.otherPaise,
        otherReason: receipt.otherReason ?? null,
        isVoid: receipt.isVoid,
        lines:       insertedLines.map((line) => ({
          id:           line.id,
          demandLineId: line.demandLineId,
          amountPaise:  line.amountPaise,
        })),
        totals: {
          linesTotalPaise,
          totalPaise,
        },
      }
    })
  },

  async getById(gpId: string, receiptId: string) {
    const [header] = await db.execute<ReceiptHeaderRow>(sql`
      SELECT
        r.id,
        r.receipt_no,
        r.fiscal_year,
        r.property_id,
        p.property_no,
        p.property_type,
        c.ward_number,
        c.name_mr AS owner_name_mr,
        c.name_en AS owner_name_en,
        r.payer_name,
        r.paid_at,
        r.payment_mode,
        r.reference,
        r.discount_paise,
        r.late_fee_paise,
        r.notice_fee_paise,
        r.other_paise,
        r.other_reason,
        r.is_void,
        r.voided_at,
        r.voided_by,
        r.void_reason,
        t.lines_total_paise,
        t.total_paise
      FROM gp_namuna10_receipts r
      JOIN gp_properties p ON p.id = r.property_id
      JOIN gp_citizens c ON c.id = p.owner_citizen_id
      LEFT JOIN gp_namuna10_receipt_totals t ON t.receipt_id = r.id
      WHERE r.gp_id = ${gpId}
        AND r.id = ${receiptId}
      LIMIT 1
    `)

    if (!header) throw new ApiError(404, 'Receipt not found')

    const rows = await db.execute<ReceiptLineRow>(sql`
      SELECT
        rl.id,
        rl.demand_line_id,
        dl.tax_head,
        rl.amount_paise
      FROM gp_namuna10_receipt_lines rl
      JOIN gp_namuna9_demand_lines dl ON dl.id = rl.demand_line_id
      WHERE rl.receipt_id = ${receiptId}
      ORDER BY rl.created_at, rl.id
    `)

    return {
      id:         header.id,
      receiptNo:  header.receipt_no,
      fiscalYear: header.fiscal_year,
      propertyId: header.property_id,
      property: {
        id: header.property_id,
        propertyNo: header.property_no,
        propertyType: header.property_type,
        wardNumber: header.ward_number,
      },
      owner: {
        nameMr: header.owner_name_mr,
        nameEn: header.owner_name_en,
      },
      payerName: header.payer_name,
      paidAt: asIsoString(header.paid_at),
      paymentMode: header.payment_mode,
      reference: header.reference,
      discountPaise: asNumber(header.discount_paise),
      lateFeePaise: asNumber(header.late_fee_paise),
      noticeFeePaise: asNumber(header.notice_fee_paise),
      otherPaise: asNumber(header.other_paise),
      otherReason: header.other_reason,
      isVoid: header.is_void,
      voidedAt: asIsoString(header.voided_at),
      voidedBy: header.voided_by,
      voidReason: header.void_reason,
      lines: rows
        .filter((row) => isTaxHead(row.tax_head))
        .map((row) => ({
          id: row.id,
          demandLineId: row.demand_line_id,
          taxHead: row.tax_head,
          amountPaise: asNumber(row.amount_paise),
        })),
      totals: {
        linesTotalPaise: asNumber(header.lines_total_paise),
        totalPaise: asNumber(header.total_paise),
      },
    }
  },

  async list(
    gpId: string,
    filters: {
      q?: string
      propertyId?: string
      fiscalYear?: string
      limit?: number
      offset?: number
    }
  ) {
    const limit = Math.min(filters.limit ?? 50, 100)
    const offset = Math.max(filters.offset ?? 0, 0)
    const query = filters.q?.trim()

    const rows = await db.execute<ReceiptListRow>(sql`
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
        ${query ? sql`AND (
          r.receipt_no ILIKE ${`%${query}%`}
          OR p.property_no ILIKE ${`%${query}%`}
          OR r.payer_name ILIKE ${`%${query}%`}
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
}
