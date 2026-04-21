'use client'

import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: 'admin/dashboard',     label: 'डॅशबोर्ड',     labelEn: 'Dashboard',     Icon: LayoutDashboard },
  { href: 'admin/post-holders',  label: 'पदाधिकारी',     labelEn: 'Post Holders',  Icon: Users },
  { href: 'admin/events',        label: 'कार्यक्रम',     labelEn: 'Events',        Icon: Calendar },
  { href: 'admin/announcements', label: 'घोषणा',         labelEn: 'Announcements', Icon: Megaphone },
  { href: 'admin/gallery',       label: 'दालन',          labelEn: 'Gallery',       Icon: ImageIcon },
  { href: 'admin/settings',      label: 'सेटिंग्ज',      labelEn: 'Settings',      Icon: Settings },
]

export function AdminSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname()
  const params = useParams()
  const tenant = params.tenant as string
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push(`/${tenant}/login`)
    router.refresh()
  }

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-gp-border flex flex-col min-h-screen sticky top-0 h-screen">
      {/* Brand block */}
      <div className="px-5 py-5 border-b border-gp-border">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gp-muted">
          Admin Panel
        </p>
        <p className="mt-1 font-display text-base font-bold text-gp-primary truncate">
          {tenantName}
        </p>
        <Link
          href={`/${tenant}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-gp-muted hover:text-gp-primary transition-colors cursor-pointer"
        >
          <span>सार्वजनिक पृष्ठ पहा</span>
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const href = `/${tenant}/${item.href}`
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={item.href}
              href={href}
              className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer ${
                active
                  ? 'bg-gp-primary text-gp-primary-fg font-medium shadow-sm'
                  : 'text-foreground/75 hover:bg-gp-surface hover:text-foreground'
              }`}
            >
              <item.Icon className={`h-4 w-4 shrink-0 ${active ? '' : 'text-gp-muted group-hover:text-foreground'}`} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2.5 py-3 border-t border-gp-border">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-gp-muted hover:bg-gp-surface hover:text-foreground transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>बाहेर पडा</span>
        </button>
      </div>
    </aside>
  )
}
