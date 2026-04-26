import ExcelJS from 'exceljs'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import { gpNamuna9DemandLines, gpNamuna9Demands, gpProperties } from '../db/schema/index.ts'
import { MASTERS_BULK_MAX_FILE_MB } from '../types/masters-bulk-template.meta.ts'
import { MAX_DATA_ROWS } from '../lib/spreadsheet.ts'
import { currentFiscalYear } from '../lib/fiscal.ts'
import { TAX_HEADS, type TaxHead } from '../lib/tax-head.ts'
import { NAMUNA9_OPENING_TEMPLATE_COLUMNS } from '../types/namuna9-opening.dto.ts'

function toBuffer(buf: ArrayBuffer | Buffer): Buffer {
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
}

function paiseToRupees(value: number): string {
  return (value / 100).toFixed(2)
}

export type Namuna9OpeningTemplateMode = 'blank' | 'properties'

type BuildTemplateArgs = {
  mode: Namuna9OpeningTemplateMode
  gpId?: string
  fiscalYear?: string
}

type ImportableProperty = {
  propertyNo: string
  currentByHead: Record<TaxHead, number>
}

type SkippedProperty = {
  propertyNo: string
  reason: string
}

async function loadImportablePropertiesForFiscalYear(
  gpId: string,
  fiscalYear: string
): Promise<{ rows: ImportableProperty[]; skipped: SkippedProperty[] }> {
  const properties = await db
    .select({
      id: gpProperties.id,
      propertyNo: gpProperties.propertyNo,
    })
    .from(gpProperties)
    .where(eq(gpProperties.gpId, gpId))
    .orderBy(asc(gpProperties.propertyNo))

  if (properties.length === 0) {
    throw new ApiError(422, 'No properties found for this GP. Upload properties first or use blank template.')
  }
  if (properties.length > MAX_DATA_ROWS) {
    throw new ApiError(
      422,
      `Properties template would create ${String(properties.length)} rows; max is ${String(MAX_DATA_ROWS)}. Split by ward and upload in batches.`
    )
  }

  const propertyIds = properties.map((row) => row.id)
  const headers = await db
    .select({
      id: gpNamuna9Demands.id,
      propertyId: gpNamuna9Demands.propertyId,
    })
    .from(gpNamuna9Demands)
    .where(
      and(
        eq(gpNamuna9Demands.gpId, gpId),
        eq(gpNamuna9Demands.fiscalYear, fiscalYear),
        inArray(gpNamuna9Demands.propertyId, propertyIds)
      )
    )

  if (headers.length === 0) {
    throw new ApiError(
      422,
      `N09 demands not yet generated for ${fiscalYear}. Run N09 generate first, then download the properties template.`
    )
  }

  const demandIdByPropertyId = new Map(headers.map((row) => [row.propertyId, row.id]))
  const demandIds = headers.map((row) => row.id)
  const lines = demandIds.length === 0
    ? []
    : await db
      .select({
        demandId: gpNamuna9DemandLines.demandId,
        taxHead: gpNamuna9DemandLines.taxHead,
        currentPaise: gpNamuna9DemandLines.currentPaise,
      })
      .from(gpNamuna9DemandLines)
      .where(inArray(gpNamuna9DemandLines.demandId, demandIds))

  const currentByDemandAndHead = new Map<string, Map<TaxHead, number>>()
  for (const line of lines) {
    if (!TAX_HEADS.includes(line.taxHead as TaxHead)) continue
    const head = line.taxHead as TaxHead
    let byHead = currentByDemandAndHead.get(line.demandId)
    if (!byHead) {
      byHead = new Map<TaxHead, number>()
      currentByDemandAndHead.set(line.demandId, byHead)
    }
    byHead.set(head, line.currentPaise)
  }

  const rows: ImportableProperty[] = []
  const skipped: SkippedProperty[] = []
  for (const property of properties) {
    const demandId = demandIdByPropertyId.get(property.id)
    if (!demandId) {
      skipped.push({
        propertyNo: property.propertyNo,
        reason: `N09 demand not generated for ${fiscalYear}. Run N09 generate first.`,
      })
      continue
    }
    const byHead = currentByDemandAndHead.get(demandId) ?? new Map<TaxHead, number>()
    const missing = TAX_HEADS.filter((head) => !byHead.has(head))
    if (missing.length > 0) {
      skipped.push({
        propertyNo: property.propertyNo,
        reason: `N09 demand lines missing for: ${missing.join(', ')}`,
      })
      continue
    }

    rows.push({
      propertyNo: property.propertyNo,
      currentByHead: {
        house: byHead.get('house') ?? 0,
        lighting: byHead.get('lighting') ?? 0,
        sanitation: byHead.get('sanitation') ?? 0,
        water: byHead.get('water') ?? 0,
      },
    })
  }

  return { rows, skipped }
}

