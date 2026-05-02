import type { TaxHead, GpAccountHead } from './heads'

export type TaxHeadLabelContext = 'n08' | 'n09' | 'bill' | 'report'

export const TAX_HEAD_LABELS: Record<TaxHead, Record<TaxHeadLabelContext, string>> = {
  house: {
    n08: 'घरपट्टी',
    n09: 'घरपट्टी',
    bill: 'घरपट्टी कर',
    report: 'घरपट्टी कर',
  },
  lighting: {
    n08: 'दिवाबत्ती',
    n09: 'दिवाबत्ती',
    bill: 'दिवाबत्ती कर',
    report: 'दिवाबत्ती कर',
  },
  sanitation: {
    n08: 'आरोग्य',
    n09: 'सफाईपट्टी',
    bill: 'ज. सफाई कर',
    report: 'आरोग्य कर',
  },
}

export function taxHeadLabel(taxHead: TaxHead, context: TaxHeadLabelContext): string {
  return TAX_HEAD_LABELS[taxHead][context]
}

export const ACCOUNT_HEAD_LABELS: Record<GpAccountHead, string> = {
  property_tax_house:      'घरपट्टी',
  property_tax_lighting:   'दिवाबत्ती',
  property_tax_sanitation: 'सफाईपट्टी',
  water_tax:               'पाणीकर',
  discount:                'सवलत',
  late_fee:                'विलंब शुल्क',
  notice_fee:              'नोटीस शुल्क',
  other:                   'इतर',
}

export function accountHeadLabel(head: GpAccountHead): string {
  return ACCOUNT_HEAD_LABELS[head]
}

export const FY_MONTH_OPTIONS = [
  { no: 1,  mr: 'एप्रिल',    en: 'April' },
  { no: 2,  mr: 'मे',        en: 'May' },
  { no: 3,  mr: 'जून',       en: 'June' },
  { no: 4,  mr: 'जुलै',      en: 'July' },
  { no: 5,  mr: 'ऑगस्ट',    en: 'August' },
  { no: 6,  mr: 'सप्टेंबर',  en: 'September' },
  { no: 7,  mr: 'ऑक्टोबर',  en: 'October' },
  { no: 8,  mr: 'नोव्हेंबर', en: 'November' },
  { no: 9,  mr: 'डिसेंबर',   en: 'December' },
  { no: 10, mr: 'जानेवारी',  en: 'January' },
  { no: 11, mr: 'फेब्रुवारी', en: 'February' },
  { no: 12, mr: 'मार्च',     en: 'March' },
] as const
