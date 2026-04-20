'use client'

import { Field, TextareaField, SelectField, FormSection, SubmitButton } from './form'
import type { GpEvent } from '@/lib/types'

interface Props {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<GpEvent>
  submitLabel?: string
}

export function EventForm({ action, defaultValues: d = {}, submitLabel = 'जतन करा' }: Props) {
  return (
    <form action={action} className="grid gap-5 max-w-2xl">
      <FormSection title="कार्यक्रमाची माहिती" description="शीर्षक व तारीख">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="शीर्षक (मराठी) *" name="title_mr" defaultValue={d.title_mr} required />
          <Field label="Title (English) *" name="title_en" defaultValue={d.title_en} required />
        </div>
        <Field label="तारीख *" name="event_date" type="date" defaultValue={d.event_date} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="ठिकाण (मराठी)" name="location_mr" defaultValue={d.location_mr ?? ''} />
          <Field label="Location (English)" name="location_en" defaultValue={d.location_en ?? ''} />
        </div>
      </FormSection>

      <FormSection title="तपशील" description="कार्यक्रमाबद्दल अधिक माहिती">
        <TextareaField label="वर्णन (मराठी)" name="description_mr" defaultValue={d.description_mr ?? ''} rows={4} />
        <TextareaField label="Description (English)" name="description_en" defaultValue={d.description_en ?? ''} rows={4} />
      </FormSection>

      <FormSection title="प्रकाशन">
        <SelectField
          label="स्थिती"
          name="is_published"
          defaultValue={String(d.is_published ?? false)}
          options={[
            { value: 'false', label: 'मसुदा — खाजगी' },
            { value: 'true',  label: 'प्रकाशित — सार्वजनिक' },
          ]}
        />
      </FormSection>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  )
}
