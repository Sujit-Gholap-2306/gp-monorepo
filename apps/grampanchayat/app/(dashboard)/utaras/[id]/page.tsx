'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Trash2, Printer } from 'lucide-react'
import { getUtara, deleteUtara } from '@/lib/db'
import { STATUS_LABELS, STATUS_COLORS, LAND_TYPE_LABELS, AREA_UNIT_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'

export default function UtaraDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const { data: utara, isLoading } = useQuery({
    queryKey: ['utara', id],
    queryFn: () => getUtara(id),
  })

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => deleteUtara(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['utaras'] })
      router.push('/utaras')
    },
  })

  const confirmDelete = () => {
    if (confirm(`"${utara?.ownerName}" यांची नोंद कायमची हटवायची आहे का?`)) {
      remove()
    }
  }

  if (isLoading) {
    return <div className="p-7 text-sm text-slate-400">लोड होत आहे...</div>
  }

  if (!utara) {
    return (
      <div className="p-7 text-center">
        <p className="text-slate-500">नोंद आढळली नाही</p>
        <Link href="/utaras" className="mt-2 inline-block text-sm text-green-700 hover:underline">
          परत जा
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in p-5 md:p-7 max-w-2xl">
      {/* Back + actions */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <Link href="/utaras" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> उतारे
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Printer className="size-3.5" /> छापा
          </button>
          <Link
            href={`/utaras/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="size-3.5" /> संपादित करा
          </Link>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="size-3.5" /> हटवा
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-0.5">गट नंबर</div>
            <div className="font-mono text-2xl font-bold text-slate-800">{utara.surveyNumber}</div>
          </div>
          <span className={`mt-1 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[utara.status]}`}>
            {STATUS_LABELS[utara.status]}
          </span>
        </div>
        <div className="mt-4 text-lg font-semibold text-slate-800">{utara.ownerName}</div>
        <div className="text-sm text-slate-500">
          {utara.village}, {utara.taluka}, {utara.district}
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard title="मालकाचे तपशील">
          <Row label="मालकाचे नाव" value={utara.ownerName} />
          {utara.ownerContact && <Row label="संपर्क" value={utara.ownerContact} />}
          {utara.khataNumber && <Row label="खाता नंबर" value={utara.khataNumber} />}
        </InfoCard>

        <InfoCard title="स्थान">
          <Row label="गाव" value={utara.village} />
          <Row label="तालुका" value={utara.taluka} />
          <Row label="जिल्हा" value={utara.district} />
        </InfoCard>

        <InfoCard title="जमिनीचे तपशील">
          <Row label="क्षेत्रफळ" value={`${utara.area} ${AREA_UNIT_LABELS[utara.areaUnit]}`} />
          <Row label="प्रकार" value={LAND_TYPE_LABELS[utara.landType]} />
        </InfoCard>

        <InfoCard title="नोंद माहिती">
          <Row label="नोंद केली" value={formatDate(utara.createdAt)} />
          <Row label="शेवटचे बदल" value={formatDate(utara.updatedAt)} />
          <Row label="स्थिती" value={STATUS_LABELS[utara.status]} />
        </InfoCard>
      </div>

      {utara.notes && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">टिपा</div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{utara.notes}</p>
        </div>
      )}
    </div>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      <dl className="space-y-2">{children}</dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
      <dd className="text-xs font-medium text-slate-800 text-right">{value}</dd>
    </div>
  )
}
