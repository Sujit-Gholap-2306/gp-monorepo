'use client'

import { GramAppShell } from '@gp/shadcn/gram-app-shell'
import { Badge } from '@gp/shadcn/ui/badge'
import { useMasterSnapshot } from '@/lib/masters'
import { APP_NAV } from '@/lib/nav'

const FALLBACK_GP_MR = 'रामोशी ग्रामपंचायत'
const FALLBACK_FY_MR = 'आर्थिक वर्ष: २०२५-२६'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data } = useMasterSnapshot()
  const activeFy = data?.financialYears.find(f => f.status === 'active')
  const gpNameMr = data?.gpProfile.nameMr ?? FALLBACK_GP_MR
  const fyMr = activeFy ? `आर्थिक वर्ष: ${activeFy.labelMr}` : FALLBACK_FY_MR

  return (
    <GramAppShell
      navItems={APP_NAV}
      contextStripGpNameMr={gpNameMr}
      contextStripFinancialYearMr={fyMr}
      contextStripTrailing={
        <Badge variant="outline" className="text-[10px] font-medium">
          मराठी · English
        </Badge>
      }
    >
      {children}
    </GramAppShell>
  )
}
