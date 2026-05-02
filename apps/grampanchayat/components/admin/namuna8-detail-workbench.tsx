'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Printer, RotateCcw } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Namuna8ListItem, Namuna8RateMasterStatus } from '@/lib/api/namuna8'
import {
  applyNamuna8Draft,
  type Namuna8PrintDraft,
} from '@/lib/namuna8/print-draft'
import { setNamuna8PrintDraft } from '@/lib/namuna8/print-draft-memory'
import {
  Namuna8UtaraTable,
  UTARA_PRESET_VERTICAL_LONG_LABELS,
} from '@/components/admin/namuna8-utara-table'
import { RateMasterWarning } from '@/components/admin/rate-master-warning'

type Props = {
  subdomain: string
  property: Namuna8ListItem
  rateMaster: Namuna8RateMasterStatus
  tenantName?: string
}

type DraftForm = {
  ownerNameMr: string
  ownerNameEn: string
  occupantName: string
  houseRupees: string
  lightingRupees: string
  sanitationRupees: string
  notes: string
}

function toRupeesInput(paise: number): string {
  return (paise / 100).toFixed(2)
}

function toPaiseFromInput(value: string, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.round(parsed * 100)
}

function initialDraftForm(property: Namuna8ListItem): DraftForm {
  return {
    ownerNameMr: property.owner.nameMr,
    ownerNameEn: property.owner.nameEn ?? '',
    occupantName: property.occupantName,
    houseRupees: toRupeesInput(property.heads.housePaise),
    lightingRupees: toRupeesInput(property.heads.lightingPaise),
    sanitationRupees: toRupeesInput(property.heads.sanitationPaise),
    notes: '',
  }
}

