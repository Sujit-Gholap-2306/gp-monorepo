'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'
import {
  createMastersProperty,
  fetchMastersCitizensList,
  type MastersPropertyInput,
  type MastersPropertyRecord,
  updateMastersProperty,
} from '@/lib/masters-bulk-api'
import { NAMUNA8_PROPERTY_TYPE_OPTIONS, propertyTypeLabel } from '@/lib/namuna8/property-type-options'
import { Field, SubmitButton, TextareaField } from './form'

const AGE_BRACKET_OPTIONS = ['0-2', '2-5', '5-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60+']

type Props = {
  subdomain: string
  mode: 'create' | 'edit'
  initial?: MastersPropertyRecord
}

function toOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  if (!text) return undefined
  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toOptionalInt(value: FormDataEntryValue | null) {
  const num = toOptionalNumber(value)
  return num == null ? undefined : Math.round(num)
}

export function MastersPropertyForm({ subdomain, mode, initial }: Props) {
  const router = useRouter()
  const [citizenSearch, setCitizenSearch] = useState('')
  const [selectedCitizenId, setSelectedCitizenId] = useState('')
  const deferredCitizenSearch = useDeferredValue(citizenSearch)
  const trimmedCitizenSearch = deferredCitizenSearch.trim()

  async function getToken() {
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('You must be logged in.')
    return session.access_token
  }

  const citizensQuery = useQuery({
    queryKey: ['masters-citizens-options', subdomain, trimmedCitizenSearch],
    enabled: trimmedCitizenSearch.length > 0,
    queryFn: async () => {
      const token = await getToken()
      return fetchMastersCitizensList(subdomain, token, { q: trimmedCitizenSearch })
    },
  })

  const citizenOptions = useMemo(() => {
    return citizensQuery.data ?? []
  }, [citizensQuery.data])

  const mutation = useMutation({
    mutationFn: async (form: MastersPropertyInput) => {
      const token = await getToken()
      return mode === 'create'
        ? createMastersProperty(subdomain, form, token)
        : updateMastersProperty(subdomain, initial!.id, form, token)
    },
    onSuccess: (property) => {
      gpToast.success(mode === 'create' ? 'मालमत्ता नोंद जतन झाली' : 'मालमत्ता नोंद अद्यतनित झाली')
      router.push(`/${subdomain}/admin/masters/properties/${property.id}`)
      router.refresh()
    },
    onError: (error) => {
      gpToast.fromError(error, mode === 'create' ? 'Property create failed' : 'Property update failed')
    },
  })

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        const fd = new FormData(event.currentTarget)
        mutation.mutate({
          ownerCitizenId: String(fd.get('ownerCitizenId') ?? ''),
          propertyType: String(fd.get('propertyType') ?? ''),
          occupantName: String(fd.get('occupantName') ?? ''),
          surveyNumber: String(fd.get('surveyNumber') ?? ''),
          plotOrGat: String(fd.get('plotOrGat') ?? ''),
          lengthFt: toOptionalNumber(fd.get('lengthFt')),
          widthFt: toOptionalNumber(fd.get('widthFt')),
          ageBracket: String(fd.get('ageBracket') ?? ''),
          resolutionRef: String(fd.get('resolutionRef') ?? ''),
          assessmentDate: String(fd.get('assessmentDate') ?? ''),
          lightingTaxPaise: toOptionalInt(fd.get('lightingTaxPaise')),
          sanitationTaxPaise: toOptionalInt(fd.get('sanitationTaxPaise')),
        })
      }}
    >
      <div className="rounded-xl border border-gp-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gp-primary">
              {mode === 'create' ? 'नवीन मालमत्ता' : 'मालमत्ता तपशील'}
            </h1>
            <p className="text-sm text-gp-muted">
              {mode === 'create'
                ? 'मालक निवडा आणि एकच मालमत्ता नोंद जोडा. क्रमांक प्रणालीने दिला जाईल.'
                : 'मालमत्ता क्रमांक आणि मालक लॉक आहेत; इतर तपशील बदलू शकता.'}
            </p>
          </div>
          {initial && (
            <span className="rounded-full border border-gp-border bg-muted px-3 py-1 text-xs font-medium text-foreground">
              क्र. {initial.propertyNo}
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor="ownerCitizenId" className="text-xs font-medium text-foreground/80">
              मालक
            </label>
            {mode === 'create' ? (
              <>
                <input
                  value={citizenSearch}
                  onChange={(event) => setCitizenSearch(event.target.value)}
                  placeholder="नाव / citizen no शोधा"
                  className="h-10 rounded-md border border-gp-border bg-card px-3 text-sm"
                />
                <select
                  id="ownerCitizenId"
                  value={selectedCitizenId}
                  onChange={(e) => setSelectedCitizenId(e.target.value)}
                  disabled={trimmedCitizenSearch.length === 0 || citizensQuery.isLoading}
                  className="h-10 rounded-md border border-gp-border bg-card px-3 text-sm"
                >
                  <option value="">
                    {trimmedCitizenSearch.length === 0 ? 'नाव / citizen no शोधा' : 'नागरिक निवडा'}
                  </option>
                  {citizenOptions.map((citizen) => (
                    <option key={citizen.id} value={citizen.id}>
                      {citizen.citizenNo} · {citizen.nameMr} · वार्ड {citizen.wardNumber}
                    </option>
                  ))}
                </select>
                {/* hidden input always submits selected value even when select is disabled */}
                <input type="hidden" name="ownerCitizenId" value={selectedCitizenId} />
                <p className="text-[11px] text-gp-muted">
                  {trimmedCitizenSearch.length === 0
                    ? 'नाव किंवा citizen no टाइप करा.'
                    : citizensQuery.isLoading
                      ? 'नागरिक शोधत आहोत…'
                      : citizenOptions.length > 0
                        ? `${citizenOptions.length} पर्याय`
                        : 'कोणताही नागरिक सापडला नाही.'}
                </p>
              </>
            ) : (
              <div className="rounded-md border border-gp-border bg-muted px-3 py-2 text-sm text-foreground">
                {initial?.owner.citizenNo} · {initial?.owner.nameMr} · वार्ड {initial?.owner.wardNumber}
                <input type="hidden" name="ownerCitizenId" value={initial?.owner.id ?? ''} />
              </div>
            )}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="propertyType" className="text-xs font-medium text-foreground/80">
              मालमत्ता प्रकार
            </label>
            <select
              id="propertyType"
              name="propertyType"
              required
              defaultValue={initial?.propertyType ?? NAMUNA8_PROPERTY_TYPE_OPTIONS[0]?.value}
              className="h-10 rounded-md border border-gp-border bg-card px-3 text-sm"
            >
              {NAMUNA8_PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <Field
            label="रहिवासी / भोगवटादार"
            name="occupantName"
            required
            defaultValue={initial?.occupantName ?? ''}
          />
          <Field
            label="सर्व्हे नं"
            name="surveyNumber"
            defaultValue={initial?.surveyNumber ?? ''}
          />
          <Field
            label="गट / प्लॉट"
            name="plotOrGat"
            defaultValue={initial?.plotOrGat ?? ''}
          />
          <div className="grid gap-1.5">
            <label htmlFor="ageBracket" className="text-xs font-medium text-foreground/80">
              वयोगट
            </label>
            <select
              id="ageBracket"
              name="ageBracket"
              defaultValue={initial?.ageBracket ?? ''}
              className="h-10 rounded-md border border-gp-border bg-card px-3 text-sm"
            >
              <option value="">निवडा</option>
              {AGE_BRACKET_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <Field
            label="लांबी (फूट)"
            name="lengthFt"
            type="number"
            defaultValue={initial?.lengthFt != null ? String(initial.lengthFt) : ''}
          />
          <Field
            label="रुंदी (फूट)"
            name="widthFt"
            type="number"
            defaultValue={initial?.widthFt != null ? String(initial.widthFt) : ''}
          />
          <Field
            label="ठराव संदर्भ"
            name="resolutionRef"
            defaultValue={initial?.resolutionRef ?? ''}
          />
          <Field
            label="मूल्यांकन दिनांक"
            name="assessmentDate"
            type="date"
            defaultValue={initial?.assessmentDate ?? ''}
          />
          <Field
            label="दिवाबत्ती override (paise)"
            name="lightingTaxPaise"
            type="number"
            defaultValue={initial?.lightingTaxPaise != null ? String(initial.lightingTaxPaise) : ''}
          />
          <Field
            label="स्वच्छता override (paise)"
            name="sanitationTaxPaise"
            type="number"
            defaultValue={initial?.sanitationTaxPaise != null ? String(initial.sanitationTaxPaise) : ''}
          />
        </div>

        {initial && (
          <div className="mt-4 rounded-md border border-gp-border/70 bg-muted/30 px-3 py-2 text-xs text-gp-muted">
            सध्याचा प्रकार: {propertyTypeLabel(initial.propertyType)}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <SubmitButton>{mutation.isPending ? 'जतन होत आहे…' : 'जतन करा'}</SubmitButton>
          {mutation.isError && (
            <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
          )}
        </div>
      </div>
    </form>
  )
}
