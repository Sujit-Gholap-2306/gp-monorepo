import { eq, sql } from 'drizzle-orm'
import { sqlBigintArray, sqlDate, sqlUuidArray } from '../lib/sql-helpers.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import {
  gpNamuna05CashbookEntries,
  gpNamuna10ReceiptLines,
  gpNamuna10Receipts,
  gpTenants,
} from '../db/schema/index.ts'
import type { Namuna10BookType } from '../db/schema/namuna10-receipts.ts'
import { accountHeadForTaxHead } from '../lib/account-heads.ts'
import { currentFiscalYear, fyMonthNo } from '../lib/fiscal.ts'
import { isTaxHead } from '../lib/tax-head.ts'
import type { Namuna10CreateBody } from '../types/namuna10.dto.ts'

type AllocatedSeqRow = { allocated: number }

type LockedPropertyDemandLineRow = {
  id: string
  gp_id: string
  property_id: string
  fiscal_year: string
  tax_head: string
  total_due_paise: number
}

type LockedWaterDemandLineRow = {
  id: string
  gp_id: string
  water_connection_id: string
  fiscal_year: string
  total_due_paise: number
}

type ReceiptHeaderRow = {
  id: string
  receipt_no: string
  fiscal_year: string
  book_type: Namuna10BookType
  property_id: string | null
  water_connection_id: string | null
  property_no: string | null
  property_type: string | null
  property_ward_number: string | null
  owner_name_mr: string | null
  owner_name_en: string | null
  consumer_no: string | null
  connection_type: string | null
  pipe_size_mm: number | null
  water_ward_number: string | null
  water_citizen_no: number | null
  water_name_mr: string | null
  water_name_en: string | null
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
  demand_line_id: string | null
  water_demand_line_id: string | null
  tax_head: string
  amount_paise: number | string
}

type ReceiptListRow = {
  id: string
  receipt_no: string
  fiscal_year: string
  book_type: Namuna10BookType
  property_id: string | null
  property_no: string | null
  water_connection_id: string | null
  consumer_no: string | null
  payer_name: string
  paid_at: Date | string
  payment_mode: string
  is_void: boolean
  total_paise: number | string | null
}

type VoidReceiptRow = {
  id: string
  receipt_no: string
  gp_id: string
  book_type: Namuna10BookType
  discount_paise: number | string
  late_fee_paise: number | string
  notice_fee_paise: number | string
  other_paise: number | string
  is_void: boolean
}

type VoidPropertyReceiptLineRow = {
  receipt_line_id: string
  demand_line_id: string
  tax_head: string
  amount_paise: number | string
  paid_paise: number | string
}

type VoidWaterReceiptLineRow = {
  receipt_line_id: string
  water_demand_line_id: string
  amount_paise: number | string
  paid_paise: number | string
}

type CashbookEntryType = 'credit' | 'debit'
type CashbookSourceType = 'namuna10' | 'namuna10_void'

type N05AccountHead =
  | 'property_tax_house'
  | 'property_tax_lighting'
  | 'property_tax_sanitation'
  | 'water_tax'
  | 'discount'
  | 'late_fee'
  | 'notice_fee'
  | 'other'

