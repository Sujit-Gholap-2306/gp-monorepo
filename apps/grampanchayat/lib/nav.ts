import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  FileText,
  Banknote,
  BookOpen,
  Table2,
  ScrollText,
  Search,
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

/** Primary demo IA — English paths, Marathi labels (next-intl later). */
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
    href: '/citizens',
    label: 'Citizens',
    labelMr: 'नागरिक',
    desc: 'Citizen register',
    icon: Users,
    exact: false,
  },
  {
    href: '/properties',
    label: 'Properties',
    labelMr: 'मालमत्ता',
    desc: 'Property register',
    icon: Building2,
    exact: false,
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
    href: '/cashbook',
    label: 'Cash book',
    labelMr: 'रोख खातेवही',
    desc: 'Namuna 5',
    icon: BookOpen,
    badge: 'N05',
    exact: false,
  },
  {
    href: '/classified',
    label: 'Classified register',
    labelMr: 'वर्गीकृत नोंदवही',
    desc: 'Namuna 6',
    icon: Table2,
    badge: 'N06',
    exact: false,
  },
  {
    href: '/utaras',
    label: 'Utara list',
    labelMr: 'उतारे',
    desc: 'Legacy utara records',
    icon: ScrollText,
    exact: false,
  },
  {
    href: '/search',
    label: 'Search',
    labelMr: 'शोध',
    desc: 'Find records',
    icon: Search,
    exact: true,
  },
]
