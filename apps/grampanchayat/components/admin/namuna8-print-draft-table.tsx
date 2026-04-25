'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Namuna8ListItem } from '@/lib/api/namuna8'
import { applyNamuna8Draft, type Namuna8PrintDraft } from '@/lib/namuna8/print-draft'
import { getNamuna8PrintDraft } from '@/lib/namuna8/print-draft-memory'
import {
  Namuna8UtaraTable,
  UTARA_PRESET_VERTICAL_LONG_LABELS,
} from '@/components/admin/namuna8-utara-table'

type Props = {
  data: Namuna8ListItem
  tenantName: string
  reportDateLabel: string
}

export function Namuna8PrintDraftTable({ data, tenantName, reportDateLabel }: Props) {
  const [draft, setDraft] = useState<Namuna8PrintDraft | null>(null)

  useEffect(() => {
    setDraft(getNamuna8PrintDraft(data.id))
  }, [data.id])

  const printData = useMemo(() => applyNamuna8Draft(data, draft), [data, draft])

  return (
    <Namuna8UtaraTable
      data={printData}
      tenantName={tenantName}
      showSignature
      reportDateLabel={reportDateLabel}
      verticalHeaders={UTARA_PRESET_VERTICAL_LONG_LABELS}
    />
  )
}
