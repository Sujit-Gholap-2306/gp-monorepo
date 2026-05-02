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
