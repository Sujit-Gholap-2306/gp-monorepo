'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { SearchInput } from '@gp/shadcn/ui/search-input'
import { searchUtaras } from '@/lib/db'
import { STATUS_LABELS, STATUS_COLORS, LAND_TYPE_LABELS, AREA_UNIT_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['search', debouncedQ],
    queryFn: () => searchUtaras(debouncedQ),
    enabled: debouncedQ.trim().length > 0,
  })

  return (
    <div className="animate-fade-in max-w-3xl p-5 md:p-7">
      <h1 className="mb-1 text-xl font-bold text-foreground">शोध</h1>
      <p className="mb-5 text-sm text-muted-foreground">नाव, गट नंबर, खाता किंवा गावाने शोधा</p>

      <div className="mb-6">
        <SearchInput
          autoFocus
          value={q}
          onChange={setQ}
          onDebouncedChange={setDebouncedQ}
          debounceMs={300}
          placeholder="येथे टाइप करा..."
          wrapperClassName="max-w-xl"
          className="h-11 rounded-xl border-border bg-card shadow-sm md:text-sm"
        />
      </div>

      {debouncedQ.trim().length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          वरील बॉक्समध्ये शोधण्यासाठी टाइप करा
        </div>
      ) : isFetching ? (
        <div className="py-12 text-center text-sm text-muted-foreground">शोधत आहे...</div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">&ldquo;{debouncedQ}&rdquo; साठी कोणतीही नोंद आढळली नाही</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mb-3 text-xs text-muted-foreground">{results.length} नोंदी आढळल्या</div>
          {results.map(u => (
            <Link
              key={u.id}
              href={`/utaras/${u.id}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20 hover:bg-primary/5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-foreground">{u.surveyNumber}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[u.status]}`}>
                    {STATUS_LABELS[u.status]}
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">{u.ownerName}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {u.village}, {u.taluka} &middot; {u.area} {AREA_UNIT_LABELS[u.areaUnit]} ({LAND_TYPE_LABELS[u.landType]}) &middot; {formatDate(u.createdAt)}
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
