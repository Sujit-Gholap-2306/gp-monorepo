import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { updateGpSettings } from '@/lib/actions/settings'

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const v = tenant.village ?? {}
  const c = tenant.contact ?? {}

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gp-primary">सेटिंग्ज</h1>
        <p className="text-sm text-gp-muted">ग्रामपंचायत माहिती</p>
      </div>

      <form
        action={async (formData) => {
          'use server'
          await updateGpSettings(subdomain, formData)
        }}
        className="grid gap-6 max-w-xl"
      >
        {/* GP Name */}
        <Section title="ग्रामपंचायत नाव">
          <Field label="नाव (मराठी) *" name="name_mr" defaultValue={tenant.name_mr} required />
          <Field label="Name (English) *" name="name_en" defaultValue={tenant.name_en} required />
          <Field label="स्थापना वर्ष" name="established" type="date" defaultValue={tenant.established ?? ''} />
        </Section>

        {/* Logo */}
        <Section title="लोगो">
          {tenant.logo_url && (
            <img src={tenant.logo_url} alt="logo" className="w-20 h-20 object-contain rounded border border-gp-border mb-2" />
          )}
          <input type="file" name="logo" accept="image/*" className="text-sm" />
        </Section>

        {/* Village */}
        <Section title="गाव माहिती">
          <div className="grid grid-cols-2 gap-3">
            <Field label="गाव (मराठी)" name="village_name_mr" defaultValue={v.name_mr ?? ''} />
            <Field label="Village (English)" name="village_name_en" defaultValue={v.name_en ?? ''} />
            <Field label="तालुका" name="taluka" defaultValue={v.taluka ?? ''} />
            <Field label="जिल्हा" name="district" defaultValue={v.district ?? ''} />
            <Field label="पिनकोड" name="pincode" defaultValue={v.pincode ?? ''} />
          </div>
        </Section>

        {/* Portal Configuration */}
        <Section title="पोर्टल कॉन्फिगरेशन">
          <Field 
            label="Portal Theme" 
            name="portal_theme" 
            defaultValue={tenant.portalTheme ?? 'civic-elegant'} 
            as="select"
          >
            <option value="civic-elegant">Civic Elegant</option>
            <option value="sahyadri-pine">Sahyadri Pine</option>
            <option value="koyna-saffron">Koyna Saffron</option>
          </Field>
        </Section>

        {/* Contact */}
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
          className="rounded-md bg-gp-primary text-white px-5 py-2 text-sm font-medium hover:bg-gp-primary-hover transition-colors w-fit"
        >
          जतन करा
        </button>
      </form>
    </div>
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

function Field({
  label, name, defaultValue = '', required = false, type = 'text', children, as = 'input',
}: {
  label: string; 
  name: string; 
  defaultValue?: string; 
  required?: boolean; 
  type?: string;
  children?: React.ReactNode;
  as?: 'input' | 'select';
}) {
  const commonProps = {
    id: name, 
    name: name, 
    defaultValue: defaultValue, 
    required: required,
    className: "rounded-md border border-gp-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary bg-background"
  }

  return (
    <div className="grid gap-1">
      <label htmlFor={name} className="text-xs font-medium text-gp-muted">{label}</label>
      {as === 'select' ? (
        <select {...commonProps as any}>
          {children}
        </select>
      ) : (
        <input
          {...commonProps}
          type={type}
        />
      )}
    </div>
  )
}
