import ExcelJS from 'exceljs'
import { ApiError } from '../common/exceptions/http.exception.ts'

export const MAX_DATA_ROWS = 2000

function normalizeHeader(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

function cellToString(v: unknown): string {
  if (v == null) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (typeof v === 'object' && v !== null && 'text' in (v as object)) {
    return String((v as { text?: string }).text ?? '')
  }
  if (typeof v === 'object' && v !== null && 'result' in (v as object)) {
    return String((v as { result?: unknown }).result ?? '')
  }
  return String(v).trim()
}

export async function parseXlsxBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
  const wb  = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer as any)
  const sheet = wb.worksheets[0]
  if (!sheet) return []

  const headerRow = sheet.getRow(1)
  const headers: string[] = []
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = normalizeHeader(cellToString(cell.value))
  })
  while (headers.length > 0 && !headers[headers.length - 1]) {
    headers.pop()
  }
  if (headers.length === 0) return []

  const out: Record<string, string>[] = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const obj: Record<string, string> = {}
    let any   = false
    for (let c = 1; c <= headers.length; c++) {
      const h = headers[c - 1]
      if (!h) continue
      const cell  = row.getCell(c)
      const s     = cellToString(cell.value)
      if (s) any = true
      obj[h] = s
    }
    if (any) out.push(obj)
  })
  return out
}

export async function parseImportBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
  try {
    return await parseXlsxBuffer(buffer)
  } catch (e) {
    if (e instanceof ApiError) throw e
    throw new ApiError(400, e instanceof Error ? e.message : 'Failed to parse file')
  }
}

export function assertRowCap(rows: Record<string, string>[]) {
  if (rows.length > MAX_DATA_ROWS) {
    throw new ApiError(
      400,
      `File has ${String(rows.length)} data rows; maximum is ${String(MAX_DATA_ROWS)}`
    )
  }
  if (rows.length === 0) {
    throw new ApiError(400, 'No data rows after header')
  }
}

/** One row per property type — max 5 (same as enum size). */
export const MAX_PROPERTY_TYPE_RATE_ROWS = 5

export function assertPropertyTypeRateRowCap(rows: Record<string, string>[]) {
  if (rows.length === 0) {
    throw new ApiError(400, 'No data rows after header')
  }
  if (rows.length > MAX_PROPERTY_TYPE_RATE_ROWS) {
    throw new ApiError(
      400,
      `File has ${String(rows.length)} data rows; property tax rates need at most ${String(MAX_PROPERTY_TYPE_RATE_ROWS)} (one per property type).`
    )
  }
}
