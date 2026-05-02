import ExcelJS from 'exceljs'
import { and, asc, eq } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import {
  gpCitizens,
  gpWaterConnectionDemandLines,
  gpWaterConnectionDemands,
  gpWaterConnections,
} from '../db/schema/index.ts'
import { currentFiscalYear } from '../lib/fiscal.ts'
import { MAX_DATA_ROWS } from '../lib/spreadsheet.ts'
import { MASTERS_BULK_MAX_FILE_MB } from '../types/masters-bulk-template.meta.ts'
import { WATER_DEMAND_ARREARS_TEMPLATE_COLUMNS } from '../types/water-demand-arrears.dto.ts'

type BuildTemplateArgs = {
  gpId: string
  fiscalYear?: string
}

function toBuffer(buf: ArrayBuffer | Buffer): Buffer {
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
}

function pushHeader(ws: ExcelJS.Worksheet) {
  const headers = WATER_DEMAND_ARREARS_TEMPLATE_COLUMNS.map((c) => c.key)
  ws.addRow(headers)
  ws.getRow(1).font = { bold: true }
  ws.columns = headers.map((h) => ({ width: Math.min(40, Math.max(18, h.length + 2)) }))
}

function displayCitizenName(nameMr: string, nameEn: string | null): string {
  return nameMr || nameEn || ''
}

export const waterDemandArrearsTemplateService = {
  async buildTemplateXlsx({ gpId, fiscalYear }: BuildTemplateArgs): Promise<Buffer> {
    const targetFiscalYear = fiscalYear ?? currentFiscalYear()

    const rows = await db
      .select({
        consumerNo: gpWaterConnections.consumerNo,
        citizenNo: gpCitizens.citizenNo,
        citizenNameMr: gpCitizens.nameMr,
        citizenNameEn: gpCitizens.nameEn,
        connectionType: gpWaterConnections.connectionType,
        pipeSizeMm: gpWaterConnections.pipeSizeMm,
        currentPaise: gpWaterConnectionDemandLines.currentPaise,
        previousPaise: gpWaterConnectionDemandLines.previousPaise,
        totalDuePaise: gpWaterConnectionDemandLines.totalDuePaise,
      })
      .from(gpWaterConnectionDemands)
      .innerJoin(
        gpWaterConnections,
        eq(gpWaterConnectionDemands.waterConnectionId, gpWaterConnections.id)
      )
      .innerJoin(gpCitizens, eq(gpWaterConnections.citizenId, gpCitizens.id))
      .innerJoin(
        gpWaterConnectionDemandLines,
        eq(gpWaterConnectionDemandLines.demandId, gpWaterConnectionDemands.id)
      )
      .where(
        and(
          eq(gpWaterConnectionDemands.gpId, gpId),
          eq(gpWaterConnectionDemands.fiscalYear, targetFiscalYear)
        )
      )
      .orderBy(asc(gpWaterConnections.consumerNo))

    if (rows.length === 0) {
      throw new ApiError(
        422,
        `Water demands not found for ${targetFiscalYear}. Run water demand generate first.`
      )
    }
    if (rows.length > MAX_DATA_ROWS) {
      throw new ApiError(
        422,
        `Template would create ${String(rows.length)} rows; max is ${String(MAX_DATA_ROWS)}. Split and import in batches.`
      )
    }

    const wb = new ExcelJS.Workbook()
    wb.creator = 'grampanchayat-api'
    const data = wb.addWorksheet('Water_opening_arrears', { views: [{ state: 'frozen', ySplit: 1 }] })
    pushHeader(data)

    for (const row of rows) {
      data.addRow([
        row.consumerNo,
        String(row.citizenNo),
        displayCitizenName(row.citizenNameMr, row.citizenNameEn),
        row.connectionType,
        String(row.pipeSizeMm),
        String(row.currentPaise),
        String(row.previousPaise),
        String(row.totalDuePaise ?? row.previousPaise + row.currentPaise),
      ])
    }

    const guide = wb.addWorksheet('Column_guide')
    guide.addRow(['Column', 'Required', 'Rules'])
    guide.getRow(1).font = { bold: true }
    guide.addRow([
      'Upload limits',
      '',
      `Max ${String(MAX_DATA_ROWS)} rows, ${String(MASTERS_BULK_MAX_FILE_MB)} MB.`,
    ])
    guide.addRow(['Fiscal year', '', `Template fiscal year: ${targetFiscalYear}.`])
    guide.addRow([
      'Upload behavior',
      '',
      'Backend updates only previous_paise on existing current-FY water demand lines.',
    ])
    guide.addRow([
      'Identity checks',
      '',
      'consumer_no must exist and citizen_no/citizen_name/connection_type/pipe_size_mm must match.',
    ])
    guide.addRow([
      'Payment note',
      '',
      'paid_paise is not imported here; water collection must happen via water N10 receipts.',
    ])
    for (const col of WATER_DEMAND_ARREARS_TEMPLATE_COLUMNS) {
      guide.addRow([col.key, col.required ? 'Yes' : 'No', col.hint])
    }
    guide.columns = [{ width: 30 }, { width: 10 }, { width: 100 }]

    const raw = await wb.xlsx.writeBuffer()
    return toBuffer(raw as ArrayBuffer | Buffer)
  },
}
