'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Field, SelectField, FormSection, SubmitButton } from './form'
import { createPostHolder, updatePostHolder } from '@/lib/api/post-holders'
import { gpToast } from '@/lib/toast'
import type { PostHolder } from '@/lib/types'

interface Props {
  subdomain: string
  postHolderId?: string
  defaultValues?: Partial<PostHolder>
  submitLabel?: string
}

async function uploadToGpMedia(subdomain: string, folder: 'events', file: File): Promise<string> {
  const fd = new FormData()
  fd.set('subdomain', subdomain)
  fd.set('folder', folder)
  fd.set('file', file)
  const res = await fetch('/api/gp/media/upload', { method: 'POST', body: fd, credentials: 'include' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { message?: string }).message ?? 'Upload failed')
  }
  return (json as { url: string }).url
}

export function PostHolderForm({
  subdomain,
  postHolderId,
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
    const photo = fd.get('photo') as File | null

    try {
      let photoUrl: string | null | undefined = d.photo_url ?? null
      if (photo && photo.size > 0) {
        photoUrl = await uploadToGpMedia(subdomain, 'events', photo)
      }

      const base = {
        nameMr: (fd.get('name_mr') as string) || '',
        nameEn: (fd.get('name_en') as string) || '',
        postMr: (fd.get('post_mr') as string) || '',
        postEn: (fd.get('post_en') as string) || '',
        phone: (fd.get('phone') as string) || null,
        sortOrder: Number(fd.get('sort_order') ?? 0),
        isActive: d.id ? fd.get('is_active') === 'true' : true,
      }

      if (postHolderId) {
        const payload: Record<string, unknown> = {
          ...base,
          isActive: fd.get('is_active') === 'true',
        }
        if (photo && photo.size > 0) payload.photoUrl = photoUrl
        await updatePostHolder(subdomain, postHolderId, payload)
      } else {
        await createPostHolder(subdomain, {
          ...base,
          photoUrl: photoUrl && photoUrl.length > 0 ? photoUrl : null,
        })
      }
      router.push(`/${subdomain}/admin/post-holders`)
      router.refresh()
    } catch (err) {
      gpToast.error(err instanceof Error ? err.message : 'जतन अयशस्वी')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 max-w-2xl">
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

      <SubmitButton>
        {pending ? '…' : submitLabel}
      </SubmitButton>
    </form>
  )
}
