'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'
import {
  createMastersWaterConnection,
  fetchMastersCitizensList,
  setMastersWaterConnectionStatus,
  type MastersWaterConnectionInput,
  type MastersWaterConnectionRecord,
  updateMastersWaterConnection,
} from '@/lib/masters-bulk-api'
import { pipeSizeLabel, waterConnectionStatusLabel, waterConnectionTypeLabel } from '@/lib/tax/labels'
import { Field, SubmitButton, TextareaField } from './form'

const PIPE_SIZES = [1.0, 1.5, 2.0, 2.5]
const CONNECTION_TYPES = ['regular', 'specialized']

type Props = {
  subdomain: string
  mode: 'create' | 'edit'
  initial?: MastersWaterConnectionRecord
}

export function MastersWaterConnectionForm({ subdomain, mode, initial }: Props) {
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
    queryKey: ['masters-water-citizens-options', subdomain, trimmedCitizenSearch],
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
    mutationFn: async (form: MastersWaterConnectionInput) => {
      const token = await getToken()
      return mode === 'create'
        ? createMastersWaterConnection(subdomain, form, token)
        : updateMastersWaterConnection(subdomain, initial!.id, {
          connectedAt: form.connectedAt,
          notes: form.notes,
        }, token)
    },
    onSuccess: (connection) => {
      gpToast.success(mode === 'create' ? 'पाणी जोडणी जतन झाली' : 'पाणी जोडणी अद्यतनित झाली')
      router.push(`/${subdomain}/admin/masters/water-connections/${connection.id}`)
      router.refresh()
    },
    onError: (error) => {
      gpToast.fromError(error, mode === 'create' ? 'Water connection create failed' : 'Water connection update failed')
    },
  })

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const token = await getToken()
      return setMastersWaterConnectionStatus(subdomain, initial!.id, status, token)
    },
    onSuccess: () => {
      gpToast.success('स्थिती अद्यतनित झाली')
      router.refresh()
    },
    onError: (error) => {
      gpToast.fromError(error, 'Status update failed')
    },
  })

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        const fd = new FormData(event.currentTarget)
        mutation.mutate({
          citizenId: String(fd.get('citizenId') ?? ''),
          connectionType: String(fd.get('connectionType') ?? ''),
          pipeSizeInch: Number(fd.get('pipeSizeInch') ?? 1),
          connectedAt: String(fd.get('connectedAt') ?? ''),
          notes: String(fd.get('notes') ?? ''),
        })
      }}
    >
      <div className="rounded-xl border border-gp-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gp-primary">
              {mode === 'create' ? 'नवीन पाणी जोडणी' : 'पाणी जोडणी तपशील'}
            </h1>
            <p className="text-sm text-gp-muted">
              {mode === 'create'
                ? 'ग्राहक क्रमांक प्रणालीने दिला जाईल.'
                : 'ग्राहक, प्रकार, आकार आणि क्रमांक लॉक आहेत; तारीख/नोंदी बदलू शकता.'}
            </p>
          </div>
          {initial && (
            <div className="text-right">
              <div className="rounded-full border border-gp-border bg-muted px-3 py-1 text-xs font-medium text-foreground">
                ग्राहक क्र. {initial.consumerNo}
              </div>
              <p className="mt-1 text-xs text-gp-muted">स्थिती: {waterConnectionStatusLabel(initial.status)}</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor="citizenId" className="text-xs font-medium text-foreground/80">
              नागरिक
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
                  id="citizenId"
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
                <input type="hidden" name="citizenId" value={selectedCitizenId} />
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
                {initial?.citizen.citizenNo} · {initial?.citizen.nameMr} · वार्ड {initial?.citizen.wardNumber}
                <input type="hidden" name="citizenId" value={initial?.citizen.id ?? ''} />
              </div>
            )}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="connectionType" className="text-xs font-medium text-foreground/80">
              जोडणी प्रकार
            </label>
            {mode === 'create' ? (
              <select
                id="connectionType"
                name="connectionType"
                defaultValue="regular"
                className="h-10 rounded-md border border-gp-border bg-card px-3 text-sm"
              >
                {CONNECTION_TYPES.map((type) => (
                  <option key={type} value={type}>{waterConnectionTypeLabel(type)}</option>
                ))}
              </select>
            ) : (
              <div className="rounded-md border border-gp-border bg-muted px-3 py-2 text-sm text-foreground">
                {waterConnectionTypeLabel(initial?.connectionType ?? '')}
                <input type="hidden" name="connectionType" value={initial?.connectionType ?? ''} />
              </div>
            )}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="pipeSizeInch" className="text-xs font-medium text-foreground/80">
              आकार
            </label>
            {mode === 'create' ? (
              <select
                id="pipeSizeInch"
                name="pipeSizeInch"
                defaultValue="1"
                className="h-10 rounded-md border border-gp-border bg-card px-3 text-sm"
              >
                {PIPE_SIZES.map((size) => (
                  <option key={size} value={size}>{pipeSizeLabel(size)}</option>
                ))}
              </select>
            ) : (
              <div className="rounded-md border border-gp-border bg-muted px-3 py-2 text-sm text-foreground">
                {pipeSizeLabel(initial?.pipeSizeInch ?? 1)}
                <input type="hidden" name="pipeSizeInch" value={String(initial?.pipeSizeInch ?? 1)} />
              </div>
            )}
          </div>

          <Field
            label="जोडणी दिनांक"
            name="connectedAt"
            type="date"
            defaultValue={initial?.connectedAt ?? ''}
          />
        </div>

        <div className="mt-4">
          <TextareaField
            label="नोंदी"
            name="notes"
            defaultValue={initial?.notes ?? ''}
            rows={4}
            placeholder="अतिरिक्त माहिती"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SubmitButton>{mutation.isPending ? 'जतन होत आहे…' : 'जतन करा'}</SubmitButton>
          {mode === 'edit' && initial && (
            <button
              type="button"
              onClick={() => statusMutation.mutate(initial.status === 'active' ? 'disconnected' : 'active')}
              disabled={statusMutation.isPending}
              className="rounded-md border border-gp-border px-4 py-2 text-sm font-medium hover:bg-gp-surface disabled:opacity-50"
            >
              {statusMutation.isPending
                ? 'स्थिती बदलत आहे…'
                : initial.status === 'active'
                  ? 'खंडित करा'
                  : 'पुन्हा सक्रिय करा'}
            </button>
          )}
          {mutation.isError && (
            <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
          )}
        </div>
      </div>
    </form>
  )
}
