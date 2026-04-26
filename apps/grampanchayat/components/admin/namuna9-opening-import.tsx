'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Loader2, Upload } from 'lucide-react'
import {
  downloadNamuna9OpeningTemplate,
  importNamuna9OpeningBalances,
  type Namuna9OpeningImportResponse,
  type Namuna9OpeningTemplateMode,
} from '@/lib/api/namuna9'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'

type Props = {
  subdomain: string
  fiscalYear?: string
}

type RowValidationError = {
  row: number
  message: string
  fields?: { field: string; message: string }[]
}

type ImportApiError = Error & {
  status?: number
  body?: {
    errors?: RowValidationError[]
  }
}

async function getAccessToken() {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export function Namuna9OpeningImport({
  subdomain,
  fiscalYear,
}: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [lastResult, setLastResult] = useState<Namuna9OpeningImportResponse | null>(null)
  const [validationErrors, setValidationErrors] = useState<RowValidationError[] | null>(null)
  const [downloadPending, startDownload] = useTransition()
  const [uploadPending, startUpload] = useTransition()

  function handleDownloadTemplate(mode: Namuna9OpeningTemplateMode) {
    startDownload(async () => {
      try {
        const accessToken = await getAccessToken()
        if (!accessToken) {
          gpToast.error('Login session मिळाली नाही. कृपया पुन्हा login करा.')
          return
        }
        await downloadNamuna9OpeningTemplate(subdomain, mode, fiscalYear, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        gpToast.success(
          mode === 'properties'
            ? 'Properties template download झाला'
            : 'Blank template download झाला'
        )
      } catch (error) {
        gpToast.fromError(error, 'Template download अयशस्वी')
      }
    })
  }

  function handleImport() {
    startUpload(async () => {
      try {
        if (!file) {
          gpToast.error('कृपया .xlsx फाइल निवडा')
          return
        }

        setValidationErrors(null)
        setLastResult(null)
        const accessToken = await getAccessToken()
        if (!accessToken) {
          gpToast.error('Login session मिळाली नाही. कृपया पुन्हा login करा.')
          return
        }

        const result = await importNamuna9OpeningBalances(
          subdomain,
          { file, fiscalYear },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        setLastResult(result)
        const updated = result.summary.updatedProperties
        const failed = result.summary.failedProperties
        if (failed > 0) {
          gpToast.warning(
            `${updated} मालमत्तांचे arrears update झाले, ${failed} नोंदी नाकारल्या. खाली reason table तपासा.`
          )
        } else {
          gpToast.success(`${updated} मालमत्तांचे arrears update झाले`)
        }
        router.refresh()
      } catch (error) {
        const typedError = error as ImportApiError
        const details = typedError.body?.errors
        setValidationErrors(Array.isArray(details) ? details : null)
        gpToast.fromError(error, 'Opening balances import अयशस्वी')
      }
    })
  }

  return (
    <section className="rounded-lg border border-gp-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Opening Balances (Bulk Excel)</h2>
      <p className="mt-1 text-xs text-gp-muted">
        ही import N09 चालू वर्षाच्या नोंदींसाठी फक्त arrears update करते. Demand/Total हे फक्त reference columns आहेत;
        upload वेळी backend ते ignore करतो. Paid collection N10 receipt flow मध्ये करा.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <button
          type="button"
          onClick={() => handleDownloadTemplate('blank')}
          disabled={downloadPending}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-gp-border bg-background px-3 text-sm hover:bg-gp-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloadPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Blank template</span>
        </button>
        <button
          type="button"
          onClick={() => handleDownloadTemplate('properties')}
          disabled={downloadPending}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-gp-border bg-background px-3 text-sm hover:bg-gp-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloadPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Template with properties</span>
        </button>
        <input
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="min-w-0 flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-gp-surface file:px-2 file:py-1 file:text-xs sm:min-w-[14rem] sm:max-w-md"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={!file || uploadPending}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-gp-primary px-3 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploadPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Upload opening balances</span>
        </button>
      </div>

      {validationErrors && validationErrors.length > 0 && (
        <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-800">
          <p className="font-medium">Excel validation errors</p>
          <ul className="mt-2 max-h-48 overflow-auto space-y-1">
            {validationErrors.map((error, index) => (
              <li key={`${error.row}-${index}`} className="border-t border-red-200 pt-1 first:border-t-0 first:pt-0">
                Row {String(error.row)}: {error.fields?.length
                  ? error.fields.map((field) => `${field.field}: ${field.message}`).join(' · ')
                  : error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lastResult && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-md border border-gp-border bg-gp-surface p-2">
              <p className="text-[11px] text-gp-muted">Fiscal year</p>
              <p className="text-sm font-semibold text-foreground">{lastResult.fiscalYear}</p>
            </div>
            <div className="rounded-md border border-gp-border bg-gp-surface p-2">
              <p className="text-[11px] text-gp-muted">In file</p>
              <p className="text-sm font-semibold text-foreground">{lastResult.summary.propertiesInFile}</p>
            </div>
            <div className="rounded-md border border-gp-border bg-emerald-50 p-2">
              <p className="text-[11px] text-emerald-700">Updated</p>
              <p className="text-sm font-semibold text-emerald-800">{lastResult.summary.updatedProperties}</p>
            </div>
            <div className="rounded-md border border-gp-border bg-amber-50 p-2">
              <p className="text-[11px] text-amber-700">Failed</p>
              <p className="text-sm font-semibold text-amber-800">{lastResult.summary.failedProperties}</p>
            </div>
          </div>

          {lastResult.failed.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-amber-300">
              <table className="w-full min-w-[560px] text-xs">
                <thead className="bg-amber-50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Property No</th>
                    <th className="px-3 py-2 font-medium">Excel Rows</th>
                    <th className="px-3 py-2 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {lastResult.failed.map((row) => (
                    <tr key={`${row.propertyNo}-${row.reason}`} className="border-t border-amber-200">
                      <td className="px-3 py-2 font-medium">{row.propertyNo}</td>
                      <td className="px-3 py-2">{row.rowNos.join(', ')}</td>
                      <td className="px-3 py-2">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
