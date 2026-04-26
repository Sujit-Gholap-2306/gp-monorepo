import type { Namuna9Demand, Namuna9DemandLine, Namuna9Status } from '@/lib/api/namuna9'
import type { TaxHead } from '@/lib/tax/heads'

export function rupeesFromPaise(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export const NAMUNA9_STATUS_LABELS_MR: Record<Namuna9Status, string> = {
  pending: 'बाकी',
  partial: 'अंशतः भरले',
  paid: 'पूर्ण',
}

export const NAMUNA9_STATUS_CLASSES: Record<Namuna9Status, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  partial: 'border-sky-200 bg-sky-50 text-sky-800',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

export function getNamuna9LineByHead(
  demand: Namuna9Demand,
  taxHead: TaxHead
): Namuna9DemandLine {
  return demand.lines.find((line) => line.taxHead === taxHead) ?? {
    taxHead,
    previousPaise: 0,
    currentPaise: 0,
    paidPaise: 0,
    totalDuePaise: 0,
    status: 'paid',
  }
}
