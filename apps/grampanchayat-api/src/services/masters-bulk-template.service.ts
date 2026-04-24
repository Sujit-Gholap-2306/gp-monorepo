import ExcelJS from 'exceljs'
import { MAX_DATA_ROWS } from '../lib/spreadsheet.ts'
import {
  CITIZENS_TEMPLATE_COLUMNS,
  PROPERTIES_TEMPLATE_COLUMNS,
  PROPERTY_TYPES,
  PROPERTY_TYPE_RATES_TEMPLATE_COLUMNS,
} from '../types/masters-bulk.dto.ts'
import { MASTERS_BULK_MAX_FILE_MB } from '../types/masters-bulk-template.meta.ts'

function toBuffer(buf: ArrayBuffer | Buffer): Buffer {
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
}

async function buildWorkbook(
  dataSheetName: string,
  columns: ReadonlyArray<{ key: string; required: boolean; hint: string }>,
  guideIntro: string
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'grampanchayat-api'

  const data = wb.addWorksheet(dataSheetName, { views: [{ state: 'frozen', ySplit: 1 }] })
  const headers = columns.map((c) => c.key)
  data.addRow(headers)
  data.getRow(1).font = { bold: true }
  data.columns = headers.map((h) => ({ width: Math.min(40, Math.max(14, h.length + 4)) }))

  const guide = wb.addWorksheet('Column_guide')
  guide.addRow(['Column', 'Required', 'Rules'])
  guide.getRow(1).font = { bold: true }
  guide.addRow(['Upload limits', '', guideIntro])
  for (const c of columns) {
    guide.addRow([c.key, c.required ? 'Yes' : 'No', c.hint])
  }
  guide.columns = [{ width: 22 }, { width: 10 }, { width: 80 }]

  const raw = await wb.xlsx.writeBuffer()
  return toBuffer(raw as ArrayBuffer | Buffer)
}

export const mastersBulkTemplateService = {
  async buildCitizensTemplateXlsx(): Promise<Buffer> {
    const intro =
      `Max ${String(MAX_DATA_ROWS)} data rows, ${String(MASTERS_BULK_MAX_FILE_MB)} MB per upload. ` +
      'Use the first sheet for data (row 1 = headers). Column_guide is for reference only — you may delete that sheet before uploading if your Excel version complains.'

    return buildWorkbook('Citizens', CITIZENS_TEMPLATE_COLUMNS, intro)
  },

  async buildPropertiesTemplateXlsx(): Promise<Buffer> {
    const intro =
      `Max ${String(MAX_DATA_ROWS)} data rows, ${String(MASTERS_BULK_MAX_FILE_MB)} MB. Import citizens first. ` +
      'owner_citizen_no must match a citizen_no from the citizens import for this GP. See property_type and age_bracket codes.'

    return buildWorkbook('Properties', PROPERTIES_TEMPLATE_COLUMNS, intro)
  },

  async buildPropertyTypeRatesTemplateXlsx(): Promise<Buffer> {
    const types = [...PROPERTY_TYPES].join(', ')
    const intro =
      `Up to 5 data rows, one per property_type within: ${types}. ` +
      `Max ${String(MASTERS_BULK_MAX_FILE_MB)} MB. Numbers ≥ 0; empty cell = no value.`

    return buildWorkbook('Property_tax_rates', PROPERTY_TYPE_RATES_TEMPLATE_COLUMNS, intro)
  },
}
