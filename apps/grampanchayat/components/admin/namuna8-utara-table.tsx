import type { ReactNode } from 'react'
import type { Namuna8PrintPayload } from '@/lib/namuna8/print-draft'
import { propertyTypeLabel } from '@/lib/namuna8/property-type-options'

/** Leaf columns: 1 = leftmost … 30 = rightmost (one number per column, including each composite subcolumn). */
const COL_INDEX = Array.from({ length: 30 }, (_, i) => i + 1)

/**
 * Ids for the **first** header row (rowSpan groups / span titles only).
 * Set `verticalHeaders[id] === true` to use vertical Marathi in a narrow lane.
 * Omitted or false = horizontal text, minimal header height.
 */
export type UtaraHeaderColumnId =
  | 'sr'
  | 'street'
  | 'survey'
  | 'propertyNo'
  | 'owner'
  | 'occupant'
  | 'description'
  | 'ageBracket'
  | 'lengthFt'
  | 'widthFt'
  | 'areaSqft'
  | 'areaSqM'
  | 'rrGroup'
  | 'gharsa'
  | 'weightage'
  | 'capitalValue'
  | 'taxRate'
  | 'taxGroup'
  | 'appealGroup'
  | 'shera'

const FIRST_NINE_HEADER_IDS: readonly UtaraHeaderColumnId[] = [
  'sr',
  'street',
  'survey',
  'propertyNo',
  'owner',
  'occupant',
  'description',
  'ageBracket',
  'lengthFt',
]

type Props = {
  data: Namuna8PrintPayload
  tenantName?: string
  compact?: boolean
  showSignature?: boolean
  /** e.g. `25 April 2026` — shown top-right in the report header (preview/print). */
  reportDateLabel?: string
  /** Per-column: use vertical writing for that header. Default = all horizontal (short headers). */
  verticalHeaders?: Partial<Record<UtaraHeaderColumnId, boolean>>
  /**
   * Body row height — only data cells.
   * `comfortable` = a bit more padding (default). `compact` = denser.
   */
  valueRowHeight?: 'compact' | 'comfortable'
}

