'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Field, TextareaField, SelectField, FormSection, SubmitButton } from './form'
import { createEvent, updateEvent } from '@/lib/api/events'
import { gpToast } from '@/lib/toast'
import type { GpEvent } from '@/lib/types'

interface Props {
  subdomain: string
  eventId?: string
  defaultValues?: Partial<GpEvent>
  submitLabel?: string
  /** After create, go to media upload page */
  redirectToMediaOnCreate?: boolean
}

export function EventForm({
  subdomain,
  eventId,
  defaultValues: d = {},
  submitLabel = 'जतन करा',
  redirectToMediaOnCreate = true,
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
      eventDate: (fd.get('event_date') as string) || '',
      locationMr: (fd.get('location_mr') as string) || null,
      locationEn: (fd.get('location_en') as string) || null,
      descriptionMr: (fd.get('description_mr') as string) || null,
      descriptionEn: (fd.get('description_en') as string) || null,
      isPublished: fd.get('is_published') === 'true',
    }
    try {
      if (eventId) {
        await updateEvent(subdomain, eventId, payload)
        router.push(`/${subdomain}/admin/events`)
      } else {
        const event = await createEvent(subdomain, payload) as { id: string }
        if (redirectToMediaOnCreate) {
          router.push(`/${subdomain}/admin/events/${event.id}/media`)
        } else {
          router.push(`/${subdomain}/admin/events`)
        }
      }
      router.refresh()
    } catch (err) {
      gpToast.error(err instanceof Error ? err.message : 'जतन अयशस्वी')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 max-w-2xl">
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

      <SubmitButton>
        {pending ? '…' : submitLabel}
      </SubmitButton>
    </form>
  )
}
