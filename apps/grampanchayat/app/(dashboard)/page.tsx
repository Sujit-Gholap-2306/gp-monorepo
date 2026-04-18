'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ScrollText, FilePlus, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { getAllUtaras } from '@/lib/db'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { data: utaras = [], isLoading } = useQuery({
    queryKey: ['utaras'],
    queryFn: getAllUtaras,
  })

  const stats = {
    total: utaras.length,
    active: utaras.filter(u => u.status === 'active').length,
    pending: utaras.filter(u => u.status === 'pending').length,
    disputed: utaras.filter(u => u.status === 'disputed').length,
  }

  const recent = utaras.slice(0, 5)

  return (
    <div className="animate-fade-in p-5 md:p-7 space-y-6 max-w-5xl">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">मुख्यपृष्ठ</h1>
        <p className="mt-0.5 text-sm text-slate-500">उतारा नोंदींचा आढावा</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="एकूण उतारे"
          value={isLoading ? '—' : stats.total}
          icon={<ScrollText className="size-5 text-blue-600" />}
          bg="bg-blue-50 border-blue-100"
        />
        <StatCard
          label="चालू"
          value={isLoading ? '—' : stats.active}
          icon={<CheckCircle className="size-5 text-green-600" />}
          bg="bg-green-50 border-green-100"
        />
        <StatCard
          label="प्रलंबित"
          value={isLoading ? '—' : stats.pending}
          icon={<Clock className="size-5 text-amber-600" />}
          bg="bg-amber-50 border-amber-100"
        />
        <StatCard
          label="वादग्रस्त"
          value={isLoading ? '—' : stats.disputed}
          icon={<AlertTriangle className="size-5 text-red-600" />}
          bg="bg-red-50 border-red-100"
        />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/utaras/new"
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          <FilePlus className="size-4" />
          नवीन उतारा नोंद
        </Link>
        <Link
          href="/utaras"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ScrollText className="size-4" />
          सर्व उतारे पाहा
        </Link>
      </div>

      {/* Recent records */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">अलीकडील नोंदी</h2>
          <Link href="/utaras" className="flex items-center gap-1 text-xs text-green-700 hover:underline">
            सर्व पाहा <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-sm text-slate-400 py-6 text-center">लोड होत आहे...</div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <ScrollText className="mx-auto size-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">अद्याप कोणतीही नोंद नाही</p>
            <Link
              href="/utaras/new"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-green-700 hover:underline"
            >
              <FilePlus className="size-3.5" />
              पहिली नोंद जोडा
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">गट नंबर</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">मालक</th>
                  <th className="hidden px-4 py-2.5 text-xs font-semibold text-slate-500 sm:table-cell">गाव</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">स्थिती</th>
                  <th className="hidden px-4 py-2.5 text-xs font-semibold text-slate-500 md:table-cell">दिनांक</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{u.surveyNumber}</td>
                    <td className="px-4 py-3">
                      <Link href={`/utaras/${u.id}`} className="font-medium text-slate-800 hover:text-green-700">
                        {u.ownerName}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{u.village}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[u.status]}`}>
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-400 md:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  bg,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  bg: string
}) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-2xl font-bold text-slate-800">{value}</span>
      </div>
      <div className="mt-2 text-xs font-medium text-slate-600">{label}</div>
    </div>
  )
}