function inr(valuePaise: number): string {
  return (valuePaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtFt(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function fmtNum(n: number, maxFraction = 2): string {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: maxFraction > 0 ? 0 : 0,
    maximumFractionDigits: maxFraction,
  })
}

function fmtRr(rupeesPerSqM: number): string {
  if (!Number.isFinite(rupeesPerSqM) || rupeesPerSqM <= 0) return '—'
  return fmtNum(rupeesPerSqM, 2)
}

function gharsaLabel(factor: number): string {
  if (!Number.isFinite(factor)) return '—'
  if (factor >= 0 && factor <= 1) {
    const pct = (1 - factor) * 100
    if (pct <= 0) return '0%'
    return `${pct % 1 === 0 ? pct : pct.toFixed(1)}%`
  }
  return String(factor)
}

/** Optional preset: rotate the longest / widest titles only. */
export const UTARA_PRESET_VERTICAL_LONG_LABELS: Partial<Record<UtaraHeaderColumnId, boolean>> = {
  ageBracket: true,
  weightage: true,
  rrGroup: true,
  taxGroup: true,
  appealGroup: true,
  shera: true,
}

type HeadLabelMode = 'horizontal' | 'vertical' | 'rotateLeft'

function resolveHeadLabelMode(
  id: UtaraHeaderColumnId,
  isV: (i: UtaraHeaderColumnId) => boolean
): HeadLabelMode {
  if (isV(id)) return 'vertical'
  if (FIRST_NINE_HEADER_IDS.includes(id)) return 'rotateLeft'
  return 'horizontal'
}

function HeadLabel({
  children,
  mode,
  narrow,
  className = '',
}: {
  children: ReactNode
  mode: HeadLabelMode
  narrow?: boolean
  className?: string
}) {
  if (mode === 'vertical') {
    return (
      <div
        className={`flex min-h-16 w-full items-center justify-center ${narrow ? 'max-w-8' : 'max-w-9'} py-1.5 sm:min-h-18 ${className}`}
      >
        <span className="text-center text-[8px] font-semibold leading-tight [text-orientation:mixed] [writing-mode:vertical-rl] sm:text-[9px]">
          {children}
        </span>
      </div>
    )
  }
  if (mode === 'rotateLeft') {
    return (
      <div
        className={`flex min-h-16 w-full items-center justify-center py-1.5 sm:min-h-18 sm:py-2 ${className}`}
      >
        <span className="inline-block origin-center -rotate-90 text-[8px] font-semibold leading-tight sm:text-[9px]">
          {children}
        </span>
      </div>
    )
  }
  return (
    <div
      className={`flex min-h-14 w-full items-center justify-center px-1.5 py-2.5 text-center text-[8px] font-semibold leading-snug sm:min-h-16 sm:px-2 sm:py-3 sm:text-[9px] ${className}`}
    >
      {children}
    </div>
  )
}

function GroupTitle({ children, vertical }: { children: ReactNode, vertical: boolean }) {
  if (vertical) {
    return (
      <div className="flex min-h-16 w-full items-center justify-center py-1.5 sm:min-h-18">
        <span className="px-0.5 text-center text-[8px] font-semibold leading-snug [text-orientation:mixed] [writing-mode:vertical-rl] sm:text-[9px]">
          {children}
        </span>
      </div>
    )
  }
  return (
    <div className="flex min-h-14 w-full items-center justify-center px-0.5 py-2.5 text-center text-[8px] font-semibold leading-snug sm:min-h-16 sm:px-1 sm:py-3 sm:text-[9px]">
      {children}
    </div>
  )
}

export function Namuna8UtaraTable({
  data,
  tenantName = 'ग्रामपंचायत',
  compact = false,
  showSignature = false,
  reportDateLabel,
  verticalHeaders,
  valueRowHeight = 'comfortable',
}: Props) {
  const textClass = compact ? 'text-[9px] leading-tight' : 'text-[10px] leading-snug'
  const headPrimary = compact ? 'text-[8px] leading-tight' : 'text-[9px] leading-tight'

  const isV = (id: UtaraHeaderColumnId) => verticalHeaders?.[id] === true
  const labelMode = (id: UtaraHeaderColumnId) => resolveHeadLabelMode(id, isV)

  const d = data.dimensions
  const rr = data.readyReckonerPerSqM
  const a = data.assessment
  const shera = [data.notes, data.resolutionRef].filter(Boolean).join(' · ') || '—'
  const street = '—'
  const constructionLabel = data.ageBracket?.trim() || '—'
  const appealDash = '—'

  return (
    <section className="overflow-hidden rounded-md border border-black bg-white">
      <header className="relative border-b border-black px-2 py-3 text-center sm:px-3 sm:py-4">
        {reportDateLabel ? (
          <p className="absolute right-2 top-2 z-10 max-w-[50%] text-right text-[10px] leading-tight text-slate-600 sm:right-3 sm:top-3 sm:max-w-[40%] sm:text-xs">
            <span className="text-slate-500">दिनांक:</span>{' '}
            <span className="whitespace-nowrap font-medium text-slate-800">{reportDateLabel}</span>
          </p>
        ) : null}
        <p className="text-sm font-semibold leading-tight sm:text-base">नमुना क्रमांक ८</p>
        <p className="text-[10px] leading-tight sm:text-xs">सन चालू वर्षाची कर आकारणी नोंदवही उतारा</p>
        <p className="mt-0.5 text-xs font-semibold leading-tight sm:text-sm">ग्रामपंचायत: {tenantName}</p>
      </header>

      <div className="overflow-x-auto">
        <table className={`min-w-[1400px] w-full border-collapse ${textClass}`}>
          <thead>
            {/* ① Column titles only */}
            <tr className="bg-[#f0f0f0]">
              <Head className={`${headPrimary} min-w-8`}>
                <HeadLabel mode={labelMode('sr')}>अ.नं.</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-14`}>
                <HeadLabel mode={labelMode('street')} narrow>रस्त्याचे नाव</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-12`}>
                <HeadLabel mode={labelMode('survey')}>सिटी सर्व्हे नं.</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-12`}>
                <HeadLabel mode={labelMode('propertyNo')}>मालमत्ता क्रमांक</HeadLabel>
              </Head>
              <Head className={`${headPrimary} min-w-18`}>
                <HeadLabel mode={labelMode('owner')}>मालकाचे नाव</HeadLabel>
              </Head>
              <Head className={`${headPrimary} min-w-18`}>
                <HeadLabel mode={labelMode('occupant')}>भोगवटादाराचे नाव</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-16`}>
                <HeadLabel mode={labelMode('description')}>मालमत्तेचे वर्णन</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-11`}>
                <HeadLabel mode={labelMode('ageBracket')}>मिळकत बांधकामाचे वर्ष / वयोगट</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-9`}>
                <HeadLabel mode={labelMode('lengthFt')}>लांबी (फूट)</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-9`}>
                <HeadLabel mode={labelMode('widthFt')}>रुंदी (फूट)</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-10`}>
                <HeadLabel mode={labelMode('areaSqft')}>क्षेत्रफळ चौ. फूट</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-10`}>
                <HeadLabel mode={labelMode('areaSqM')}>क्षेत्रफळ चौ. मी.</HeadLabel>
              </Head>
              <Head colSpan={3} className={`${headPrimary} w-18`}>
                <GroupTitle vertical={isV('rrGroup')}>रेडीरेकनर दर प्रती चौ. मी. (रुपये)</GroupTitle>
              </Head>
              <Head className={`${headPrimary} w-10`}>
                <HeadLabel mode={labelMode('gharsa')}>घसारा दर</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-12`}>
                <HeadLabel mode={labelMode('weightage')}>ईमारतीच्या वापरानुसार भारांक</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-11`}>
                <HeadLabel mode={labelMode('capitalValue')}>भांडवली मूल्य (₹)</HeadLabel>
              </Head>
              <Head className={`${headPrimary} w-10`}>
                <HeadLabel mode={labelMode('taxRate')}>कराचा दर (पैसे)</HeadLabel>
              </Head>
              <Head colSpan={5} className={`${headPrimary} w-24`}>
                <GroupTitle vertical={isV('taxGroup')}>कराची रक्कम (₹)</GroupTitle>
              </Head>
              <Head colSpan={5} className={`${headPrimary} w-24`}>
                <GroupTitle vertical={isV('appealGroup')}>अपिलाचा निकाल व त्यानंतर केलेले फेरफार (₹)</GroupTitle>
              </Head>
              <Head className={`${headPrimary} w-12`}>
                <HeadLabel mode={labelMode('shera')}>नवा गट/ओळख शेरा</HeadLabel>
              </Head>
            </tr>
            {/* ② कोषांक — one cell per leaf column, directly under titles */}
            <tr className="bg-[#e8e8e8] text-[9px] font-semibold text-slate-800 sm:text-[10px]">
              {COL_INDEX.map((n) => (
                <NumHead key={`col-${n}`} colNumber={n}>
                  {n}
                </NumHead>
              ))}
            </tr>
            {/* ③ Sub-headings for grouped blocks only */}
            <tr className="bg-[#f6f6f6] text-[8px] sm:text-[9px]">
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHead>जमीन</SubHead>
              <SubHead>ईमारत</SubHead>
              <SubHead>बांधकाम</SubHead>
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHeadEmpty />
              <SubHead>घरपट्टी</SubHead>
              <SubHead>दिवाबत्ती</SubHead>
              <SubHead>आरोग्य</SubHead>
              <SubHead>पाणीपट्टी</SubHead>
              <SubHead>एकूण</SubHead>
              <SubHead>घरपट्टी</SubHead>
              <SubHead>दिवाबत्ती</SubHead>
              <SubHead>आरोग्य</SubHead>
              <SubHead>पाणीपट्टी</SubHead>
              <SubHead>एकूण</SubHead>
              <SubHeadEmpty />
            </tr>
          </thead>
          <tbody>
            <tr>
              <Cell valueRowHeight={valueRowHeight}>1</Cell>
              <Cell valueRowHeight={valueRowHeight}>{street}</Cell>
              <Cell valueRowHeight={valueRowHeight}>{data.surveyNumber?.trim() || '—'}</Cell>
              <Cell valueRowHeight={valueRowHeight}>{data.propertyNo}</Cell>
              <Cell valueRowHeight={valueRowHeight}>{data.owner.nameMr}</Cell>
              <Cell valueRowHeight={valueRowHeight}>{data.occupantName || '—'}</Cell>
              <Cell valueRowHeight={valueRowHeight}>{propertyTypeLabel(data.propertyType)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-center">{constructionLabel}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{fmtFt(d.lengthFt)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{fmtFt(d.widthFt)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{fmtNum(data.area.sqFt, 2)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{fmtNum(data.area.sqM, 3)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{fmtRr(rr.land)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{fmtRr(rr.imarat)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{rr.bandhkam != null && rr.bandhkam > 0 ? fmtRr(rr.bandhkam) : '—'}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{gharsaLabel(a.depreciationFactor)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{fmtNum(a.usageWeightage, 2)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">
                {data.valuation.capitalValueRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{fmtNum(a.taxRatePaise, 2)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{inr(data.heads.housePaise)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{inr(data.heads.lightingPaise)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{inr(data.heads.sanitationPaise)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right">{inr(data.heads.waterPaise)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right font-semibold">{inr(data.heads.totalPaise)}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right text-slate-500">{appealDash}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right text-slate-500">{appealDash}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right text-slate-500">{appealDash}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right text-slate-500">{appealDash}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="text-right text-slate-500">{appealDash}</Cell>
              <Cell valueRowHeight={valueRowHeight} className="wrap-break-word whitespace-pre-wrap text-[8px] leading-relaxed sm:text-[9px]">
                {shera}
              </Cell>
            </tr>
          </tbody>
        </table>
      </div>

      {data.notes && (
        <div className="border-t border-black px-2 py-1.5 text-[10px] sm:px-3 sm:py-2 sm:text-xs">
          <span className="font-semibold">टीप:</span> {data.notes}
        </div>
      )}

      {showSignature && (
        <footer className="grid grid-cols-2 border-t border-black px-3 py-6 text-[10px] sm:py-8 sm:text-xs">
          <div className="text-center">मालक / अर्जदार सही</div>
          <div className="text-center">ग्रामसेवक सही</div>
        </footer>
      )}
    </section>
  )
}

function Head({
  children,
  rowSpan,
  colSpan,
  className = '',
}: {
  children: ReactNode
  rowSpan?: number
  colSpan?: number
  className?: string
}) {
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      className={`border border-black align-middle font-semibold ${className}`}
    >
      {children}
    </th>
  )
}

function SubHead({ children }: { children: ReactNode }) {
  return (
    <th className="border border-black px-0.5 py-2.5 text-center align-middle text-[7px] font-medium sm:px-1 sm:py-3 sm:text-[8px]">
      {children}
    </th>
  )
}

function SubHeadEmpty() {
  return (
    <th
      aria-hidden
      className="border border-black bg-[#f6f6f6] py-2.5 align-middle sm:py-3"
    />
  )
}

function NumHead({ children, colNumber }: { children: ReactNode, colNumber: number }) {
  const rotate = colNumber >= 1 && colNumber <= 9
  return (
    <th className="border border-black px-0.5 py-1.5 text-center align-middle leading-none sm:py-2.5">
      {rotate ? (
        <span className="inline-flex h-7 w-5 items-center justify-center sm:h-8 sm:w-6">
          <span className="font-mono tabular-nums -rotate-90 transform">{children}</span>
        </span>
      ) : (
        <span className="font-mono tabular-nums">{children}</span>
      )}
    </th>
  )
}

function Cell({
  children,
  className = '',
  valueRowHeight = 'comfortable',
}: {
  children: ReactNode
  className?: string
  valueRowHeight?: 'compact' | 'comfortable'
}) {
  const size =
    valueRowHeight === 'comfortable'
      ? 'min-h-20 border border-black px-2 py-5 align-middle sm:min-h-24 sm:px-2.5 sm:py-6'
      : 'min-h-14 border border-black px-1.5 py-3 align-middle sm:min-h-16 sm:py-3.5'
  return <td className={`${size} ${className}`}>{children}</td>
}
