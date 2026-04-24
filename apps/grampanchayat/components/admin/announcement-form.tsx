'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Field, TextareaField, SelectField, FormSection, SubmitButton } from './form'
import { createAnnouncement, updateAnnouncement } from '@/lib/api/announcements'
import { gpToast } from '@/lib/toast'
import type { Announcement } from '@/lib/types'

interface Props {
  subdomain: string
  announcementId?: string
  defaultValues?: Partial<Announcement>
  submitLabel?: string
}

export function AnnouncementForm({
  subdomain,
  announcementId,
  defaultValues: d = {},
  submitLabel = 'जतन करा',
}: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      titleMr: (fd.get('title_mr') as string) || '',
      titleEn: (fd.get('title_en') as string) || '',
      category: (fd.get('category') as string) || 'general',
      contentMr: (fd.get('content_mr') as string) || null,
      contentEn: (fd.get('content_en') as string) || null,
      docUrl: (fd.get('doc_url') as string) || null,
      isPublished: fd.get('is_published') === 'true',
    }
    try {
      if (announcementId) {
        await updateAnnouncement(subdomain, announcementId, payload)
      } else {
        await createAnnouncement(subdomain, payload)
      }
      router.push(`/${subdomain}/admin/announcements`)
      router.refresh()
    } catch (err) {
      gpToast.error(err instanceof Error ? err.message : 'जतन अयशस्वी')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 max-w-2xl">
      <FormSection title="मूळ माहिती" description="घोषणेचे शीर्षक व प्रकार">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="शीर्षक (मराठी) *" name="title_mr" defaultValue={d.title_mr} required />
          <Field label="Title (English) *" name="title_en" defaultValue={d.title_en} required />
        </div>
        <SelectField
          label="प्रकार"
          name="category"
          defaultValue={d.category ?? 'general'}
          options={[
            { value: 'general', label: 'सामान्य (General)' },
            { value: 'scheme',  label: 'योजना (Scheme)' },
            { value: 'notice',  label: 'सूचना (Notice)' },
          ]}
        />
      </FormSection>

      <FormSection title="मजकूर" description="तपशीलवार माहिती (दोन्ही भाषांमध्ये वैकल्पिक)">
        <TextareaField label="मजकूर (मराठी)" name="content_mr" defaultValue={d.content_mr ?? ''} rows={5} />
        <TextareaField label="Content (English)" name="content_en" defaultValue={d.content_en ?? ''} rows={5} />
        <Field
          label="दस्तऐवज URL"
          name="doc_url"
          type="url"
          defaultValue={d.doc_url ?? ''}
          placeholder="https://..."
          hint="PDF किंवा दस्तऐवज डाउनलोड दुवा"
        />
      </FormSection>

      <FormSection title="प्रकाशन" description="मसुदा म्हणून जतन करा किंवा लगेच प्रकाशित करा">
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

      <SubmitButton>
        {pending ? '…' : submitLabel}
      </SubmitButton>
    </form>
  )
}