function pushOpeningHeader(ws: ExcelJS.Worksheet) {
  const headers = NAMUNA9_OPENING_TEMPLATE_COLUMNS.map((c) => c.key)
  ws.addRow(headers)
  ws.getRow(1).font = { bold: true }
  ws.columns = headers.map((h) => ({ width: Math.min(40, Math.max(18, h.length + 2)) }))
}

export const namuna9OpeningTemplateService = {
  async buildTemplateXlsx({ mode, gpId, fiscalYear }: BuildTemplateArgs): Promise<Buffer> {
    const targetFiscalYear = fiscalYear ?? currentFiscalYear()
    const wb = new ExcelJS.Workbook()
    wb.creator = 'grampanchayat-api'

    const data = wb.addWorksheet('Opening_balances', { views: [{ state: 'frozen', ySplit: 1 }] })
    pushOpeningHeader(data)

    let skipped: SkippedProperty[] = []

    if (mode === 'properties') {
      if (!gpId) {
        throw new ApiError(500, 'gpId is required for properties template')
      }

      const loaded = await loadImportablePropertiesForFiscalYear(gpId, targetFiscalYear)
      skipped = loaded.skipped

      for (const row of loaded.rows) {
        data.addRow([
          row.propertyNo,
          '0',
          paiseToRupees(row.currentByHead.house),
          paiseToRupees(row.currentByHead.house),
          '0',
          paiseToRupees(row.currentByHead.lighting),
          paiseToRupees(row.currentByHead.lighting),
          '0',
          paiseToRupees(row.currentByHead.sanitation),
          paiseToRupees(row.currentByHead.sanitation),
          '0',
          paiseToRupees(row.currentByHead.water),
          paiseToRupees(row.currentByHead.water),
        ])
      }
    } else {
      // Sample row in one-row-per-property format.
      data.addRow([
        'P-101',
        '600.00',
        '918.00',
        '1518.00',
        '0',
        '25.00',
        '25.00',
        '0',
        '25.00',
        '25.00',
        '0',
        '360.00',
        '360.00',
      ])
    }

    if (skipped.length > 0) {
      const skippedSheet = wb.addWorksheet('not_importable')
      skippedSheet.addRow(['property_no', 'reason'])
      skippedSheet.getRow(1).font = { bold: true }
      for (const item of skipped) skippedSheet.addRow([item.propertyNo, item.reason])
      skippedSheet.columns = [{ width: 22 }, { width: 88 }]
    }

    const guide = wb.addWorksheet('Column_guide')
    guide.addRow(['Column', 'Required', 'Rules'])
    guide.getRow(1).font = { bold: true }
    guide.addRow([
      'Upload limits',
      '',
      `Max ${String(MAX_DATA_ROWS)} data rows, ${String(MASTERS_BULK_MAX_FILE_MB)} MB. One row per property.`,
    ])
    guide.addRow([
      'Fiscal year',
      '',
      `Template fiscal year: ${targetFiscalYear}.`,
    ])
    guide.addRow([
      'Template mode',
      '',
      mode === 'properties'
        ? 'Prefilled only with properties that already have N09 demand for selected FY.'
        : 'Blank + sample row. Fill property_no manually.',
    ])
    guide.addRow([
      'Upload behavior',
      '',
      'Backend updates only arrears columns into N09 previous amounts. Demand/total columns are ignored (reference only).',
    ])
    guide.addRow([
      'Payment note',
      '',
      'Paid collection must be entered via N10 receipt flow/bulk.',
    ])
    for (const col of NAMUNA9_OPENING_TEMPLATE_COLUMNS) {
      guide.addRow([col.key, col.required ? 'Yes' : 'No', col.hint])
    }
    guide.columns = [{ width: 34 }, { width: 10 }, { width: 90 }]

    const raw = await wb.xlsx.writeBuffer()
    return toBuffer(raw as ArrayBuffer | Buffer)
  },
}
