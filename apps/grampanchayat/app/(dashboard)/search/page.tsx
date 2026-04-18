'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronRight } from 'lucide-react'
import { searchUtaras } from '@/lib/db'
import { STATUS_LABELS, STATUS_COLORS, LAND_TYPE_LABELS, AREA_UNIT_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'

export default function SearchPage() {
  const [q, setQ] = useState('')

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchUtaras(q),
    enabled: q.trim().length > 0,
  })

  return (
    <div className="animate-fade-in p-5 md:p-7 max-w-3xl">
      <h1 className="mb-1 text-xl font-bold text-slate-800">शोध</h1>
      <p className="mb-5 text-sm text-slate-500">नाव, गट नंबर, खाता किंवा गावाने शोधा</p>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="येथे टाइप करा..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-green-400 focus:outline-none focus:ring-3 focus:ring-green-100 transition-all"
        />
      </div>

      {q.trim().length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          वरील बॉक्समध्ये शोधण्यासाठी टाइप करा
        </div>
      ) : isFetching ? (
        <div className="py-12 text-center text-sm text-slate-400">शोधत आहे...</div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm text-slate-400">&ldquo;{q}&rdquo; साठी कोणतीही नोंद आढळली नाही</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mb-3 text-xs text-slate-500">{results.length} नोंदी आढळल्या</div>
          {results.map(u => (
            <Link
              key={u.id}
              href={`/utaras/${u.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-green-200 hover:bg-green-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-700">{u.surveyNumber}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[u.status]}`}>
                    {STATUS_LABELS[u.status]}
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-800">{u.ownerName}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {u.village}, {u.taluka} &middot; {u.area} {AREA_UNIT_LABELS[u.areaUnit]} ({LAND_TYPE_LABELS[u.landType]}) &middot; {formatDate(u.createdAt)}
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