type N05EntryRow = {
  gpId: string
  entryDate: string
  fiscalYear: string
  fyMonthNo: number
  entryType: CashbookEntryType
  accountHead: N05AccountHead
  description: string
  amountPaise: number
  sourceType: CashbookSourceType
  sourceId: string
  sourceLineId: string | null
  createdBy: string
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

const INDIA_UTC_OFFSET_MS = 5.5 * 60 * 60 * 1000

function indiaDateString(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input)
  const india = new Date(date.getTime() + INDIA_UTC_OFFSET_MS)
  const year = india.getUTCFullYear()
  const month = String(india.getUTCMonth() + 1).padStart(2, '0')
  const day = String(india.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildN05Entries(params: {
  mode: 'create' | 'void'
  gpId: string
  entryDate: string
  fiscalYear: string
  fyMonthNo: number
  descriptionBase: string
  sourceType: CashbookSourceType
  sourceId: string
  lines: Array<{ accountHead: N05AccountHead; amountPaise: number; sourceLineId: string }>
  adjustments: {
    discountPaise: number
    lateFeePaise: number
    noticeFeePaise: number
    otherPaise: number
  }
  createdBy: string
}): N05EntryRow[] {
  const { mode, gpId, entryDate, fiscalYear, fyMonthNo: monthNo, descriptionBase, sourceType, sourceId, createdBy } = params
  const lineEntryType: CashbookEntryType = mode === 'create' ? 'credit' : 'debit'
  const discountType: CashbookEntryType = mode === 'create' ? 'debit' : 'credit'
  const feeType: CashbookEntryType = mode === 'create' ? 'credit' : 'debit'

  const ctx = { gpId, entryDate, fiscalYear, fyMonthNo: monthNo, sourceType, sourceId, createdBy }

  const entries: N05EntryRow[] = params.lines.map((line) => ({
    ...ctx,
    entryType: lineEntryType,
    accountHead: line.accountHead,
    description: `${descriptionBase} line`,
    amountPaise: line.amountPaise,
    sourceLineId: line.sourceLineId,
  }))

  const adj = params.adjustments
  const adjustmentDefs: Array<[number, 'discount' | 'late_fee' | 'notice_fee' | 'other', CashbookEntryType]> = [
    [adj.discountPaise, 'discount', discountType],
    [adj.lateFeePaise, 'late_fee', feeType],
    [adj.noticeFeePaise, 'notice_fee', feeType],
    [adj.otherPaise, 'other', feeType],
  ]

  for (const [amountPaise, accountHead, entryType] of adjustmentDefs) {
    if (amountPaise > 0) {
      entries.push({
        ...ctx,
        entryType,
        accountHead,
        description: `${descriptionBase} adjustment ${accountHead}`,
        amountPaise,
        sourceLineId: null,
      })
    }
  }

  return entries
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

    const paidAtDate = new Date(body.paidAt)
    if (currentFiscalYear(paidAtDate) !== body.fiscalYear) {
      throw new ApiError(
        422,
        `paidAt (${body.paidAt}) आर्थिक वर्ष ${body.fiscalYear} मध्ये येत नाही`
      )
    }

    const receiptId = await db.transaction(async (tx) => {
      const [seq] = await tx.execute<AllocatedSeqRow>(sql`
        INSERT INTO gp_receipt_sequences (gp_id, fiscal_year, book_type, next_no)
        VALUES (${gpId}, ${body.fiscalYear}, ${body.bookType}, 2)
        ON CONFLICT (gp_id, fiscal_year, book_type) DO UPDATE
          SET next_no = gp_receipt_sequences.next_no + 1,
              updated_at = now()
        RETURNING next_no - 1 AS allocated
      `)

      if (!seq) throw new ApiError(500, 'Receipt sequence allocation failed')
      const receiptNo = formatReceiptNo(body.fiscalYear, seq.allocated)
      const now = new Date()

      if (body.bookType === 'property') {
        const propertyId = body.propertyId
        if (!propertyId) throw new ApiError(422, 'propertyId is required for property book')

        const demandLineIds = body.lines.map((line) => line.demandLineId!).filter(Boolean)
        const lockedLines = await tx.execute<LockedPropertyDemandLineRow>(sql`
          SELECT
            dl.id,
            d.gp_id,
            d.property_id,
            d.fiscal_year,
            dl.tax_head,
            dl.total_due_paise
          FROM gp_namuna9_demand_lines dl
          JOIN gp_namuna9_demands d ON d.id = dl.demand_id
          WHERE dl.id = ANY(${sqlUuidArray(demandLineIds)})
            AND d.fiscal_year = ${body.fiscalYear}
          FOR UPDATE
        `)

        if (lockedLines.length !== demandLineIds.length) {
          throw new ApiError(422, 'One or more demand lines not found')
        }

        const lockedLineById = new Map(lockedLines.map((row) => [row.id, row]))
        for (const line of body.lines) {
          const demandLineId = line.demandLineId
          if (!demandLineId) throw new ApiError(422, 'demandLineId required for property line')
          const locked = lockedLineById.get(demandLineId)
          if (!locked) throw new ApiError(422, `Demand line ${demandLineId} not found`)
          if (locked.gp_id !== gpId) throw new ApiError(403, 'Demand line belongs to another GP')
          if (locked.property_id !== propertyId) {
            throw new ApiError(422, `Demand line ${demandLineId} does not belong to property ${propertyId}`)
          }
          if (line.amountPaise > locked.total_due_paise) {
            throw new ApiError(
              422,
              `amountPaise ${line.amountPaise} exceeds total_due_paise ${locked.total_due_paise} for line ${demandLineId}`
            )
          }
        }

        const [receipt] = await tx
          .insert(gpNamuna10Receipts)
          .values({
            gpId,
            bookType: body.bookType,
            propertyId,
            waterConnectionId: null,
            payerName: body.payerName,
            fiscalYear: body.fiscalYear,
            receiptNo,
            paidAt: new Date(body.paidAt),
            paymentMode: body.paymentMode,
            reference: body.reference,
            discountPaise: body.discountPaise,
            lateFeePaise: body.lateFeePaise,
            noticeFeePaise: body.noticeFeePaise,
            otherPaise: body.otherPaise,
            otherReason: body.otherReason,
            createdBy,
          })
          .returning()

        if (!receipt) throw new ApiError(500, 'Receipt insert failed')

        const insertedLines = await tx
          .insert(gpNamuna10ReceiptLines)
          .values(
            body.lines.map((line) => ({
              receiptId: receipt.id,
              demandLineId: line.demandLineId!,
              waterDemandLineId: null,
              amountPaise: line.amountPaise,
            }))
          )
          .returning()

        const lineIds = body.lines.map((line) => line.demandLineId!)
        const lineAmounts = body.lines.map((line) => line.amountPaise)

        await tx.execute(sql`
          UPDATE gp_namuna9_demand_lines AS t
          SET paid_paise = t.paid_paise + v.amount_paise,
              updated_at = ${sqlDate(now)}
          FROM (
            SELECT UNNEST(${sqlUuidArray(lineIds)}) AS demand_line_id,
                   UNNEST(${sqlBigintArray(lineAmounts)}) AS amount_paise
          ) AS v
          WHERE t.id = v.demand_line_id
        `)

        const paidAt = new Date(receipt.paidAt)
        const n05Entries = buildN05Entries({
          mode: 'create',
          gpId,
          entryDate: indiaDateString(paidAt),
          fiscalYear: receipt.fiscalYear,
          fyMonthNo: fyMonthNo(paidAt),
          descriptionBase: `N10 receipt ${receipt.receiptNo}`,
          sourceType: 'namuna10',
          sourceId: receipt.id,
          lines: insertedLines.map((line) => {
            const locked = lockedLineById.get(line.demandLineId!)
            if (!locked || !isTaxHead(locked.tax_head)) {
              throw new ApiError(500, `Tax head missing for demand line ${line.demandLineId}`)
            }
            return {
              accountHead: accountHeadForTaxHead(locked.tax_head),
              amountPaise: line.amountPaise,
              sourceLineId: line.id,
            }
          }),
          adjustments: {
            discountPaise: receipt.discountPaise,
            lateFeePaise: receipt.lateFeePaise,
            noticeFeePaise: receipt.noticeFeePaise,
            otherPaise: receipt.otherPaise,
          },
          createdBy,
        })

        if (n05Entries.length > 0) {
          await tx.insert(gpNamuna05CashbookEntries).values(n05Entries)
        }
        return receipt.id
      }

      const waterConnectionId = body.waterConnectionId
      if (!waterConnectionId) throw new ApiError(422, 'waterConnectionId is required for water book')

      const waterDemandLineIds = body.lines.map((line) => line.waterDemandLineId!).filter(Boolean)
      const lockedWaterLines = await tx.execute<LockedWaterDemandLineRow>(sql`
        SELECT
          wdl.id,
          wd.gp_id,
          wd.water_connection_id,
          wd.fiscal_year,
          wdl.total_due_paise
        FROM gp_water_connection_demand_lines wdl
        JOIN gp_water_connection_demands wd ON wd.id = wdl.demand_id
        WHERE wdl.id = ANY(${sqlUuidArray(waterDemandLineIds)})
          AND wd.fiscal_year = ${body.fiscalYear}
        FOR UPDATE
      `)

      if (lockedWaterLines.length !== waterDemandLineIds.length) {
        throw new ApiError(422, 'One or more water demand lines not found')
      }

      const lockedWaterLineById = new Map(lockedWaterLines.map((row) => [row.id, row]))
      for (const line of body.lines) {
        const waterDemandLineId = line.waterDemandLineId
        if (!waterDemandLineId) throw new ApiError(422, 'waterDemandLineId required for water line')
        const locked = lockedWaterLineById.get(waterDemandLineId)
        if (!locked) throw new ApiError(422, `Water demand line ${waterDemandLineId} not found`)
        if (locked.gp_id !== gpId) throw new ApiError(403, 'Water demand line belongs to another GP')
        if (locked.water_connection_id !== waterConnectionId) {
          throw new ApiError(
            422,
            `Water demand line ${waterDemandLineId} does not belong to water connection ${waterConnectionId}`
          )
        }
        if (line.amountPaise > locked.total_due_paise) {
          throw new ApiError(
            422,
            `amountPaise ${line.amountPaise} exceeds total_due_paise ${locked.total_due_paise} for line ${waterDemandLineId}`
          )
        }
      }

      const [receipt] = await tx
        .insert(gpNamuna10Receipts)
        .values({
          gpId,
          bookType: body.bookType,
          propertyId: null,
          waterConnectionId,
          payerName: body.payerName,
          fiscalYear: body.fiscalYear,
          receiptNo,
          paidAt: new Date(body.paidAt),
          paymentMode: body.paymentMode,
          reference: body.reference,
          discountPaise: body.discountPaise,
          lateFeePaise: body.lateFeePaise,
          noticeFeePaise: body.noticeFeePaise,
          otherPaise: body.otherPaise,
          otherReason: body.otherReason,
          createdBy,
        })
        .returning()

      if (!receipt) throw new ApiError(500, 'Receipt insert failed')

      const insertedLines = await tx
        .insert(gpNamuna10ReceiptLines)
        .values(
          body.lines.map((line) => ({
            receiptId: receipt.id,
            demandLineId: null,
            waterDemandLineId: line.waterDemandLineId!,
            amountPaise: line.amountPaise,
          }))
        )
        .returning()

      const lineIds = body.lines.map((line) => line.waterDemandLineId!)
      const lineAmounts = body.lines.map((line) => line.amountPaise)

      await tx.execute(sql`
        UPDATE gp_water_connection_demand_lines AS t
        SET paid_paise = t.paid_paise + v.amount_paise,
            updated_at = ${sqlDate(now)}
        FROM (
          SELECT UNNEST(${sqlUuidArray(lineIds)}) AS water_demand_line_id,
                 UNNEST(${sqlBigintArray(lineAmounts)}) AS amount_paise
        ) AS v
        WHERE t.id = v.water_demand_line_id
      `)

      const paidAt = new Date(receipt.paidAt)
      const n05Entries = buildN05Entries({
        mode: 'create',
        gpId,
        entryDate: indiaDateString(paidAt),
        fiscalYear: receipt.fiscalYear,
        fyMonthNo: fyMonthNo(paidAt),
        descriptionBase: `N10 receipt ${receipt.receiptNo}`,
        sourceType: 'namuna10',
        sourceId: receipt.id,
        lines: insertedLines.map((line) => ({
          accountHead: 'water_tax',
          amountPaise: line.amountPaise,
          sourceLineId: line.id,
        })),
        adjustments: {
          discountPaise: receipt.discountPaise,
          lateFeePaise: receipt.lateFeePaise,
          noticeFeePaise: receipt.noticeFeePaise,
          otherPaise: receipt.otherPaise,
        },
        createdBy,
      })

      if (n05Entries.length > 0) {
        await tx.insert(gpNamuna05CashbookEntries).values(n05Entries)
      }
      return receipt.id
    })

    return namuna10Service.getById(gpId, receiptId)
  },

  async getById(gpId: string, receiptId: string) {
    const [header] = await db.execute<ReceiptHeaderRow>(sql`
      SELECT
        r.id,
        r.receipt_no,
        r.fiscal_year,
        r.book_type,
        r.property_id,
        r.water_connection_id,
        p.property_no,
        p.property_type,
        cp.ward_number AS property_ward_number,
        cp.name_mr AS owner_name_mr,
        cp.name_en AS owner_name_en,
        wc.consumer_no,
        wc.connection_type,
        wc.pipe_size_mm,
        cw.ward_number AS water_ward_number,
        cw.citizen_no AS water_citizen_no,
        cw.name_mr AS water_name_mr,
        cw.name_en AS water_name_en,
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
      LEFT JOIN gp_properties p ON p.id = r.property_id
      LEFT JOIN gp_citizens cp ON cp.id = p.owner_citizen_id
      LEFT JOIN gp_water_connections wc ON wc.id = r.water_connection_id
      LEFT JOIN gp_citizens cw ON cw.id = wc.citizen_id
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
        rl.water_demand_line_id,
        COALESCE(dl.tax_head, 'water') AS tax_head,
        rl.amount_paise
      FROM gp_namuna10_receipt_lines rl
      LEFT JOIN gp_namuna9_demand_lines dl ON dl.id = rl.demand_line_id
      WHERE rl.receipt_id = ${receiptId}
      ORDER BY rl.created_at, rl.id
    `)

    return {
      id: header.id,
      receiptNo: header.receipt_no,
      fiscalYear: header.fiscal_year,
      bookType: header.book_type,
      propertyId: header.property_id,
      waterConnectionId: header.water_connection_id,
      property: header.property_id
        ? {
          id: header.property_id,
          propertyNo: header.property_no,
          propertyType: header.property_type,
          wardNumber: header.property_ward_number,
        }
        : null,
      waterConnection: header.water_connection_id
        ? {
          id: header.water_connection_id,
          consumerNo: header.consumer_no,
          connectionType: header.connection_type,
          pipeSizeMm: header.pipe_size_mm,
          citizenNo: header.water_citizen_no,
          wardNumber: header.water_ward_number,
          nameMr: header.water_name_mr,
          nameEn: header.water_name_en,
        }
        : null,
      owner: header.property_id
        ? {
          nameMr: header.owner_name_mr,
          nameEn: header.owner_name_en,
        }
        : null,
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
      lines: rows.map((row) => ({
        id: row.id,
        demandLineId: row.demand_line_id,
        waterDemandLineId: row.water_demand_line_id,
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
      waterConnectionId?: string
      bookType?: Namuna10BookType
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
        r.book_type,
        r.property_id,
        p.property_no,
        r.water_connection_id,
        wc.consumer_no,
        r.payer_name,
        r.paid_at,
        r.payment_mode,
        r.is_void,
        t.total_paise
      FROM gp_namuna10_receipts r
      LEFT JOIN gp_properties p ON p.id = r.property_id
      LEFT JOIN gp_water_connections wc ON wc.id = r.water_connection_id
      LEFT JOIN gp_namuna10_receipt_totals t ON t.receipt_id = r.id
      WHERE r.gp_id = ${gpId}
        ${filters.propertyId ? sql`AND r.property_id = ${filters.propertyId}::uuid` : sql``}
        ${filters.waterConnectionId ? sql`AND r.water_connection_id = ${filters.waterConnectionId}::uuid` : sql``}
        ${filters.bookType ? sql`AND r.book_type = ${filters.bookType}` : sql``}
        ${filters.fiscalYear ? sql`AND r.fiscal_year = ${filters.fiscalYear}` : sql``}
        ${query ? sql`AND (
          r.receipt_no ILIKE ${query + '%'}
          OR p.property_no ILIKE ${`%${query}%`}
          OR wc.consumer_no ILIKE ${`%${query}%`}
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
        bookType: row.book_type,
        propertyId: row.property_id,
        propertyNo: row.property_no,
        waterConnectionId: row.water_connection_id,
        consumerNo: row.consumer_no,
        payerName: row.payer_name,
        paidAt: asIsoString(row.paid_at),
        paymentMode: row.payment_mode,
        isVoid: row.is_void,
        totalPaise: asNumber(row.total_paise),
      })),
      limit,
      offset,
    }
  },

  async voidReceipt(gpId: string, actorId: string, receiptId: string, reason: string) {
    await db.transaction(async (tx) => {
      const [receipt] = await tx.execute<VoidReceiptRow>(sql`
        SELECT
          id,
          receipt_no,
          gp_id,
          book_type,
          discount_paise,
          late_fee_paise,
          notice_fee_paise,
          other_paise,
          is_void
        FROM gp_namuna10_receipts
        WHERE gp_id = ${gpId}
          AND id = ${receiptId}
        FOR UPDATE
      `)

      if (!receipt) throw new ApiError(404, 'Receipt not found')
      if (receipt.is_void) throw new ApiError(409, 'Receipt is already voided')

      const now = new Date()

      if (receipt.book_type === 'property') {
        const [totalCount] = await tx.execute<{ total: number }>(sql`
          SELECT COUNT(*)::int AS total
          FROM gp_namuna10_receipt_lines
          WHERE receipt_id = ${receiptId}
            AND demand_line_id IS NOT NULL
        `)

        const rows = await tx.execute<VoidPropertyReceiptLineRow>(sql`
          SELECT
            rl.id AS receipt_line_id,
            rl.demand_line_id,
            dl.tax_head,
            rl.amount_paise,
            dl.paid_paise
          FROM gp_namuna10_receipt_lines rl
          JOIN gp_namuna9_demand_lines dl ON dl.id = rl.demand_line_id
          JOIN gp_namuna9_demands d ON d.id = dl.demand_id
          WHERE rl.receipt_id = ${receiptId}
            AND d.gp_id = ${gpId}
          FOR UPDATE OF dl
        `)

        if (rows.length === 0) throw new ApiError(409, 'Receipt has no reversible lines')
        if (rows.length !== totalCount?.total) {
          throw new ApiError(
            409,
            `Partial reversal detected: receipt has ${totalCount?.total} lines but only ${rows.length} are reversible. Data integrity violation — void aborted.`
          )
        }

        for (const row of rows) {
          const amountPaise = asNumber(row.amount_paise)
          const paidPaise = asNumber(row.paid_paise)
          if (paidPaise < amountPaise) {
            throw new ApiError(
              409,
              `Cannot void receipt: demand line ${row.demand_line_id} has paid_paise ${paidPaise}, below reversal amount ${amountPaise}`
            )
          }
        }

        const demandLineIds = rows.map((row) => row.demand_line_id)
        const amounts = rows.map((row) => asNumber(row.amount_paise))

        await tx.execute(sql`
          UPDATE gp_namuna9_demand_lines AS t
          SET paid_paise = t.paid_paise - v.amount_paise,
              updated_at = ${sqlDate(now)}
          FROM (
            SELECT UNNEST(${sqlUuidArray(demandLineIds)}) AS demand_line_id,
                   UNNEST(${sqlBigintArray(amounts)}) AS amount_paise
          ) AS v
          WHERE t.id = v.demand_line_id
        `)

        const n05VoidEntries = buildN05Entries({
          mode: 'void',
          gpId,
          entryDate: indiaDateString(now),
          fiscalYear: currentFiscalYear(now),
          fyMonthNo: fyMonthNo(now),
          descriptionBase: `N10 void ${receipt.receipt_no}`,
          sourceType: 'namuna10_void',
          sourceId: receipt.id,
          lines: rows.map((row) => {
            if (!isTaxHead(row.tax_head)) {
              throw new ApiError(500, `Tax head missing for demand line ${row.demand_line_id}`)
            }
            return {
              accountHead: accountHeadForTaxHead(row.tax_head),
              amountPaise: asNumber(row.amount_paise),
              sourceLineId: row.receipt_line_id,
            }
          }),
          adjustments: {
            discountPaise: asNumber(receipt.discount_paise),
            lateFeePaise: asNumber(receipt.late_fee_paise),
            noticeFeePaise: asNumber(receipt.notice_fee_paise),
            otherPaise: asNumber(receipt.other_paise),
          },
          createdBy: actorId,
        })

        if (n05VoidEntries.length > 0) {
          await tx.insert(gpNamuna05CashbookEntries).values(n05VoidEntries)
        }
      } else {
        const [totalCount] = await tx.execute<{ total: number }>(sql`
          SELECT COUNT(*)::int AS total
          FROM gp_namuna10_receipt_lines
          WHERE receipt_id = ${receiptId}
            AND water_demand_line_id IS NOT NULL
        `)

        const rows = await tx.execute<VoidWaterReceiptLineRow>(sql`
          SELECT
            rl.id AS receipt_line_id,
            rl.water_demand_line_id,
            rl.amount_paise,
            wdl.paid_paise
          FROM gp_namuna10_receipt_lines rl
          JOIN gp_water_connection_demand_lines wdl ON wdl.id = rl.water_demand_line_id
          JOIN gp_water_connection_demands wd ON wd.id = wdl.demand_id
          WHERE rl.receipt_id = ${receiptId}
            AND wd.gp_id = ${gpId}
          FOR UPDATE OF wdl
        `)

        if (rows.length === 0) throw new ApiError(409, 'Receipt has no reversible lines')
        if (rows.length !== totalCount?.total) {
          throw new ApiError(
            409,
            `Partial reversal detected: receipt has ${totalCount?.total} lines but only ${rows.length} are reversible. Data integrity violation — void aborted.`
          )
        }

        for (const row of rows) {
          const amountPaise = asNumber(row.amount_paise)
          const paidPaise = asNumber(row.paid_paise)
          if (paidPaise < amountPaise) {
            throw new ApiError(
              409,
              `Cannot void receipt: water demand line ${row.water_demand_line_id} has paid_paise ${paidPaise}, below reversal amount ${amountPaise}`
            )
          }
        }

        const waterDemandLineIds = rows.map((row) => row.water_demand_line_id)
        const amounts = rows.map((row) => asNumber(row.amount_paise))

        await tx.execute(sql`
          UPDATE gp_water_connection_demand_lines AS t
          SET paid_paise = t.paid_paise - v.amount_paise,
              updated_at = ${sqlDate(now)}
          FROM (
            SELECT UNNEST(${sqlUuidArray(waterDemandLineIds)}) AS water_demand_line_id,
                   UNNEST(${sqlBigintArray(amounts)}) AS amount_paise
          ) AS v
          WHERE t.id = v.water_demand_line_id
        `)

        const n05VoidEntries = buildN05Entries({
          mode: 'void',
          gpId,
          entryDate: indiaDateString(now),
          fiscalYear: currentFiscalYear(now),
          fyMonthNo: fyMonthNo(now),
          descriptionBase: `N10 void ${receipt.receipt_no}`,
          sourceType: 'namuna10_void',
          sourceId: receipt.id,
          lines: rows.map((row) => ({
            accountHead: 'water_tax',
            amountPaise: asNumber(row.amount_paise),
            sourceLineId: row.receipt_line_id,
          })),
          adjustments: {
            discountPaise: asNumber(receipt.discount_paise),
            lateFeePaise: asNumber(receipt.late_fee_paise),
            noticeFeePaise: asNumber(receipt.notice_fee_paise),
            otherPaise: asNumber(receipt.other_paise),
          },
          createdBy: actorId,
        })

        if (n05VoidEntries.length > 0) {
          await tx.insert(gpNamuna05CashbookEntries).values(n05VoidEntries)
        }
      }

      await tx
        .update(gpNamuna10Receipts)
        .set({
          isVoid: true,
          voidedAt: now,
          voidedBy: actorId,
          voidReason: reason,
          updatedAt: now,
        })
        .where(eq(gpNamuna10Receipts.id, receiptId))
    })

    return namuna10Service.getById(gpId, receiptId)
  },
}
