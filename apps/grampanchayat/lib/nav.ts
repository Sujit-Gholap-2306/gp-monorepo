import {
  LayoutDashboard,
  ScrollText,
  FilePlus,
  Search,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  labelMr: string
  desc: string
  icon: LucideIcon
  exact?: boolean
}

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
    href: '/namuna8',
    label: 'Namuna 8',
    labelMr: 'नमुना ८ — घरपट्टी',
    desc: 'Property tax register',
    icon: ClipboardList,
    exact: false,
  },
  {
    href: '/utaras',
    label: 'Utara List',
    labelMr: 'उतारे',
    desc: 'All records',
    icon: ScrollText,
    exact: false,
  },
  {
    href: '/utaras/new',
    label: 'Add Utara',
    labelMr: 'नवीन उतारा',
    desc: 'New entry',
    icon: FilePlus,
    exact: true,
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
