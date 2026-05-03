export const PIPE_SIZE_LABELS: Record<number, string> = {
  1.0: '१ इंच',
  1.5: '१.५ इंच',
  2.0: '२ इंच',
  2.5: '२.५ इंच',
}

export const TAX_HEAD_LABELS: Record<string, string> = {
  house: 'घरपट्टी',
  lighting: 'दिवाबत्ती',
  sanitation: 'स्वच्छता',
}

export const ACCOUNT_HEAD_LABELS: Record<string, string> = {
  property_tax_house: 'घरपट्टी',
  property_tax_lighting: 'दिवाबत्ती',
  property_tax_sanitation: 'स्वच्छता',
  water_tax: 'पाणी कर',
  discount: 'सूट',
  late_fee: 'विलंब शुल्क',
  notice_fee: 'नोटीस फी',
  other: 'इतर',
}

export const FY_MONTH_OPTIONS = [
  { no: 1, mr: 'एप्रिल' },
  { no: 2, mr: 'मे' },
  { no: 3, mr: 'जून' },
  { no: 4, mr: 'जुलै' },
  { no: 5, mr: 'ऑगस्ट' },
  { no: 6, mr: 'सप्टेंबर' },
  { no: 7, mr: 'ऑक्टोबर' },
  { no: 8, mr: 'नोव्हेंबर' },
  { no: 9, mr: 'डिसेंबर' },
  { no: 10, mr: 'जानेवारी' },
  { no: 11, mr: 'फेब्रुवारी' },
  { no: 12, mr: 'मार्च' },
] as const

export const WATER_CONNECTION_TYPE_LABELS: Record<string, string> = {
  regular: 'सामान्य',
  specialized: 'विशेष',
}

export const WATER_CONNECTION_STATUS_LABELS: Record<string, string> = {
  active: 'सक्रिय',
  disconnected: 'खंडित',
}

export function pipeSizeLabel(value: number): string {
  return PIPE_SIZE_LABELS[value] ?? `${value} इंच`
}

export function taxHeadLabel(value: string, _mode?: 'n09' | 'bill'): string {
  return TAX_HEAD_LABELS[value] ?? value
}

export function accountHeadLabel(value: string): string {
  return ACCOUNT_HEAD_LABELS[value] ?? value
}

export function waterConnectionTypeLabel(value: string): string {
  return WATER_CONNECTION_TYPE_LABELS[value] ?? value
}

export function waterConnectionStatusLabel(value: string): string {
  return WATER_CONNECTION_STATUS_LABELS[value] ?? value
}
