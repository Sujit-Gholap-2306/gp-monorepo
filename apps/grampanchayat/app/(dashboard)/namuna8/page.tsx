'use client'

import { useState, useMemo } from 'react'
import { Search, Building2, MapPin, User, Users, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import type { Namuna8Property } from '@/types'
import { PROPERTY_TYPE_LABELS, AGE_BRACKET_LABELS } from '@/types'
import { searchProperties, calcNameuna8, formatRupees, formatNumber } from '@/lib/namuna8'
import { NAMUNA8_DATA } from '@/lib/data/namuna8-seed'

interface OwnerGroup {
  ownerName: string
  properties: Namuna8Property[]
  totalTax: number
}

export default function Namuna8Page() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Namuna8Property>(NAMUNA8_DATA[0])
  const [expandedOwners, setExpandedOwners] = useState<Set<string>>(new Set())

  const results = useMemo(() => searchProperties(query), [query])

  // Group by owner, preserving first-seen order
  const ownerGroups = useMemo<OwnerGroup[]>(() => {
    const map = new Map<string, Namuna8Property[]>()
    for (const p of results) {
      if (!map.has(p.ownerName)) map.set(p.ownerName, [])
      map.get(p.ownerName)!.push(p)
    }
    return Array.from(map.entries()).map(([ownerName, properties]) => ({
      ownerName,
      properties,
      totalTax: properties.reduce(
        (s, p) => s + p.houseTax + p.diwabatti + p.arogya + p.panipatti,
        0,
      ),
    }))
  }, [results])

  function handleOwnerClick(group: OwnerGroup) {
    if (group.properties.length === 1) {
      setSelected(group.properties[0])
    } else {
      setExpandedOwners(prev => {
        const next = new Set(prev)
        next.has(group.ownerName) ? next.delete(group.ownerName) : next.add(group.ownerName)
        return next
      })
      setSelected(group.properties[0])
    }
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* ── Left: People master ───────────────────────────────────── */}
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-white">

        {/* Header */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="text-sm font-bold text-slate-800">नमुना नं. ८ — बळसाणे</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{ownerGroups.length} मालक</span>
            <span>·</span>
            <span>{NAMUNA8_DATA.length} मालमत्ता</span>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-slate-100 px-3 py-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="मालकाचे नाव / क्रमांक शोधा"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Owner list */}
        <ul className="flex-1 overflow-y-auto">
          {ownerGroups.length === 0 ? (
            <li className="py-8 text-center text-xs text-slate-400">काही आढळले नाही</li>
          ) : (
            ownerGroups.map(group => {
              const isMulti = group.properties.length > 1
              const isExpanded = expandedOwners.has(group.ownerName)
              const isOwnerActive = !isMulti && selected?.id === group.properties[0].id
              const hasActiveChild = isMulti && group.properties.some(p => p.id === selected?.id)
              const rowActive = isOwnerActive || hasActiveChild

              return (
                <li key={group.ownerName}>
                  {/* Owner row */}
                  <button
                    onClick={() => handleOwnerClick(group)}
                    className={`w-full border-b border-slate-100 px-3 py-3 text-left transition-colors hover:bg-slate-50 ${
                      rowActive ? 'border-l-[3px] border-l-green-600 bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        {isMulti ? (
                          isExpanded
                            ? <ChevronDown className="size-3 shrink-0 text-slate-400" />
                            : <ChevronRight className="size-3 shrink-0 text-slate-400" />
                        ) : (
                          <span className="size-3 shrink-0" />
                        )}
                        <span className={`truncate text-xs font-semibold ${rowActive ? 'text-green-800' : 'text-slate-800'}`}>
                          {group.ownerName}
                        </span>
                        {isMulti && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
                            {group.properties.length}
                          </span>
                        )}
                      </div>
                      <span className={`shrink-0 font-mono text-xs font-semibold ${rowActive ? 'text-green-700' : 'text-slate-500'}`}>
                        ₹{group.totalTax.toFixed(0)}
                      </span>
                    </div>
                    {/* Single-prop: show #no + type as sub-label */}
                    {!isMulti && (
                      <div className="ml-[18px] mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="font-mono">#{group.properties[0].propertyNo}</span>
                        <span>·</span>
                        <span className="truncate">{PROPERTY_TYPE_LABELS[group.properties[0].propertyType]}</span>
                      </div>
                    )}
                  </button>

                  {/* Sub-properties for multi-property owners */}
                  {isMulti && isExpanded && (
                    <ul className="border-b border-slate-100">
                      {group.properties.map(p => {
                        const propTotal = p.houseTax + p.diwabatti + p.arogya + p.panipatti
                        const isActive = selected?.id === p.id
                        return (
                          <li key={p.id}>
                            <button
                              onClick={() => setSelected(p)}
                              className={`w-full py-2.5 pl-9 pr-3 text-left transition-colors hover:bg-slate-50 ${
                                isActive ? 'bg-green-50' : 'bg-slate-50/50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className={`truncate text-xs font-medium ${isActive ? 'text-green-800' : 'text-slate-700'}`}>
                                    {p.occupantName !== 'स्वतः' ? p.occupantName : p.ownerName}
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <span className="font-mono">#{p.propertyNo}</span>
                                    <span>·</span>
                                    <span className="truncate">{PROPERTY_TYPE_LABELS[p.propertyType]}</span>
                                  </div>
                                </div>
                                <span className={`shrink-0 font-mono text-xs font-semibold ${isActive ? 'text-green-700' : 'text-slate-500'}`}>
                                  ₹{propTotal.toFixed(0)}
                                </span>
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })
          )}
        </ul>
      </aside>

      {/* ── Right: Utara detail ───────────────────────────────────── */}
      <main className="min-w-0 flex-1 overflow-y-auto bg-[#f5f7fa] p-5 md:p-6">
        {selected ? (
          <UtaraDetail property={selected} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            डाव्या बाजूने मालमत्ता निवडा
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Utara Detail ──────────────────────────────────────────────────────────────

function UtaraDetail({ property: p }: { property: Namuna8Property }) {
  const c = calcNameuna8(p)

  return (
    <div className="animate-fade-in w-full max-w-5xl space-y-4">

      {/* Header */}
      <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-green-700">
            नमुना नं. ८ — उतारा · नियम ३२(१)
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-800">{p.ownerName}</div>
          {p.occupantName !== 'स्वतः' && (
            <div className="text-xs text-slate-500">Occupant: {p.occupantName}</div>
          )}
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5 text-slate-400" />
              {PROPERTY_TYPE_LABELS[p.propertyType]}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-slate-400" />
              {p.village}, {p.taluka}, {p.district}
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5 text-slate-400" />
              {AGE_BRACKET_LABELS[p.ageBracket]}
            </span>
            {p.occupantName !== 'स्वतः' && (
              <span className="flex items-center gap-1">
                <Users className="size-3.5 text-slate-400" />
                Tenant
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 self-start rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center sm:self-auto">
          <div className="text-[10px] text-slate-400">Property No.</div>
          <div className="font-mono text-xl font-bold text-green-700">#{p.propertyNo}</div>
          <div className="mt-1 text-[10px] text-slate-400">{p.assessmentPeriod}</div>
        </div>
      </div>

      {/* Calculation cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Step 1 — Area */}
        <CalcCard step="1" title="Area Calculation">
          <CalcRow label={`${p.lengthFt} ft × ${p.widthFt} ft`} value={`${c.areaSqFt} sq.ft`} />
          <CalcRow label="In square metres" value={`${formatNumber(c.areaSqM)} sq.m`} highlight />
        </CalcCard>

        {/* Step 2 — Capital Value */}
        <CalcCard step="2" title="Capital Value">
          <CalcRow
            label="Land"
            detail={`${formatNumber(c.areaSqM)} sq.m × ₹${p.rrLandRate}/sq.m`}
            value={formatRupees(c.landComponent)}
          />
          {p.rrConstructionRate > 0 ? (
            <CalcRow
              label="Building"
              detail={`${formatNumber(c.areaSqM)} sq.m × ₹${p.rrConstructionRate} × ${p.depreciationRate} (depreciation)`}
              value={formatRupees(c.buildingComponent)}
            />
          ) : (
            <CalcRow label="Building rate (vacant land)" value="—" />
          )}
          <div className="mt-2 border-t border-slate-100 pt-2">
            <CalcRow label="Total Capital Value" value={formatRupees(c.capitalValue)} highlight />
          </div>
        </CalcCard>

        {/* Step 3 — Tax */}
        <CalcCard step="3" title="Tax Breakdown">
          <CalcRow
            label="House tax"
            detail={`₹${p.taxRatePaise} per ₹1000 of capital value`}
            value={formatRupees(c.houseTax)}
          />
          <CalcRow label="Street light (flat)" value={formatRupees(c.diwabatti)} />
          <CalcRow label="Health / sanitation (flat)" value={formatRupees(c.arogya)} />
          <CalcRow label="Water tax (flat)" value={formatRupees(c.panipatti)} />
          <div className="mt-2 border-t border-slate-100 pt-2">
            <CalcRow label="Total Annual Tax" value={formatRupees(c.totalTax)} highlight />
          </div>
        </CalcCard>

        {/* Step 4 — Assessment info */}
        <CalcCard step="4" title="Assessment Info">
          <CalcRow label="Assessment period" value={p.assessmentPeriod} />
          <CalcRow label="Rule" value="32(1)" />
          <CalcRow label="Depreciation rate" value={`${(p.depreciationRate * 100).toFixed(0)}%`} />
          <CalcRow label="Usage weightage" value={p.usageWeightage.toString()} />
          <CalcRow label="Tax rate" value={`₹${p.taxRatePaise} per ₹1000`} />
          {p.shera && <CalcRow label="Note" value={p.shera} />}
        </CalcCard>
      </div>

      {/* Disclaimer */}
      <p className="flex items-start gap-1.5 text-[10px] text-slate-400">
        <FileText className="mt-0.5 size-3 shrink-0" />
        This property assessment extract is only for GP tax purposes and is not legal evidence for any other rights or title. Measurements are not technically certified.
      </p>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CalcCard({
  step,
  title,
  children,
}: {
  step: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-700 text-[10px] font-bold text-white">
          {step}
        </span>
        <span className="min-w-0 text-xs font-semibold text-slate-700">{title}</span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function CalcRow({
  label,
  detail,
  value,
  highlight = false,
}: {
  label: string
  detail?: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-x-3 gap-y-0.5 border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start ${highlight ? 'mt-0.5 border-b-0 pb-0 pt-1' : ''}`}
    >
      <div className="min-w-0">
        <dt
          className={`text-xs leading-snug ${highlight ? 'font-semibold text-slate-700' : 'text-slate-600'}`}
        >
          {label}
        </dt>
        {detail ? (
          <p className="mt-0.5 text-[11px] leading-snug wrap-break-word text-slate-400">{detail}</p>
        ) : null}
      </div>
      <dd
        className={`min-w-0 text-right text-xs wrap-break-word sm:pt-0.5 ${highlight ? 'font-mono text-sm font-bold text-green-700 tabular-nums' : 'font-mono text-slate-800 tabular-nums'}`}
      >
        {value}
      </dd>
    </div>
  )
}
