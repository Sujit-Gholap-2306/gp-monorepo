'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'
import {
  createMastersCitizen,
  type MastersCitizenInput,
  type MastersCitizenRecord,
  updateMastersCitizen,
} from '@/lib/masters-bulk-api'
import { Field, SubmitButton, TextareaField } from './form'

type Props = {
  subdomain: string
  mode: 'create' | 'edit'
  initial?: MastersCitizenRecord
}

export function MastersCitizenForm({ subdomain, mode, initial }: Props) {
  const router = useRouter()

  async function getToken() {
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('You must be logged in.')
    return session.access_token
  }

  const mutation = useMutation({
    mutationFn: async (form: MastersCitizenInput) => {
      const token = await getToken()
      return mode === 'create'
        ? createMastersCitizen(subdomain, form, token)
        : updateMastersCitizen(subdomain, initial!.id, form, token)
    },
    onSuccess: (citizen) => {
      gpToast.success(mode === 'create' ? 'नागरिक नोंद जतन झाली' : 'नागरिक नोंद अद्यतनित झाली')
      router.push(`/${subdomain}/admin/masters/citizens/${citizen.id}`)
      router.refresh()
    },
    onError: (error) => {
      gpToast.fromError(error, mode === 'create' ? 'Citizen create failed' : 'Citizen update failed')
    },
  })

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        const fd = new FormData(event.currentTarget)
        mutation.mutate({
          nameMr: String(fd.get('nameMr') ?? ''),
          nameEn: String(fd.get('nameEn') ?? ''),
          mobile: String(fd.get('mobile') ?? ''),
          wardNumber: String(fd.get('wardNumber') ?? ''),
          addressMr: String(fd.get('addressMr') ?? ''),
          aadhaarLast4: String(fd.get('aadhaarLast4') ?? ''),
          householdId: String(fd.get('householdId') ?? ''),
        })
      }}
    >
      <div className="rounded-xl border border-gp-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gp-primary">
              {mode === 'create' ? 'नवीन नागरिक' : 'नागरिक तपशील'}
            </h1>
            <p className="text-sm text-gp-muted">
              {mode === 'create'
                ? 'एकच नोंद जोडा. क्रमांक प्रणालीने दिला जाईल.'
                : 'क्रमांक लॉक आहे; इतर तपशील बदलू शकता.'}
            </p>
          </div>
          {initial && (
            <span className="rounded-full border border-gp-border bg-muted px-3 py-1 text-xs font-medium text-foreground">
              क्र. {initial.citizenNo}
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="नाव (मराठी)"
            name="nameMr"
            required
            defaultValue={initial?.nameMr ?? ''}
            placeholder="उदा. सोपान पाटील"
            hint="किमान २ अक्षरे"
          />
          <Field
            label="नाव (इंग्रजी)"
            name="nameEn"
            defaultValue={initial?.nameEn ?? ''}
            placeholder="Sopan Patil"
          />
          <Field
            label="मोबाईल"
            name="mobile"
            required
            type="tel"
            defaultValue={initial?.mobile ?? ''}
            placeholder="10 digits"
            hint="१० अंकी क्रमांक"
          />
          <Field
            label="वार्ड"
            name="wardNumber"
            required
            defaultValue={initial?.wardNumber ?? ''}
            placeholder="उदा. १"
          />
          <Field
            label="आधार शेवटचे ४"
            name="aadhaarLast4"
            defaultValue={initial?.aadhaarLast4 ?? ''}
            placeholder="1234"
          />
          <Field
            label="कुटुंब ID"
            name="householdId"
            defaultValue={initial?.householdId ?? ''}
            placeholder="उदा. H-005"
          />
        </div>

        <div className="mt-4">
          <TextareaField
            label="पत्ता"
            name="addressMr"
            defaultValue={initial?.addressMr ?? ''}
            rows={4}
            placeholder="पूर्ण पत्ता"
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <SubmitButton>{mutation.isPending ? 'जतन होत आहे…' : 'जतन करा'}</SubmitButton>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error).message}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
