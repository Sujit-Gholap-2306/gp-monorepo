import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Banknote,
  ScrollText,
  Database,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  labelMr: string
  desc: string
  icon: LucideIcon
  badge?: string
  exact?: boolean
}

/**
 * Sidebar — demo-only: wired UI + IndexedDB persistence.
 * Placeholder pages (citizens, properties, cashbook, classified, search) are hidden until F3.
 */
export const APP_NAV: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    labelMr: 'मुख्यपृष्ठ',
    desc: 'Summary & stats',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/masters',
    label: 'Master data',
    labelMr: 'मास्टर डेटा',
    desc: 'GP profile, FY, heads — demo seed',
    icon: Database,
    exact: true,
  },
  {
    href: '/assessment',
    label: 'Assessment',
    labelMr: 'कर आकारण',
    desc: 'Namuna 8 — property tax assessment',
    icon: ClipboardList,
    badge: 'N08',
    exact: false,
  },
  {
    href: '/demand',
    label: 'Tax demand',
    labelMr: 'कर मागणी',
    desc: 'Namuna 9',
    icon: FileText,
    badge: 'N09',
    exact: false,
  },
  {
    href: '/collect',
    label: 'Collect payment',
    labelMr: 'वसूली',
    desc: 'Namuna 10',
    icon: Banknote,
    badge: 'N10',
    exact: false,
  },
  {
    href: '/utaras',
    label: 'Utara list',
    labelMr: 'उतारे',
    desc: 'Persisted utara records',
    icon: ScrollText,
    exact: false,
  },
]

/*
Full IA (unhide when pages are ready):
  /citizens, /properties, /cashbook, /classified, /search
*/
