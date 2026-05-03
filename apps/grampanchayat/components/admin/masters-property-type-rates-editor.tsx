'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'
import {
  fetchMastersPropertyTypeRatesList,
  saveMastersPropertyTypeRates,
  type MastersPropertyTypeRateInput,
} from '@/lib/masters-bulk-api'
import { NAMUNA8_PROPERTY_TYPE_OPTIONS, propertyTypeLabel } from '@/lib/namuna8/property-type-options'

type EditableRow = {
  propertyType: string
  minRate: string
  maxRate: string
  landRatePerSqft: string
  constructionRatePerSqft: string
  newConstructionRatePerSqft: string
  defaultLightingPaise: string
  defaultSanitationPaise: string
}

function normalizeRateRows(rows: Awaited<ReturnType<typeof fetchMastersPropertyTypeRatesList>>): EditableRow[] {
  const byType = new Map(rows.map((row) => [row.propertyType, row]))
  return NAMUNA8_PROPERTY_TYPE_OPTIONS.map((option) => {
    const row = byType.get(option.value)
    return {
      propertyType: option.value,
      minRate: row?.minRate ?? '',
      maxRate: row?.maxRate ?? '',
      landRatePerSqft: row?.landRatePerSqft ?? '',
      constructionRatePerSqft: row?.constructionRatePerSqft ?? '',
      newConstructionRatePerSqft: row?.newConstructionRatePerSqft ?? '',
      defaultLightingPaise: row?.defaultLightingPaise != null ? String(row.defaultLightingPaise) : '',
      defaultSanitationPaise: row?.defaultSanitationPaise != null ? String(row.defaultSanitationPaise) : '',
    }
  })
}

function toNumberOrNull(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function MastersPropertyTypeRatesEditor({ subdomain }: { subdomain: string }) {
  const [rows, setRows] = useState<EditableRow[]>([])

  async function getToken() {
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('You must be logged in.')
    return session.access_token
  }

  const query = useQuery({
    queryKey: ['masters-property-type-rates-editor', subdomain],
    queryFn: async () => {
      const token = await getToken()
      return fetchMastersPropertyTypeRatesList(subdomain, token)
    },
  })

  useEffect(() => {
    if (query.data) setRows(normalizeRateRows(query.data))
  }, [query.data])

  const dirty = useMemo(() => {
    if (!query.data) return false
    return JSON.stringify(rows) !== JSON.stringify(normalizeRateRows(query.data))
  }, [query.data, rows])

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      const payload: MastersPropertyTypeRateInput[] = rows.map((row) => ({
        propertyType: row.propertyType,
        minRate: toNumberOrNull(row.minRate),
        maxRate: toNumberOrNull(row.maxRate),
        landRatePerSqft: toNumberOrNull(row.landRatePerSqft),
        constructionRatePerSqft: toNumberOrNull(row.constructionRatePerSqft),
        newConstructionRatePerSqft: toNumberOrNull(row.newConstructionRatePerSqft),
        defaultLightingPaise: toNumberOrNull(row.defaultLightingPaise),
        defaultSanitationPaise: toNumberOrNull(row.defaultSanitationPaise),
      }))
      return saveMastersPropertyTypeRates(subdomain, payload, token)
    },
    onSuccess: (saved) => {
      setRows(normalizeRateRows(saved))
      query.refetch()
      gpToast.success('मालमत्ता प्रकार दर जतन झाले')
    },
    onError: (error) => {
      gpToast.fromError(error, 'Property rate save failed')
    },
  })

  if (query.isLoading && rows.length === 0) {
    return <div className="rounded-lg border border-gp-border bg-card px-4 py-8 text-sm text-gp-muted">लोड होत आहे…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">मास्टर्स — मालमत्ता प्रकार दर</h1>
          <p className="text-sm text-gp-muted">
            ५ प्रकारांसाठी एकत्रित दर नोंदवा. {dirty ? 'अद्याप न जतन केलेले बदल आहेत.' : 'सर्व बदल जतन झाले आहेत.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || rows.length === 0}
          className="rounded-md bg-gp-primary px-4 py-2 text-sm font-medium text-gp-primary-fg disabled:opacity-50"
        >
          {mutation.isPending ? 'जतन होत आहे…' : 'जतन करा'}
        </button>
      </div>

      <div className="overflow-auto rounded-lg border border-gp-border bg-card">
        <table className="w-full min-w-[70rem] text-sm">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="px-3 py-2 font-medium">मालमत्ता प्रकार</th>
              <th className="px-3 py-2 font-medium">किमान</th>
              <th className="px-3 py-2 font-medium">कमाल</th>
              <th className="px-3 py-2 font-medium">जमीन दर</th>
              <th className="px-3 py-2 font-medium">बांधकाम दर</th>
              <th className="px-3 py-2 font-medium">नवीन बांधकाम दर</th>
              <th className="px-3 py-2 font-medium">दिवाबत्ती</th>
              <th className="px-3 py-2 font-medium">स्वच्छता</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.propertyType} className="border-t border-gp-border">
                <td className="px-3 py-2 font-medium">{propertyTypeLabel(row.propertyType)}</td>
                {([
                  'minRate',
                  'maxRate',
                  'landRatePerSqft',
                  'constructionRatePerSqft',
                  'newConstructionRatePerSqft',
                  'defaultLightingPaise',
                  'defaultSanitationPaise',
                ] as const).map((field) => (
                  <td key={field} className="px-3 py-2">
                    <input
                      value={row[field]}
                      onChange={(event) => {
                        const value = event.target.value
                        setRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, [field]: value } : item
                          )
                        )
                      }}
                      className="h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
