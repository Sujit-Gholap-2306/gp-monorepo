import { NAMUNA9_STATUS_CLASSES, NAMUNA9_STATUS_LABELS_MR } from '@/lib/tax/format'
import type { Namuna9Status } from '@/lib/api/namuna9'

type Props = {
  status: Namuna9Status
}

export function Namuna9StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${NAMUNA9_STATUS_CLASSES[status]}`}>
      {NAMUNA9_STATUS_LABELS_MR[status]}
    </span>
  )
}
