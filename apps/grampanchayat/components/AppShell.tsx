'use client'

import { GramAppShell } from '@repo/shadcn/gram-app-shell'
import { APP_NAV } from '@/lib/nav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <GramAppShell navItems={APP_NAV}>{children}</GramAppShell>
}
