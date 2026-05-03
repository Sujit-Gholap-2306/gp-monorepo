'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'
import {
  fetchMastersWaterConnectionRatesList,
  saveMastersWaterConnectionRates,
  type MastersWaterConnectionRateInput,
} from '@/lib/masters-bulk-api'
import { pipeSizeLabel, waterConnectionTypeLabel } from '@/lib/tax/labels'
import { currentFiscalYear } from '@/lib/fiscal'

const PIPE_SIZES = [1.0, 1.5, 2.0, 2.5]
const CONNECTION_TYPES = ['regular', 'specialized'] as const

type CellState = Record<string, string>

function keyFor(type: string, size: number) {
  return `${type}::${size}`
}

export function MastersWaterConnectionRatesEditor({ subdomain }: { subdomain: string }) {
  const [fiscalYear, setFiscalYear] = useState(currentFiscalYear())
  const [cells, setCells] = useState<CellState>({})

  async function getToken() {
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('You must be logged in.')
    return session.access_token
  }

  const query = useQuery({
    queryKey: ['masters-water-rates-editor', subdomain, fiscalYear],
    queryFn: async () => {
      const token = await getToken()
      return fetchMastersWaterConnectionRatesList(subdomain, token, { fiscalYear })
    },
  })

  useEffect(() => {
    const next: CellState = {}
    for (const row of query.data ?? []) {
      next[keyFor(row.connectionType, row.pipeSizeInch)] = String(row.annualPaise)
    }
    setCells(next)
  }, [query.data])

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      const payload: MastersWaterConnectionRateInput[] = []
      for (const connectionType of CONNECTION_TYPES) {
        for (const pipeSizeInch of PIPE_SIZES) {
          const raw = cells[keyFor(connectionType, pipeSizeInch)] ?? ''
          const annualPaise = Number(raw)
          if (!Number.isFinite(annualPaise) || annualPaise <= 0) continue
          payload.push({ fiscalYear, connectionType, pipeSizeInch, annualPaise })
        }
      }
      return saveMastersWaterConnectionRates(subdomain, payload, token)
    },
    onSuccess: () => {
      query.refetch()
      gpToast.success('पाणी दर जतन झाले')
    },
    onError: (error) => {
      gpToast.fromError(error, 'Water rate save failed')
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">मास्टर्स — पाणी दर</h1>
          <p className="text-sm text-gp-muted">आर्थिक वर्षानुसार सर्व संयोजनांचे वार्षिक paise भरा.</p>
        </div>
        <div className="flex items-end gap-2">
          <label className="text-xs text-gp-muted">
            आर्थिक वर्ष
            <input
              value={fiscalYear}
              onChange={(event) => setFiscalYear(event.target.value)}
              className="mt-1 h-9 rounded-md border border-gp-border bg-card px-3 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="h-9 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg disabled:opacity-50"
          >
            {mutation.isPending ? 'जतन होत आहे…' : 'जतन करा'}
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-gp-border bg-card">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="px-3 py-2 font-medium">आकार</th>
              {CONNECTION_TYPES.map((type) => (
                <th key={type} className="px-3 py-2 font-medium">{waterConnectionTypeLabel(type)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PIPE_SIZES.map((size) => (
              <tr key={size} className="border-t border-gp-border">
                <td className="px-3 py-2 font-medium">{pipeSizeLabel(size)}</td>
                {CONNECTION_TYPES.map((type) => {
                  const key = keyFor(type, size)
                  return (
                    <td key={key} className="px-3 py-2">
                      <input
                        value={cells[key] ?? ''}
                        onChange={(event) => setCells((current) => ({ ...current, [key]: event.target.value }))}
                        placeholder="annual paise"
                        className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
