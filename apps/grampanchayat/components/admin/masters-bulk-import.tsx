'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'
import {
  downloadMastersTemplateXlsx,
  fetchMastersCitizensList,
  fetchMastersPropertiesList,
  fetchMastersPropertyTypeRatesList,
  fetchMastersTemplateMeta,
  postMastersBulk,
} from '@/lib/masters-bulk-api'
import { Download } from 'lucide-react'

type Props = { subdomain: string }

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function formatRate(s: string | null | undefined) {
  if (s == null || s === '') return '—'
  return s
}

function formatPaise(v: number | null | undefined) {
  if (v == null) return '—'
  return `₹${(v / 100).toFixed(2)}`
}

export function MastersBulkImport({ subdomain }: Props) {
  const queryClient = useQueryClient()
  const [citizensFile, setCitizensFile] = useState<File | null>(null)
  const [propertiesFile, setPropertiesFile] = useState<File | null>(null)
  const [propertyTypeRatesFile, setPropertyTypeRatesFile] = useState<File | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<
    { row: number; message: string; fields?: { field: string; message: string }[] }[] | null
  >(null)
  const [activeTab, setActiveTab] = useState<'citizens' | 'properties' | 'propertyTypeRates'>('citizens')

  const getToken = async () => {
    const supabase = createSupabaseBrowserClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('You must be logged in.')
    return session.access_token
  }

  const metaQuery = useQuery({
    queryKey: ['masters-template-meta', subdomain],
    queryFn: async () => {
      const token = await getToken()
      return fetchMastersTemplateMeta(subdomain, token)
    },
    retry: 1,
  })

  const citizensListQuery = useQuery({
    queryKey: ['masters-citizens', subdomain],
    queryFn: async () => {
      const token = await getToken()
      return fetchMastersCitizensList(subdomain, token)
    },
  })

  const propertiesListQuery = useQuery({
    queryKey: ['masters-properties', subdomain],
    queryFn: async () => {
      const token = await getToken()
      return fetchMastersPropertiesList(subdomain, token)
    },
  })

  const propertyTypeRatesListQuery = useQuery({
    queryKey: ['masters-property-type-rates', subdomain],
    queryFn: async () => {
      const token = await getToken()
      return fetchMastersPropertyTypeRatesList(subdomain, token)
    },
  })

  useEffect(() => {
    if (!metaQuery.isError || !metaQuery.error) return
    gpToast.fromError(metaQuery.error, 'Failed to load import rules', { id: 'masters-template-meta' })
  }, [metaQuery.isError, metaQuery.error])

  const limits = metaQuery.data?.limits
  const citizensCols = metaQuery.data?.citizens.columns ?? []
  const propertiesCols = metaQuery.data?.properties.columns ?? []
  const propertyTypeRatesCols = metaQuery.data?.propertyTypeRates?.columns ?? []

  const downloadCit = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await downloadMastersTemplateXlsx('citizens', subdomain, token)
    },
    onError: (e) => gpToast.fromError(e, 'Could not download citizens template', { id: 'masters-dl-citizens' }),
  })

  const downloadProp = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await downloadMastersTemplateXlsx('properties', subdomain, token)
    },
    onError: (e) => gpToast.fromError(e, 'Could not download properties template', { id: 'masters-dl-properties' }),
  })

  const downloadPropertyTypeRates = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await downloadMastersTemplateXlsx('propertyTypeRates', subdomain, token)
    },
    onError: (e) =>
      gpToast.fromError(e, 'Could not download property tax rates template', { id: 'masters-dl-rates' }),
  })

  const citizensMut = useMutation({
    mutationFn: async () => {
      setLastError(null)
      setErrorDetails(null)
      const token = await getToken()
      if (!citizensFile) throw new Error('Choose a citizens file (.xlsx).')
      return postMastersBulk('citizens', subdomain, citizensFile, token)
    },
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['masters-citizens', subdomain] })
      gpToast.success(`${String(res.data?.inserted ?? 0)} नागरिक आयात झाले`, { id: 'masters-upload-citizens' })
    },
    onError: (e) => {
      const err = e as Error & {
        body?: { errors?: { row: number; message: string; fields?: { field: string; message: string }[] }[] }
      }
      setLastError(err.message)
      setErrorDetails(err.body?.errors ?? null)
      gpToast.fromError(e, 'Citizens upload failed', { id: 'masters-upload-citizens' })
    },
  })

  const propertiesMut = useMutation({
    mutationFn: async () => {
      setLastError(null)
      setErrorDetails(null)
      const token = await getToken()
      if (!propertiesFile) throw new Error('Choose a properties file (.xlsx).')
      return postMastersBulk('properties', subdomain, propertiesFile, token)
    },
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['masters-properties', subdomain] })
      gpToast.success(`${String(res.data?.inserted ?? 0)} मालमत्ता आयात झाल्या`, { id: 'masters-upload-properties' })
    },
    onError: (e) => {
      const err = e as Error & {
        body?: { errors?: { row: number; message: string; fields?: { field: string; message: string }[] }[] }
      }
      setLastError(err.message)
      setErrorDetails(err.body?.errors ?? null)
      gpToast.fromError(e, 'Properties upload failed', { id: 'masters-upload-properties' })
    },
  })

  const propertyTypeRatesMut = useMutation({
    mutationFn: async () => {
      setLastError(null)
      setErrorDetails(null)
      const token = await getToken()
      if (!propertyTypeRatesFile) throw new Error('Choose an Excel file (.xlsx).')
      return postMastersBulk('property-type-rates', subdomain, propertyTypeRatesFile, token)
    },
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['masters-property-type-rates', subdomain] })
      gpToast.success(
        `${String(res.data?.inserted ?? 0)} दर ओळी जतन केल्या (मालमत्ता प्रकार / कर दर)`,
        { id: 'masters-upload-rates' }
      )
    },
    onError: (e) => {
      const err = e as Error & {
        body?: { errors?: { row: number; message: string; fields?: { field: string; message: string }[] }[] }
      }
      setLastError(err.message)
      setErrorDetails(err.body?.errors ?? null)
      gpToast.fromError(e, 'Property tax rates upload failed', { id: 'masters-upload-rates' })
    },
  })

  return (
    <div className="w-full min-w-0 space-y-6">
      {metaQuery.isError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {(metaQuery.error as Error).message}
        </div>
      )}

      <p className="text-sm text-foreground/90">
        <strong>नागरिक</strong> → <strong>मालमत्ता</strong> → <strong>मालमत्ता प्रकार / कर दर</strong> (ऐच्छिक क्रम, दर
        tab वेगळा). मालक:{' '}
        <code className="rounded bg-muted px-1 text-xs">owner_citizen_no</code> = नागरिकातील{' '}
        <code className="rounded bg-muted px-1 text-xs">citizen_no</code>. दर: प्रति GP प्रति{' '}
        <code className="rounded bg-muted px-1 text-xs">property_type</code> कमाल ५ ओळी.
        {limits && (
          <span className="text-gp-muted">
            {' '}
            (फाइल कमाल {String(limits.maxFileMb)} MB, {String(limits.maxRows)} ओळी; दरात कमाल{' '}
            {String(metaQuery.data?.propertyTypeRates?.maxRows ?? 5)} ओळी; चूक झाल्यास पूर्ण फाइल नाकार)
          </span>
        )}
      </p>

      {lastError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <p className="font-medium">{lastError}</p>
          {errorDetails && errorDetails.length > 0 && (
            <ul className="mt-2 max-h-64 overflow-auto space-y-1 text-xs text-foreground">
              {errorDetails.map((e, i) => (
                <li key={i} className="border-t border-destructive/20 pt-1">
                  <span className="font-medium">Row {String(e.row)}:</span>{' '}
                  {e.fields && e.fields.length > 0
                    ? e.fields.map((f) => `${f.field}: ${f.message}`).join(' · ')
                    : e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gp-border bg-card">
        <div
          className="flex border-b border-gp-border bg-muted/20"
          role="tablist"
          aria-label="मास्टर आयात प्रकार"
        >
          <button
            type="button"
            role="tab"
            id="tab-citizens"
            aria-selected={activeTab === 'citizens'}
            aria-controls="panel-citizens"
            className={
              'min-h-11 flex-1 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ' +
              (activeTab === 'citizens'
                ? 'border-gp-primary text-gp-primary'
                : 'border-transparent text-gp-muted hover:text-foreground')
            }
            onClick={() => setActiveTab('citizens')}
          >
            नागरिक
            {citizensListQuery.data != null && (
              <span className="ml-1.5 text-xs font-normal text-gp-muted">({citizensListQuery.data.length})</span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            id="tab-properties"
            aria-selected={activeTab === 'properties'}
            aria-controls="panel-properties"
            className={
              'min-h-11 flex-1 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ' +
              (activeTab === 'properties'
                ? 'border-gp-primary text-gp-primary'
                : 'border-transparent text-gp-muted hover:text-foreground')
            }
            onClick={() => setActiveTab('properties')}
          >
            मालमत्ता
            {propertiesListQuery.data != null && (
              <span className="ml-1.5 text-xs font-normal text-gp-muted">({propertiesListQuery.data.length})</span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            id="tab-property-type-rates"
            aria-selected={activeTab === 'propertyTypeRates'}
            aria-controls="panel-property-type-rates"
            className={
              'min-h-11 flex-1 border-b-2 px-2 py-2.5 text-sm font-medium transition-colors ' +
              (activeTab === 'propertyTypeRates'
                ? 'border-gp-primary text-gp-primary'
                : 'border-transparent text-gp-muted hover:text-foreground')
            }
            onClick={() => setActiveTab('propertyTypeRates')}
            title="मालमत्ता प्रकारानुसार दर (जमिन / बांधकाम)"
          >
            कर दर
            {propertyTypeRatesListQuery.data != null && (
              <span className="ml-1.5 text-xs font-normal text-gp-muted">({propertyTypeRatesListQuery.data.length})</span>
            )}
          </button>
        </div>

        {activeTab === 'citizens' && (
          <div
            id="panel-citizens"
            role="tabpanel"
            aria-labelledby="tab-citizens"
            className="flex flex-col gap-4 p-4"
          >
            <p className="text-xs text-gp-muted">
              टेम्पलेट डाउनलोड → फाइल निवडा → अपलोड. खाली स्तंभ संदर्भ; सर्वात खाली सध्या सेवेतील नोंदी.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
              <button
                type="button"
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-gp-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-gp-surface disabled:opacity-50"
                disabled={downloadCit.isPending || metaQuery.isPending}
                onClick={() => downloadCit.mutate()}
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                {downloadCit.isPending ? 'Preparing…' : 'Excel टेम्पलेट डाउनलोड'}
              </button>
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="min-w-0 flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-gp-surface file:px-2 file:py-1 file:text-xs sm:min-w-[12rem] sm:max-w-md"
                onChange={(e) => setCitizensFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="w-fit rounded-md bg-gp-primary px-4 py-2 text-sm font-medium text-gp-primary-fg disabled:opacity-50"
                disabled={!citizensFile || citizensMut.isPending}
                onClick={() => citizensMut.mutate()}
              >
                {citizensMut.isPending ? 'Uploading…' : 'Excel अपलोड'}
              </button>
            </div>
            {citizensMut.isSuccess && citizensMut.data?.data && (
              <p className="text-sm text-emerald-700">+{String(citizensMut.data.data.inserted)} नागरिक जोडले.</p>
            )}
            <div>
              <h3 className="mb-1.5 text-xs font-medium text-gp-muted">Excel मधील स्तंभ (संदर्भ)</h3>
              <div className="overflow-x-auto rounded-md border border-gp-border/60">
                <table className="w-full min-w-lg text-left text-xs">
                  <thead>
                    <tr className="border-b border-gp-border bg-muted/40">
                      <th className="p-2 font-medium">Column</th>
                      <th className="p-2 font-medium">Rule</th>
                      <th className="p-2 font-medium">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metaQuery.isPending && (
                      <tr>
                        <td colSpan={3} className="p-2 text-gp-muted">
                          लोड होत आहे…
                        </td>
                      </tr>
                    )}
                    {citizensCols.map((c) => (
                      <tr key={c.key} className="border-b border-gp-border/50 last:border-0">
                        <td className="p-2 font-mono text-[11px]">{c.key}</td>
                        <td className="p-2 text-gp-muted">{c.hint}</td>
                        <td className="p-2 text-gp-muted">{c.required ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="min-h-0 flex flex-1 flex-col border-t border-gp-border/60 pt-3">
              <h3 className="mb-2 text-sm font-medium text-foreground">सध्या सेवेत असलेले नागरिक</h3>
              {citizensListQuery.isLoading && <p className="text-xs text-gp-muted">लोड होत आहे…</p>}
              {citizensListQuery.isError && (
                <p className="text-xs text-destructive">{(citizensListQuery.error as Error).message}</p>
              )}
              {citizensListQuery.data && citizensListQuery.data.length === 0 && !citizensListQuery.isLoading && (
                <p className="text-xs text-gp-muted">अद्याप कोणतेही नाहीत.</p>
              )}
              {citizensListQuery.data && citizensListQuery.data.length > 0 && (
                <div className="max-h-[min(70vh,36rem)] overflow-auto rounded-md border border-gp-border/60">
                  <table className="w-full min-w-[64rem] text-left text-xs">
                    <thead>
                      <tr className="sticky top-0 border-b border-gp-border bg-muted/90 backdrop-blur">
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">क्रमांक</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">Excel: citizen_no</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">नाव (मराठी)</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">name_mr</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">English नाव</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">name_en</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">मोबाईल</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">mobile</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">वॉर्ड</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">ward_number</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">पत्ता</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">address_mr</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">कुटुंब</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">household_id</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">नोंद</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">तारीख</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {citizensListQuery.data.map((r) => (
                        <tr key={r.id} className="border-b border-gp-border/40">
                          <td className="p-1.5 font-mono text-[11px]">{r.citizenNo}</td>
                          <td className="p-1.5 max-w-40 truncate" title={r.nameMr}>
                            {r.nameMr}
                          </td>
                          <td className="p-1.5 max-w-36 truncate" title={r.nameEn ?? ''}>
                            {r.nameEn ?? '—'}
                          </td>
                          <td className="p-1.5 font-mono text-[11px]">{r.mobile}</td>
                          <td className="p-1.5">{r.wardNumber}</td>
                          <td className="p-1.5 max-w-52 truncate" title={r.addressMr}>
                            {r.addressMr}
                          </td>
                          <td className="p-1.5 font-mono text-[11px]">{r.householdId ?? '—'}</td>
                          <td className="p-1.5 text-gp-muted whitespace-nowrap">{formatDate(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div
            id="panel-properties"
            role="tabpanel"
            aria-labelledby="tab-properties"
            className="flex flex-col gap-4 p-4"
          >
            <p className="text-xs text-gp-muted">
              नागरिक आधी अपलोड झाले पाहिजेत. मालक: नागरिक फाइलमधील <strong>क्रमांक</strong> = मालमत्ता ओळीतील{' '}
              <code className="text-[11px]">owner_citizen_no</code>. टेम्पलेट → फाइल → अपलोड; मग खाली नोंदी.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
              <button
                type="button"
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-gp-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-gp-surface disabled:opacity-50"
                disabled={downloadProp.isPending || metaQuery.isPending}
                onClick={() => downloadProp.mutate()}
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                {downloadProp.isPending ? 'Preparing…' : 'Excel टेम्पलेट डाउनलोड'}
              </button>
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="min-w-0 flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-gp-surface file:px-2 file:py-1 file:text-xs sm:min-w-[12rem] sm:max-w-md"
                onChange={(e) => setPropertiesFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="w-fit rounded-md bg-gp-primary px-4 py-2 text-sm font-medium text-gp-primary-fg disabled:opacity-50"
                disabled={!propertiesFile || propertiesMut.isPending}
                onClick={() => propertiesMut.mutate()}
              >
                {propertiesMut.isPending ? 'Uploading…' : 'Excel अपलोड'}
              </button>
            </div>
            {propertiesMut.isSuccess && propertiesMut.data?.data && (
              <p className="text-sm text-emerald-700">+{String(propertiesMut.data.data.inserted)} मालमत्ता जोडल्या.</p>
            )}
            <div>
              <h3 className="mb-1.5 text-xs font-medium text-gp-muted">Excel मधील स्तंभ (संदर्भ)</h3>
              <div className="overflow-x-auto rounded-md border border-gp-border/60">
                <table className="w-full min-w-lg text-left text-xs">
                  <thead>
                    <tr className="border-b border-gp-border bg-muted/40">
                      <th className="p-2 font-medium">Column</th>
                      <th className="p-2 font-medium">Rule</th>
                      <th className="p-2 font-medium">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metaQuery.isPending && (
                      <tr>
                        <td colSpan={3} className="p-2 text-gp-muted">
                          लोड होत आहे…
                        </td>
                      </tr>
                    )}
                    {propertiesCols.map((c) => (
                      <tr key={c.key} className="border-b border-gp-border/50 last:border-0">
                        <td className="p-2 font-mono text-[11px]">{c.key}</td>
                        <td className="p-2 text-gp-muted">{c.hint}</td>
                        <td className="p-2 text-gp-muted">{c.required ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="min-h-0 flex flex-1 flex-col border-t border-gp-border/60 pt-3">
              <h3 className="mb-2 text-sm font-medium text-foreground">सध्या सेवेत असलेल्या मालमत्ता</h3>
              {propertiesListQuery.isLoading && <p className="text-xs text-gp-muted">लोड होत आहे…</p>}
              {propertiesListQuery.isError && (
                <p className="text-xs text-destructive">{(propertiesListQuery.error as Error).message}</p>
              )}
              {propertiesListQuery.data && propertiesListQuery.data.length === 0 && !propertiesListQuery.isLoading && (
                <p className="text-xs text-gp-muted">अद्याप कोणतेही नाहीत.</p>
              )}
              {propertiesListQuery.data && propertiesListQuery.data.length > 0 && (
                <div className="max-h-[min(70vh,36rem)] overflow-auto rounded-md border border-gp-border/60">
                  <table className="w-full min-w-[72rem] text-left text-xs">
                    <thead>
                      <tr className="sticky top-0 border-b border-gp-border bg-muted/90 backdrop-blur">
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">मालमत्ता क्रमांक</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">Excel: property_no</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">मालक नागरिक क्र.</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">
                            नागरिक तक्त्यातल्या मालकाचा क्रमांक · Excel: owner_citizen_no
                          </span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">प्रकार</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">property_type</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">भोगवटादार / वापरकर्ता</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">occupant_name</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">सर्वे / गट</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">survey_number, plot_or_gat</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">लांबी x रुंदी</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">length_ft, width_ft</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">वय</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">age_bracket</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">ठराव / दिनांक</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">resolution_ref, assessment_date</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">सेवा कर</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">lighting / sanitation / water</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">नोंद</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">तारीख</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertiesListQuery.data.map((r) => (
                        <tr key={r.id} className="border-b border-gp-border/40">
                          <td className="p-1.5 font-mono text-[11px]">{r.propertyNo}</td>
                          <td className="p-1.5 font-mono text-[11px]">{r.ownerCitizenNo}</td>
                          <td className="p-1.5 max-w-32 truncate" title={r.propertyType}>
                            {r.propertyType}
                          </td>
                          <td className="p-1.5 max-w-40 truncate" title={r.occupantName}>
                            {r.occupantName}
                          </td>
                          <td className="p-1.5 max-w-36 truncate" title={[r.surveyNumber, r.plotOrGat].filter(Boolean).join(' / ')}>
                            {[r.surveyNumber, r.plotOrGat].filter(Boolean).join(' / ') || '—'}
                          </td>
                          <td className="p-1.5 font-mono text-[10px]">
                            {r.lengthFt != null || r.widthFt != null ? `${r.lengthFt ?? '—'} x ${r.widthFt ?? '—'}` : '—'}
                          </td>
                          <td className="p-1.5 font-mono text-[10px]">{r.ageBracket ?? '—'}</td>
                          <td className="p-1.5 max-w-40 truncate" title={[r.resolutionRef, r.assessmentDate].filter(Boolean).join(' / ')}>
                            {[r.resolutionRef, r.assessmentDate].filter(Boolean).join(' / ') || '—'}
                          </td>
                          <td className="p-1.5 font-mono text-[10px]">
                            {formatPaise(r.lightingTaxPaise)} / {formatPaise(r.sanitationTaxPaise)}
                          </td>
                          <td className="p-1.5 text-gp-muted whitespace-nowrap">{formatDate(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'propertyTypeRates' && (
          <div
            id="panel-property-type-rates"
            role="tabpanel"
            aria-labelledby="tab-property-type-rates"
            className="flex flex-col gap-4 p-4"
          >
            <p className="text-xs text-gp-muted">
              प्रति <strong>मालमत्ता प्रकार</strong> एक ओळ (कमाल {String(metaQuery.data?.propertyTypeRates?.maxRows ?? 5)}).
              मालमत्ता ओळींमधील <code className="text-[11px]">property_type</code> या दरातून जुळतो. टेम्पलेट → फाइल →
              अपलोड.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
              <button
                type="button"
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-gp-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-gp-surface disabled:opacity-50"
                disabled={downloadPropertyTypeRates.isPending || metaQuery.isPending}
                onClick={() => downloadPropertyTypeRates.mutate()}
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                {downloadPropertyTypeRates.isPending ? 'Preparing…' : 'Excel टेम्पलेट डाउनलोड'}
              </button>
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="min-w-0 flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-gp-surface file:px-2 file:py-1 file:text-xs sm:min-w-[12rem] sm:max-w-md"
                onChange={(e) => setPropertyTypeRatesFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="w-fit rounded-md bg-gp-primary px-4 py-2 text-sm font-medium text-gp-primary-fg disabled:opacity-50"
                disabled={!propertyTypeRatesFile || propertyTypeRatesMut.isPending}
                onClick={() => propertyTypeRatesMut.mutate()}
              >
                {propertyTypeRatesMut.isPending ? 'Uploading…' : 'Excel अपलोड'}
              </button>
            </div>
            {propertyTypeRatesMut.isSuccess && propertyTypeRatesMut.data?.data && (
              <p className="text-sm text-emerald-700">
                +{String(propertyTypeRatesMut.data.data.inserted)} दर ओळी जतन.
              </p>
            )}
            <div>
              <h3 className="mb-1.5 text-xs font-medium text-gp-muted">Excel मधील स्तंभ (संदर्भ)</h3>
              <div className="overflow-x-auto rounded-md border border-gp-border/60">
                <table className="w-full min-w-lg text-left text-xs">
                  <thead>
                    <tr className="border-b border-gp-border bg-muted/40">
                      <th className="p-2 font-medium">Column</th>
                      <th className="p-2 font-medium">Rule</th>
                      <th className="p-2 font-medium">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metaQuery.isPending && (
                      <tr>
                        <td colSpan={3} className="p-2 text-gp-muted">
                          लोड होत आहे…
                        </td>
                      </tr>
                    )}
                    {propertyTypeRatesCols.map((c) => (
                      <tr key={c.key} className="border-b border-gp-border/50 last:border-0">
                        <td className="p-2 font-mono text-[11px]">{c.key}</td>
                        <td className="p-2 text-gp-muted">{c.hint}</td>
                        <td className="p-2 text-gp-muted">{c.required ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="min-h-0 flex flex-1 flex-col border-t border-gp-border/60 pt-3">
              <h3 className="mb-2 text-sm font-medium text-foreground">सध्या कायदेशीर/सेवा दर (प्रति प्रकार)</h3>
              {propertyTypeRatesListQuery.isLoading && <p className="text-xs text-gp-muted">लोड होत आहे…</p>}
              {propertyTypeRatesListQuery.isError && (
                <p className="text-xs text-destructive">{(propertyTypeRatesListQuery.error as Error).message}</p>
              )}
              {propertyTypeRatesListQuery.data &&
                propertyTypeRatesListQuery.data.length === 0 &&
                !propertyTypeRatesListQuery.isLoading && (
                <p className="text-xs text-gp-muted">अद्याप कोणतेही नोंदी नाहीत — Excel ने भरा.</p>
              )}
              {propertyTypeRatesListQuery.data && propertyTypeRatesListQuery.data.length > 0 && (
                <div className="max-h-[min(70vh,36rem)] overflow-auto rounded-md border border-gp-border/60">
                  <table className="w-full min-w-[64rem] text-left text-xs">
                    <thead>
                      <tr className="sticky top-0 border-b border-gp-border bg-muted/90 backdrop-blur">
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">प्रकार</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">property_type</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">किमान / कमाल</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">min_rate, max_rate</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">जमीन / चौ. ft</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">land_rate…</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">बांध. जु.</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">construction…</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">नव. बांध.</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">new_constr…</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">डिफॉल्ट सेवा कर</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-tight text-gp-muted">lighting / sanitation / water</span>
                        </th>
                        <th className="p-1.5 text-left align-bottom">
                          <span className="block font-medium">अद्यतन</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyTypeRatesListQuery.data.map((r) => (
                        <tr key={r.id} className="border-b border-gp-border/40">
                          <td className="p-1.5 font-mono text-[11px]">{r.propertyType}</td>
                          <td className="p-1.5 font-mono text-[10px]">
                            {formatRate(r.minRate)} / {formatRate(r.maxRate)}
                          </td>
                          <td className="p-1.5 font-mono text-[10px]">{formatRate(r.landRatePerSqft)}</td>
                          <td className="p-1.5 font-mono text-[10px]">{formatRate(r.constructionRatePerSqft)}</td>
                          <td className="p-1.5 font-mono text-[10px]">{formatRate(r.newConstructionRatePerSqft)}</td>
                          <td className="p-1.5 font-mono text-[10px]">
                            {formatPaise(r.defaultLightingPaise)} / {formatPaise(r.defaultSanitationPaise)}
                          </td>
                          <td className="p-1.5 text-gp-muted whitespace-nowrap">{formatDate(r.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