function formatINR(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function Namuna8DetailWorkbench({ subdomain, property, rateMaster, tenantName }: Props) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [form, setForm] = useState<DraftForm>(() => initialDraftForm(property))
  const previewReportDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    []
  )

  const draft: Namuna8PrintDraft = useMemo(() => ({
    ownerNameMr: form.ownerNameMr,
    ownerNameEn: form.ownerNameEn || undefined,
    occupantName: form.occupantName,
    housePaise: toPaiseFromInput(form.houseRupees, property.heads.housePaise),
    lightingPaise: toPaiseFromInput(form.lightingRupees, property.heads.lightingPaise),
    sanitationPaise: toPaiseFromInput(form.sanitationRupees, property.heads.sanitationPaise),
    notes: form.notes || undefined,
  }), [form, property])

  const preview = useMemo(() => applyNamuna8Draft(property, draft), [property, draft])
  const printHref = `/${subdomain}/admin/namuna8/${property.id}/print`
  const capitalValue = preview.valuation.capitalValueRupees
  const houseTaxRupees = preview.heads.housePaise / 100
  const effectiveRatePerThousand = capitalValue > 0
    ? (houseTaxRupees * 1000) / capitalValue
    : null

  const fadeIn = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } }
  const fieldClass = 'h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm'
  const areaFieldClass = 'w-full rounded-md border border-gp-border bg-white px-2 py-2 text-sm'

  return (
    <div className="space-y-5">
      <motion.div
        {...fadeIn}
        className="rounded-xl border border-gp-border bg-card p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gp-primary">नमुना ८ — तपशील व प्रिंट ड्राफ्ट</h1>
            <p className="text-sm text-gp-muted">
              Step 1: Draft भरा → Step 2: Preview पहा → Step 3: तुमच्या confirmation नंतर final print
            </p>
          </div>
          <p className="text-xs text-gp-muted">Draft browser मध्ये save होत नाही. हा edit temporary आहे.</p>
        </div>
      </motion.div>

      <RateMasterWarning rateMaster={rateMaster} variant="detail" />

      <div className="grid gap-5 lg:grid-cols-[1.25fr,1fr]">
        <motion.section {...fadeIn} className="rounded-xl border border-gp-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Print Draft Inputs</h2>
          <p className="mb-3 text-xs text-gp-muted">
            खाली फक्त बदलणारे fields ठेवा: मालक/भोगवटादार + tax heads. बाकी मालमत्ता माहिती API मधूनच येईल.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="मालक नाव (मराठी)">
              <input value={form.ownerNameMr} onChange={(e) => setForm((p) => ({ ...p, ownerNameMr: e.target.value }))} className={fieldClass} />
            </Field>
            <Field label="मालक नाव (English)">
              <input value={form.ownerNameEn} onChange={(e) => setForm((p) => ({ ...p, ownerNameEn: e.target.value }))} className={fieldClass} />
            </Field>
            <Field label="भोगवटादार">
              <input value={form.occupantName} onChange={(e) => setForm((p) => ({ ...p, occupantName: e.target.value }))} className={fieldClass} />
            </Field>
          </div>

          <div className="mt-4 border-t border-gp-border pt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Tax Heads (₹)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="घरपट्टी">
                <input value={form.houseRupees} onChange={(e) => setForm((p) => ({ ...p, houseRupees: e.target.value }))} className={fieldClass} inputMode="decimal" />
              </Field>
              <Field label="दिवाबत्ती">
                <input value={form.lightingRupees} onChange={(e) => setForm((p) => ({ ...p, lightingRupees: e.target.value }))} className={fieldClass} inputMode="decimal" />
              </Field>
              <Field label="स्वच्छता">
                <input value={form.sanitationRupees} onChange={(e) => setForm((p) => ({ ...p, sanitationRupees: e.target.value }))} className={fieldClass} inputMode="decimal" />
              </Field>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-gp-border bg-gp-surface p-3">
            <h3 className="text-sm font-semibold text-foreground">घरपट्टी गणना (Simple View)</h3>
            <p className="mt-1 text-xs text-gp-muted">घरपट्टी = भांडवली मूल्य × दर / 1000</p>
            <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
              <CalcItem label="भांडवली मूल्य" value={`₹ ${formatINR(capitalValue)}`} />
              <CalcItem
                label="प्रभावी दर"
                value={effectiveRatePerThousand === null ? '—' : `₹ ${formatINR(effectiveRatePerThousand)} प्रति 1000`}
              />
              <CalcItem label="घरपट्टी (ड्राफ्ट)" value={`₹ ${formatINR(houseTaxRupees)}`} />
              <CalcItem label="एकूण कर (ड्राफ्ट)" value={`₹ ${formatINR(preview.heads.totalPaise / 100)}`} />
            </div>
          </div>

          <div className="mt-4">
            <Field label="टीप (print वर दिसेल)">
              <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className={`${areaFieldClass} min-h-[72px]`} />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(initialDraftForm(property))
              }}
              className="inline-flex items-center gap-2 rounded-md border border-gp-border px-3 py-2 text-sm hover:bg-gp-surface"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              API values reset
            </button>
            <button
              type="button"
              onClick={() => {
                setNamuna8PrintDraft(property.id, draft)
                router.push(printHref)
              }}
              className="inline-flex items-center gap-2 rounded-md bg-gp-primary px-3 py-2 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Print preview
            </button>
          </div>
        </motion.section>

        <motion.aside {...fadeIn} className="rounded-xl border border-gp-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">नमुना ८ उतारा (Preview)</h2>
          <Namuna8UtaraTable
            data={preview}
            tenantName={tenantName}
            compact
            reportDateLabel={previewReportDate}
            verticalHeaders={UTARA_PRESET_VERTICAL_LONG_LABELS}
            valueRowHeight="compact"
          />
          <div className="mt-4 rounded-md border border-gp-border bg-gp-surface p-3 text-xs text-gp-muted">
            हा edit flow प्रिंटसाठी आहे. DB update endpoint आपण पुढच्या phase मध्ये confirm करून जोडू.
          </div>
          <a
            href={printHref}
            onClick={() => setNamuna8PrintDraft(property.id, draft)}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-gp-border px-3 py-2 text-sm hover:bg-gp-surface"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Open print layout
          </a>
        </motion.aside>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string, children: ReactNode }) {
  return (
    <label className="block text-xs text-gp-muted">
      <span>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function CalcItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="rounded border border-gp-border bg-white px-2 py-1.5">
      <p className="text-[11px] text-gp-muted">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
