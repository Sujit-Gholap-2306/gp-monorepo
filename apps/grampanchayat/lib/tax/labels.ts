import type { TaxHead } from './heads'

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
  water: {
    n08: 'पाणीपट्टी',
    n09: 'पाणीपट्टी',
    bill: 'पाणीपट्टी कर',
    report: 'पाणीपट्टी कर',
  },
}

export function taxHeadLabel(taxHead: TaxHead, context: TaxHeadLabelContext): string {
  return TAX_HEAD_LABELS[taxHead][context]
}

