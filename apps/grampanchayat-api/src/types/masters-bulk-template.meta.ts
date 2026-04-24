/**
 * API response shape for GET /masters/template-meta.
 * Column lists come from `masters-bulk.dto.ts` (CITIZEN_IMPORT_FIELDS / PROPERTY_IMPORT_FIELDS) — one source with Zod.
 */
import {
  AGE_BRACKETS,
  CITIZENS_TEMPLATE_COLUMNS,
  PROPERTIES_TEMPLATE_COLUMNS,
  PROPERTY_TYPE_RATES_TEMPLATE_COLUMNS,
  PROPERTY_TYPES,
} from './masters-bulk.dto.ts'
import { MAX_DATA_ROWS, MAX_PROPERTY_TYPE_RATE_ROWS } from '../lib/spreadsheet.ts'

export const MASTERS_BULK_MAX_FILE_MB = 2

export function mastersBulkMaxRows(): number {
  return MAX_DATA_ROWS
}

export type MastersTemplateMetaResponse = {
  limits: { maxRows: number; maxFileMb: number }
  citizens: { columns: typeof CITIZENS_TEMPLATE_COLUMNS }
  properties: { columns: typeof PROPERTIES_TEMPLATE_COLUMNS }
  propertyTypeRates: { columns: typeof PROPERTY_TYPE_RATES_TEMPLATE_COLUMNS; maxRows: number }
  allowed: { propertyTypes: string[]; ageBrackets: string[] }
}

export function getMastersTemplateMetaPayload(): MastersTemplateMetaResponse {
  return {
    limits: {
      maxRows:   MAX_DATA_ROWS,
      maxFileMb: MASTERS_BULK_MAX_FILE_MB,
    },
    citizens:   { columns: CITIZENS_TEMPLATE_COLUMNS },
    properties: { columns: PROPERTIES_TEMPLATE_COLUMNS },
    propertyTypeRates: {
      columns: PROPERTY_TYPE_RATES_TEMPLATE_COLUMNS,
      maxRows: MAX_PROPERTY_TYPE_RATE_ROWS,
    },
    allowed:    { propertyTypes: [...PROPERTY_TYPES], ageBrackets: [...AGE_BRACKETS] },
  }
}
