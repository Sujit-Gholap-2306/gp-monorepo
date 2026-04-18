'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FilePlus, Search, ChevronRight } from 'lucide-react'
import { searchUtaras } from '@/lib/db'
import { STATUS_LABELS, STATUS_COLORS, LAND_TYPE_LABELS, AREA_UNIT_LABELS, type UtaraStatus } from '@/types'
import { formatDate } from '@/lib/utils'

export default function UtarasPage() {
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<UtaraStatus | 'all'>('all')

  const { data: utaras = [], isLoading } = useQuery({
    queryKey: ['utaras', q],
    queryFn: () => searchUtaras(q),
  })

  const filtered = statusFilter === 'all' ? utaras : utaras.filter(u => u.status === statusFilter)

  return (
    <div className="animate-fade-in p-5 md:p-7 max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">उतारे</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {filtered.length} नोंदी {statusFilter !== 'all' && `— ${STATUS_LABELS[statusFilter]}`}
          </p>
        </div>
        <Link
          href="/utaras/new"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          <FilePlus className="size-4" />
          नवीन नोंद
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="नाव, गट नंबर, गाव शोधा..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as UtaraStatus | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
        >
          <option value="all">सर्व स्थिती</option>
          <option value="active">चालू</option>
          <option value="pending">प्रलंबित</option>
          <option value="disputed">वादग्रस्त</option>
          <option value="transferred">हस्तांतरित</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-400">लोड होत आहे...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-14 text-center">
          <p className="text-sm text-slate-400">कोणतीही नोंद आढळली नाही</p>
          {q && (
            <button onClick={() => setQ('')} className="mt-2 text-xs text-green-700 hover:underline">
              शोध रद्द करा
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">गट नंबर</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">मालकाचे नाव</th>
                <th className="hidden px-4 py-3 text-xs font-semibold text-slate-500 sm:table-cell">गाव / तालुका</th>
                <th className="hidden px-4 py-3 text-xs font-semibold text-slate-500 md:table-cell">क्षेत्र / प्रकार</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">स्थिती</th>
                <th className="hidden px-4 py-3 text-xs font-semibold text-slate-500 lg:table-cell">दिनांक</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{u.surveyNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{u.ownerName}</div>
                    {u.khataNumber && (
                      <div className="text-[11px] text-slate-400">खाता: {u.khataNumber}</div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="text-slate-700">{u.village}</div>
                    <div className="text-[11px] text-slate-400">{u.taluka}</div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="text-slate-700">
                      {u.area} {AREA_UNIT_LABELS[u.areaUnit]}
                    </div>
                    <div className="text-[11px] text-slate-400">{LAND_TYPE_LABELS[u.landType]}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[u.status]}`}>
                      {STATUS_LABELS[u.status]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-400 lg:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/utaras/${u.id}`}
                      className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
                    >
                      पाहा <ChevronRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
