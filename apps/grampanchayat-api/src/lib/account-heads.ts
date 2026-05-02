import type { TaxHead } from './tax-head.ts'

export const GP_ACCOUNT_HEADS = [
  'property_tax_house',
  'property_tax_lighting',
  'property_tax_sanitation',
  'water_tax',
  'discount',
  'late_fee',
  'notice_fee',
  'other',
] as const

export type GpAccountHead = (typeof GP_ACCOUNT_HEADS)[number]

export const TAX_HEAD_TO_ACCOUNT_HEAD: Record<'house' | 'lighting' | 'sanitation', GpAccountHead> = {
  house:      'property_tax_house',
  lighting:   'property_tax_lighting',
  sanitation: 'property_tax_sanitation',
}

// TODO: confirm exact ledger codes with district-level accounting sheet if they differ by GP.
export const ACCOUNT_HEAD_LEDGER_CODE: Record<GpAccountHead, string> = {
  property_tax_house:      '0035-101',
  property_tax_lighting:   '0035-102',
  property_tax_sanitation: '0035-103',
  water_tax:               '0035-105',
  discount:                '0035-901',
  late_fee:                '0035-902',
  notice_fee:              '0035-903',
  other:                   '0035-904',
}

export function accountHeadForTaxHead(taxHead: TaxHead): GpAccountHead {
  return TAX_HEAD_TO_ACCOUNT_HEAD[taxHead]
}

export function ledgerCodeForAccountHead(accountHead: GpAccountHead): string {
  return ACCOUNT_HEAD_LEDGER_CODE[accountHead]
}
