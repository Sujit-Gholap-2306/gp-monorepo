'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { saveUtara } from '@/lib/db'
import { generateId } from '@/lib/utils'
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

export default function NewUtaraPage() {
  const router = useRouter()
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { areaUnit: 'acre', landType: 'non-irrigated', status: 'active' },
  })

  const { mutateAsync } = useMutation({
    mutationFn: async (values: UtaraInput) => {
      const now = new Date().toISOString()
      await saveUtara({ ...values, id: generateId(), createdAt: now, updatedAt: now })
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['utaras'] }),
  })

  const onSubmit = async (values: FormValues) => {
    await mutateAsync(values as UtaraInput)
    router.push('/utaras')
  }

  return (
    <div className="animate-fade-in p-5 md:p-7 max-w-2xl">
      <div className="mb-6">
        <Link href="/utaras" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> उतारे
        </Link>
        <h1 className="text-xl font-bold text-slate-800">नवीन उतारा नोंद</h1>
        <p className="mt-0.5 text-sm text-slate-500">सर्व अनिवार्य माहिती भरा</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* IDs */}
        <Card title="ओळख क्रमांक">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label text="गट / सर्वे नंबर *" error={errors.surveyNumber?.message}>
              <input className={INPUT} {...register('surveyNumber')} placeholder="उदा. 123/1" />
            </Label>
            <Label text="खाता नंबर" error={errors.khataNumber?.message}>
              <input className={INPUT} {...register('khataNumber')} placeholder="उदा. 45" />
            </Label>
          </div>
        </Card>

        {/* Owner */}
        <Card title="मालकाची माहिती">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label text="मालकाचे नाव *" error={errors.ownerName?.message}>
              <input className={INPUT} {...register('ownerName')} placeholder="पूर्ण नाव" />
            </Label>
            <Label text="संपर्क क्रमांक" error={errors.ownerContact?.message}>
              <input className={INPUT} {...register('ownerContact')} placeholder="मोबाइल नंबर" type="tel" />
            </Label>
          </div>
        </Card>

        {/* Location */}
        <Card title="स्थान">
          <div className="grid gap-4 sm:grid-cols-3">
            <Label text="गाव *" error={errors.village?.message}>
              <input className={INPUT} {...register('village')} placeholder="गावाचे नाव" />
            </Label>
            <Label text="तालुका *" error={errors.taluka?.message}>
              <input className={INPUT} {...register('taluka')} placeholder="तालुका" />
            </Label>
            <Label text="जिल्हा *" error={errors.district?.message}>
              <input className={INPUT} {...register('district')} placeholder="जिल्हा" />
            </Label>
          </div>
        </Card>

        {/* Land */}
        <Card title="जमिनीची माहिती">
          <div className="grid gap-4 sm:grid-cols-3">
            <Label text="क्षेत्रफळ *" error={errors.area?.message}>
              <input className={INPUT} {...register('area')} placeholder="0.00" type="number" step="0.01" min="0" />
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

        {/* Status & Notes */}
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
            <textarea className={`${INPUT} resize-none`} {...register('notes')} rows={3} placeholder="अतिरिक्त माहिती..." />
          </Label>
        </Card>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            <Save className="size-4" />
            {isSubmitting ? 'जतन होत आहे...' : 'नोंद जतन करा'}
          </button>
          <Link
            href="/utaras"
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
