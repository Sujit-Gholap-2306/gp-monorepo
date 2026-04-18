'use client'

import { GramAppShell } from '@gp/shadcn/gram-app-shell'
import { Badge } from '@gp/shadcn/ui/badge'
import { APP_NAV } from '@/lib/nav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GramAppShell
      navItems={APP_NAV}
      contextStripGpNameMr="रामोशी ग्रामपंचायत"
      contextStripFinancialYearMr="आर्थिक वर्ष: २०२५-२६"
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
