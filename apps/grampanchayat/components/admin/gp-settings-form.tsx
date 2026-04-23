'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { getGrampanchayatApiBaseUrl } from '@/lib/grampanchayat-api'
import { getShowStatsStrip, type PortalConfig } from '@/lib/portal-config'
import type { ContactInfo, GpTenant, VillageInfo } from '@/lib/types'

type Props = { subdomain: string; tenant: GpTenant }

export function GpSettingsForm({ subdomain, tenant }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const v: VillageInfo = tenant.village ?? {}
  const c: ContactInfo = tenant.contact ?? {}
  const p: PortalConfig = tenant.portal_config ?? {}
  const f = tenant.feature_flags

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setError('You must be logged in.')
      setSaving(false)
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)
    const base = getGrampanchayatApiBaseUrl()
    const res = await fetch(
      `${base}/api/v1/tenants/${encodeURIComponent(subdomain)}/settings`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      }
    )

    if (!res.ok) {
      let msg = `Save failed (${res.status})`
      try {
        const j = (await res.json()) as { message?: string; success?: boolean }
        if (j.message) msg = j.message
      } catch {
        // ignore
      }
      setError(msg)
      setSaving(false)
      return
    }

    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 max-w-2xl">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Section title="ग्रामपंचायत नाव">
        <Field label="नाव (मराठी) *" name="name_mr" defaultValue={tenant.name_mr} required />
        <Field label="Name (English) *" name="name_en" defaultValue={tenant.name_en} required />
        <Field label="स्थापना वर्ष" name="established" type="date" defaultValue={tenant.established ?? ''} />
      </Section>

      <Section title="लोगो">
        {tenant.logo_url && (
          <img
            src={tenant.logo_url}
            alt="logo"
            className="w-20 h-20 object-contain rounded border border-gp-border mb-2"
          />
        )}
        <input type="file" name="logo" accept="image/*" className="text-sm" />
      </Section>

      <Section title="गाव माहिती">
        <div className="grid grid-cols-2 gap-3">
          <Field label="गाव (मराठी)" name="village_name_mr" defaultValue={v.name_mr ?? ''} />
          <Field label="Village (English)" name="village_name_en" defaultValue={v.name_en ?? ''} />
          <Field label="तालुका" name="taluka" defaultValue={v.taluka ?? ''} />
          <Field label="जिल्हा" name="district" defaultValue={v.district ?? ''} />
          <Field label="पिनकोड" name="pincode" defaultValue={v.pincode ?? ''} />
        </div>
      </Section>

      <Section title="पोर्टल — थीम">
        <Field label="Portal Theme" name="portal_theme" defaultValue={tenant.portal_theme} as="select">
          <option value="civic-elegant">Civic Elegant</option>
          <option value="sahyadri-pine">Sahyadri Pine</option>
          <option value="koyna-saffron">Koyna Saffron</option>
        </Field>
      </Section>

      <Section title="पोर्टल — झेंडे (सार्वजनिक सायट)">
        <p className="text-xs text-gp-muted -mt-1 mb-1">
          Premium / स preview अनुभाग — भविष्यात थीम पृष्ठांवर वापरले जाईल.
        </p>
        <CheckField
          name="feature_showProgress"
          label="Show progress (preview sections)"
          defaultChecked={f.showProgress}
        />
        <CheckField
          name="feature_showMap"
          label="Show map (preview / civic)"
          defaultChecked={f.showMap}
        />
        <CheckField
          name="feature_showAchievements"
          label="Show achievements (preview)"
          defaultChecked={f.showAchievements}
        />
      </Section>

      <Section title="पोर्टल — मुखपृष्ठ व SEO">
        <TextArea
          label="Hero tagline (मराठी)"
          name="portal_hero_tagline_mr"
          defaultValue={(p.hero_tagline_mr as string | undefined) ?? ''}
        />
        <TextArea
          label="Hero tagline (English)"
          name="portal_hero_tagline_en"
          defaultValue={(p.hero_tagline_en as string | undefined) ?? ''}
        />
        <CheckField
          name="portal_show_stats"
          label="Show home stats strip (घोषणा, कार्यक्रम, …)"
          defaultChecked={getShowStatsStrip(p)}
        />
        <Field
          label="Hero background image URL (optional)"
          name="portal_hero_bg_url"
          defaultValue={(p.hero_background_image_url as string | undefined) ?? ''}
        />
        <p className="text-xs text-gp-muted col-span-1 -mt-2">Open Graph & search</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            name="portal_meta_title_mr"
            label="Meta title (मराठी)"
            defaultValue={(p.meta_title_mr as string | undefined) ?? ''}
          />
          <Field
            name="portal_meta_title_en"
            label="Meta title (English)"
            defaultValue={(p.meta_title_en as string | undefined) ?? ''}
          />
        </div>
        <TextArea
          label="Meta description (मराठी)"
          name="portal_meta_desc_mr"
          defaultValue={(p.meta_description_mr as string | undefined) ?? ''}
        />
        <TextArea
          label="Meta description (English)"
          name="portal_meta_desc_en"
          defaultValue={(p.meta_description_en as string | undefined) ?? ''}
        />
        <Field
          label="OG / social image URL (https recommended)"
          name="portal_og_image_url"
          defaultValue={(p.og_image_url as string | undefined) ?? ''}
        />
      </Section>

      <Section title="संपर्क">
        <div className="grid grid-cols-2 gap-3">
          <Field label="फोन" name="phone" defaultValue={c.phone ?? ''} />
          <Field label="ईमेल" name="email" type="email" defaultValue={c.email ?? ''} />
          <Field label="पत्ता (मराठी)" name="address_mr" defaultValue={c.address_mr ?? ''} />
          <Field label="Address (English)" name="address_en" defaultValue={c.address_en ?? ''} />
        </div>
      </Section>

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-gp-primary text-white px-5 py-2 text-sm font-medium hover:bg-gp-primary-hover transition-colors w-fit disabled:opacity-60"
      >
        {saving ? 'जतन होत आहे...' : 'जतन करा'}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-gp-border p-5 grid gap-3">
      <h2 className="font-semibold text-sm border-b border-gp-border pb-2">{title}</h2>
      {children}
    </div>
  )
}

function CheckField({
  name,
  label,
  defaultChecked,
}: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="rounded border-gp-border"
      />
      <span className="text-foreground">{label}</span>
    </label>
  )
}

function Field({
  label, name, defaultValue = '', required = false, type = 'text', children, as = 'input',
}: {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  type?: string
  children?: React.ReactNode
  as?: 'input' | 'select'
}) {
  const commonProps = {
    id: name,
    name: name,
    defaultValue: defaultValue,
    required: required,
    className: 'rounded-md border border-gp-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary bg-background',
  }

  return (
    <div className="grid gap-1">
      <label htmlFor={name} className="text-xs font-medium text-gp-muted">
        {label}
      </label>
      {as === 'select' ? (
        <select {...(commonProps as object)}>{children}</select>
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  )
}

function TextArea({
  label, name, defaultValue = '',
}: { label: string; name: string; defaultValue?: string }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={name} className="text-xs font-medium text-gp-muted">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="rounded-md border border-gp-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary bg-background resize-y min-h-16"
      />
    </div>
  )
}
