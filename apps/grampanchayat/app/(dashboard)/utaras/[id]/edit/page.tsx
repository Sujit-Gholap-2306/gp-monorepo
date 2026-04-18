'use client'

import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { getUtara, saveUtara } from '@/lib/db'
import type { UtaraInput } from '@/types'

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100 transition-colors'

const schema = z.object({
  surveyNumber: z.string().min(1, 'गट नंबर आवश्यक आहे'),
  khataNumber: z.string().optional(),
  ownerName: z.string().min(2, 'मालकाचे नाव आवश्यक आहे'),
  ownerContact: z.string().optional(),
  village: z.string().min(1, 'गाव आवश्यक आहे'),
  taluka: z.string().min(1, 'तालुका आवश्यक आहे'),
  district: z.string().min(1, 'जिल्हा आवश्यक आहे'),
  area: z.coerce.number().positive('क्षेत्रफळ आवश्यक आहे'),
  areaUnit: z.enum(['acre', 'hectare', 'gunta']),
  landType: z.enum(['irrigated', 'non-irrigated', 'barren', 'residential', 'commercial']),
  status: z.enum(['active', 'pending', 'disputed', 'transferred']),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function EditUtaraPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const { data: utara, isLoading } = useQuery({
    queryKey: ['utara', id],
    queryFn: () => getUtara(id),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: utara
      ? {
          surveyNumber: utara.surveyNumber,
          khataNumber: utara.khataNumber ?? '',
          ownerName: utara.ownerName,
          ownerContact: utara.ownerContact ?? '',
          village: utara.village,
          taluka: utara.taluka,
          district: utara.district,
          area: utara.area,
          areaUnit: utara.areaUnit,
          landType: utara.landType,
          status: utara.status,
          notes: utara.notes ?? '',
        }
      : undefined,
  })

  const { mutateAsync } = useMutation({
    mutationFn: async (values: UtaraInput) => {
      if (!utara) return
      await saveUtara({ ...utara, ...values, updatedAt: new Date().toISOString() })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['utaras'] })
      void qc.invalidateQueries({ queryKey: ['utara', id] })
    },
  })

  const onSubmit = async (values: FormValues) => {
    await mutateAsync(values as UtaraInput)
    router.push(`/utaras/${id}`)
  }

  if (isLoading) return <div className="p-7 text-sm text-slate-400">लोड होत आहे...</div>
  if (!utara) return (
    <div className="p-7 text-center">
      <p className="text-slate-500">नोंद आढळली नाही</p>
      <Link href="/utaras" className="mt-2 inline-block text-sm text-green-700 hover:underline">परत जा</Link>
    </div>
  )

  return (
    <div className="animate-fade-in p-5 md:p-7 max-w-2xl">
      <div className="mb-6">
        <Link href={`/utaras/${id}`} className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> नोंद पाहा
        </Link>
        <h1 className="text-xl font-bold text-slate-800">उतारा संपादित करा</h1>
        <p className="mt-0.5 text-sm text-slate-500">गट नंबर: {utara.surveyNumber}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card title="ओळख क्रमांक">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label text="गट / सर्वे नंबर *" error={errors.surveyNumber?.message}>
              <input className={INPUT} {...register('surveyNumber')} />
            </Label>
            <Label text="खाता नंबर" error={errors.khataNumber?.message}>
              <input className={INPUT} {...register('khataNumber')} />
            </Label>
          </div>
        </Card>

        <Card title="मालकाची माहिती">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label text="मालकाचे नाव *" error={errors.ownerName?.message}>
              <input className={INPUT} {...register('ownerName')} />
            </Label>
            <Label text="संपर्क क्रमांक" error={errors.ownerContact?.message}>
              <input className={INPUT} {...register('ownerContact')} type="tel" />
            </Label>
          </div>
        </Card>

        <Card title="स्थान">
          <div className="grid gap-4 sm:grid-cols-3">
            <Label text="गाव *" error={errors.village?.message}>
              <input className={INPUT} {...register('village')} />
            </Label>
            <Label text="तालुका *" error={errors.taluka?.message}>
              <input className={INPUT} {...register('taluka')} />
            </Label>
            <Label text="जिल्हा *" error={errors.district?.message}>
              <input className={INPUT} {...register('district')} />
            </Label>
          </div>
        </Card>

        <Card title="जमिनीची माहिती">
          <div className="grid gap-4 sm:grid-cols-3">
            <Label text="क्षेत्रफळ *" error={errors.area?.message}>
              <input className={INPUT} {...register('area')} type="number" step="0.01" min="0" />
            </Label>
            <Label text="एकक" error={errors.areaUnit?.message}>
              <select className={INPUT} {...register('areaUnit')}>
                <option value="acre">एकर</option>
                <option value="hectare">हेक्टर</option>
                <option value="gunta">गुंठा</option>
              </select>
            </Label>
            <Label text="जमीन प्रकार" error={errors.landType?.message}>
              <select className={INPUT} {...register('landType')}>
                <option value="irrigated">बागायत</option>
                <option value="non-irrigated">जिरायत</option>
                <option value="barren">माळरान</option>
                <option value="residential">निवासी</option>
                <option value="commercial">व्यापारी</option>
              </select>
            </Label>
          </div>
        </Card>

        <Card title="स्थिती व टिपा">
          <Label text="नोंदीची स्थिती" error={errors.status?.message}>
            <select className={INPUT} {...register('status')}>
              <option value="active">चालू</option>
              <option value="pending">प्रलंबित</option>
              <option value="disputed">वादग्रस्त</option>
              <option value="transferred">हस्तांतरित</option>
            </select>
          </Label>
          <Label text="टिपा / शेरा" error={errors.notes?.message}>
            <textarea className={`${INPUT} resize-none`} {...register('notes')} rows={3} />
          </Label>
        </Card>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            <Save className="size-4" />
            {isSubmitting ? 'जतन होत आहे...' : 'बदल जतन करा'}
          </button>
          <Link
            href={`/utaras/${id}`}
            className="inline-flex items-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            रद्द करा
          </Link>
        </div>
      </form>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <h2 className="border-b border-slate-100 pb-2 text-sm font-semibold text-slate-700">{title}</h2>
      {children}
    </div>
  )
}

function Label({ text, error, children }: { text: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-600">{text}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
