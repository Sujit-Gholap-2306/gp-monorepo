import type { Namuna9Demand } from '@/lib/api/namuna9'
import { TAX_HEADS, type TaxHead } from '@/lib/tax/heads'
import { taxHeadLabel } from '@/lib/tax/labels'
import {
  getNamuna9LineByHead,
  NAMUNA9_STATUS_LABELS_MR,
  rupeesFromPaise as rupees,
} from '@/lib/tax/format'

type Props = {
  items: Namuna9Demand[]
  tenantName: string
  fiscalYear: string
  reportDateLabel: string
}

function sumByHead(items: Namuna9Demand[], taxHead: TaxHead) {
  return items.reduce(
    (acc, demand) => {
      const row = getNamuna9LineByHead(demand, taxHead)
      return {
        previousPaise: acc.previousPaise + row.previousPaise,
        currentPaise: acc.currentPaise + row.currentPaise,
        totalPaise: acc.totalPaise + row.previousPaise + row.currentPaise,
      }
    },
    { previousPaise: 0, currentPaise: 0, totalPaise: 0 }
  )
}

export function Namuna9RegisterTable({
  items,
  tenantName,
  fiscalYear,
  reportDateLabel,
}: Props) {
  const totalsByHead = TAX_HEADS.map((head) => ({ head, totals: sumByHead(items, head) }))
  const totals = items.reduce(
    (acc, demand) => ({
      previousPaise: acc.previousPaise + demand.totals.previousPaise,
      currentPaise: acc.currentPaise + demand.totals.currentPaise,
      paidPaise: acc.paidPaise + demand.totals.paidPaise,
      totalDuePaise: acc.totalDuePaise + demand.totals.totalDuePaise,
    }),
    { previousPaise: 0, currentPaise: 0, paidPaise: 0, totalDuePaise: 0 }
  )

  return (
    <section className="overflow-hidden rounded-md border border-black bg-white">
      <header className="border-b border-black px-3 py-4 text-center">
        <p className="text-base font-semibold leading-tight">नमुना क्रमांक ९</p>
        <p className="text-xs leading-tight">कर मागणी नोंदवही</p>
        <p className="mt-0.5 text-sm font-semibold leading-tight">ग्रामपंचायत: {tenantName}</p>
        <p className="mt-1 text-xs text-slate-700">वर्ष: {fiscalYear} · दिनांक: {reportDateLabel}</p>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-[1680px] w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#f0f0f0]">
              <th rowSpan={2} className="border border-black px-1 py-1">अ.क्र.</th>
              <th rowSpan={2} className="border border-black px-2 py-1 text-left">मालमत्ता क्र.</th>
              <th rowSpan={2} className="border border-black px-2 py-1 text-left">मालक</th>
              <th rowSpan={2} className="border border-black px-2 py-1">वार्ड</th>
              {TAX_HEADS.map((head) => (
                <th key={head} colSpan={3} className="border border-black px-2 py-1">
                  {taxHeadLabel(head, 'n09')}
                </th>
              ))}
              <th rowSpan={2} className="border border-black px-2 py-1">मागील</th>
              <th rowSpan={2} className="border border-black px-2 py-1">चालू</th>
              <th rowSpan={2} className="border border-black px-2 py-1">वसुली</th>
              <th rowSpan={2} className="border border-black px-2 py-1">बाकी</th>
              <th rowSpan={2} className="border border-black px-2 py-1">स्थिती</th>
            </tr>
            <tr className="bg-[#f8f8f8]">
              {TAX_HEADS.flatMap((head) => ([
                <th key={`${head}-p`} className="border border-black px-2 py-1">मागील</th>,
                <th key={`${head}-c`} className="border border-black px-2 py-1">चालू</th>,
                <th key={`${head}-t`} className="border border-black px-2 py-1">एकूण</th>,
              ]))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={21} className="border border-black px-2 py-6 text-center text-slate-600">
                  नोंदी उपलब्ध नाहीत
                </td>
              </tr>
            ) : (
              items.map((demand, index) => (
                <tr key={demand.id}>
                  <td className="border border-black px-1 py-1 text-center">{index + 1}</td>
                  <td className="border border-black px-2 py-1">{demand.property.propertyNo}</td>
                  <td className="border border-black px-2 py-1">{demand.owner.nameMr}</td>
                  <td className="border border-black px-2 py-1 text-center">{demand.property.wardNumber || '—'}</td>
                  {TAX_HEADS.flatMap((head) => {
                    const row = getNamuna9LineByHead(demand, head)
                    return [
                      <td key={`${demand.id}-${head}-p`} className="border border-black px-2 py-1 text-right">
                        {rupees(row.previousPaise)}
                      </td>,
                      <td key={`${demand.id}-${head}-c`} className="border border-black px-2 py-1 text-right">
                        {rupees(row.currentPaise)}
                      </td>,
                      <td key={`${demand.id}-${head}-t`} className="border border-black px-2 py-1 text-right">
                        {rupees(row.previousPaise + row.currentPaise)}
                      </td>,
                    ]
                  })}
                  <td className="border border-black px-2 py-1 text-right">{rupees(demand.totals.previousPaise)}</td>
                  <td className="border border-black px-2 py-1 text-right">{rupees(demand.totals.currentPaise)}</td>
                  <td className="border border-black px-2 py-1 text-right">{rupees(demand.totals.paidPaise)}</td>
                  <td className="border border-black px-2 py-1 text-right font-semibold">{rupees(demand.totals.totalDuePaise)}</td>
                  <td className="border border-black px-2 py-1 text-center">{NAMUNA9_STATUS_LABELS_MR[demand.status]}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#f5f5f5] font-semibold">
              <td colSpan={4} className="border border-black px-2 py-1 text-right">एकूण</td>
              {totalsByHead.flatMap(({ head, totals: byHead }) => ([
                <td key={`${head}-sum-p`} className="border border-black px-2 py-1 text-right">{rupees(byHead.previousPaise)}</td>,
                <td key={`${head}-sum-c`} className="border border-black px-2 py-1 text-right">{rupees(byHead.currentPaise)}</td>,
                <td key={`${head}-sum-t`} className="border border-black px-2 py-1 text-right">{rupees(byHead.totalPaise)}</td>,
              ]))}
              <td className="border border-black px-2 py-1 text-right">{rupees(totals.previousPaise)}</td>
              <td className="border border-black px-2 py-1 text-right">{rupees(totals.currentPaise)}</td>
              <td className="border border-black px-2 py-1 text-right">{rupees(totals.paidPaise)}</td>
              <td className="border border-black px-2 py-1 text-right">{rupees(totals.totalDuePaise)}</td>
              <td className="border border-black px-2 py-1 text-center">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
