export const TAX_HEADS = [
  'house',
  'lighting',
  'sanitation',
] as const

export type TaxHead = (typeof TAX_HEADS)[number]

const TAX_HEAD_SET = new Set<string>(TAX_HEADS)

export function isTaxHead(value: string): value is TaxHead {
  return TAX_HEAD_SET.has(value)
}

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

const GP_ACCOUNT_HEAD_SET = new Set<string>(GP_ACCOUNT_HEADS)

export function isAccountHead(value: string): value is GpAccountHead {
  return GP_ACCOUNT_HEAD_SET.has(value)
}
