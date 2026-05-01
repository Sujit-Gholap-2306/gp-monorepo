import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import {
  parseXlsxBuffer,
  parseImportBuffer,
  assertRowCap,
  MAX_DATA_ROWS,
  assertPropertyTypeRateRowCap,
  MAX_PROPERTY_TYPE_RATE_ROWS,
} from '../../src/lib/spreadsheet.ts'
import { ApiError } from '../../src/common/exceptions/http.exception.ts'

async function makeXlsxBuffer(rows: unknown[][]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Sheet1')
  for (const row of rows) sheet.addRow(row)
  const out = await wb.xlsx.writeBuffer()
  return Buffer.isBuffer(out) ? out : Buffer.from(out as ArrayBuffer)
}

describe('parseXlsxBuffer', () => {
  it('normalizes headers and skips fully-empty rows', async () => {
    const buffer = await makeXlsxBuffer([
      [' Name ', 'House No.', 'A/B'],
      ['Alice', 101, 'x'],
      ['', '', ''],
      ['Bob', '', ' y '],
    ])
    const rows = await parseXlsxBuffer(buffer)
    expect(rows).toEqual([
      { name: 'Alice', house_no: '101', ab: 'x' },
      { name: 'Bob', house_no: '', ab: 'y' },
    ])
  })

  it('returns empty for sheet with only blank header row', async () => {
    const buffer = await makeXlsxBuffer([['', '', '']])
    await expect(parseXlsxBuffer(buffer)).resolves.toEqual([])
  })
})

describe('parseImportBuffer', () => {
  it('wraps parser errors as ApiError(400)', async () => {
    const invalid = Buffer.from('not-an-xlsx')
    await expect(parseImportBuffer(invalid)).rejects.toBeInstanceOf(ApiError)
    await expect(parseImportBuffer(invalid)).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('assertRowCap', () => {
  it('throws when zero data rows', () => {
    expect(() => assertRowCap([])).toThrow('No data rows after header')
  })

  it('throws when row count exceeds max', () => {
    const rows = Array.from({ length: MAX_DATA_ROWS + 1 }, () => ({ a: '1' }))
    expect(() => assertRowCap(rows)).toThrow(String(MAX_DATA_ROWS))
  })

  it('passes for valid row counts including exact max', () => {
    expect(() => assertRowCap([{ a: '1' }])).not.toThrow()
    const rows = Array.from({ length: MAX_DATA_ROWS }, () => ({ a: '1' }))
    expect(() => assertRowCap(rows)).not.toThrow()
  })
})

describe('assertPropertyTypeRateRowCap', () => {
  it('throws when zero data rows', () => {
    expect(() => assertPropertyTypeRateRowCap([])).toThrow('No data rows after header')
  })

  it('throws when row count exceeds property type cap', () => {
    const rows = Array.from({ length: MAX_PROPERTY_TYPE_RATE_ROWS + 1 }, () => ({ a: '1' }))
    expect(() => assertPropertyTypeRateRowCap(rows)).toThrow(String(MAX_PROPERTY_TYPE_RATE_ROWS))
  })

  it('passes for valid row counts including exact max', () => {
    expect(() => assertPropertyTypeRateRowCap([{ a: '1' }])).not.toThrow()
    const rows = Array.from({ length: MAX_PROPERTY_TYPE_RATE_ROWS }, () => ({ a: '1' }))
    expect(() => assertPropertyTypeRateRowCap(rows)).not.toThrow()
  })
})
