'use client'

import { Field, SelectField, FormSection, SubmitButton } from './form'
import type { PostHolder } from '@/lib/types'

interface Props {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<PostHolder>
  submitLabel?: string
}

export function PostHolderForm({ action, defaultValues: d = {}, submitLabel = 'जतन करा' }: Props) {
  return (
    <form action={action} className="grid gap-5 max-w-2xl">
      <FormSection title="व्यक्तिगत माहिती" description="पदाधिकाऱ्याचे नाव व पद">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="नाव (मराठी) *" name="name_mr" defaultValue={d.name_mr} required />
          <Field label="Name (English) *" name="name_en" defaultValue={d.name_en} required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="पद (मराठी) *" name="post_mr" defaultValue={d.post_mr} required />
          <Field label="Post (English) *" name="post_en" defaultValue={d.post_en} required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="फोन" name="phone" type="tel" defaultValue={d.phone ?? ''} />
          <Field label="क्रम" name="sort_order" type="number" defaultValue={String(d.sort_order ?? 0)} hint="यादीमध्ये दाखविण्याचा क्रम" />
        </div>
      </FormSection>

      <FormSection title="छायाचित्र" description="पदाधिकाऱ्याचा फोटो (वैकल्पिक)">
        {d.photo_url && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={d.photo_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-gp-border"
            />
            <p className="text-xs text-gp-muted">सद्य फोटो</p>
          </div>
        )}
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gp-primary file:text-gp-primary-fg file:px-4 file:h-9 file:text-sm file:font-medium hover:file:bg-gp-primary-hover file:cursor-pointer file:transition-colors cursor-pointer"
        />
      </FormSection>

      {d.id && (
        <FormSection title="स्थिती">
          <SelectField
            label="पदावर सक्रिय"
            name="is_active"
            defaultValue={String(d.is_active ?? true)}
            options={[
              { value: 'true',  label: 'सक्रिय — सार्वजनिक पृष्ठावर दिसेल' },
              { value: 'false', label: 'निष्क्रिय — लपविलेला' },
            ]}
          />
        </FormSection>
      )}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  )
}
