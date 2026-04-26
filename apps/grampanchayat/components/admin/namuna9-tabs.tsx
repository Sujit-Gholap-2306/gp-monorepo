import Link from 'next/link'

type TabKey = 'register' | 'citizens'

type Props = {
  subdomain: string
  active: TabKey
  fiscalYear?: string
}

const TAB_META: Record<TabKey, { label: string, href: (subdomain: string, fiscalYear?: string) => string }> = {
  register: {
    label: 'मागणी नोंदवही',
    href: (subdomain, fiscalYear) => {
      const query = fiscalYear ? `?fiscalYear=${encodeURIComponent(fiscalYear)}` : ''
      return `/${subdomain}/admin/namuna9${query}`
    },
  },
  citizens: {
    label: 'नागरिक दृश्य',
    href: (subdomain, fiscalYear) => {
      const query = fiscalYear ? `?fiscalYear=${encodeURIComponent(fiscalYear)}` : ''
      return `/${subdomain}/admin/namuna9/citizens${query}`
    },
  },
}

export function Namuna9Tabs({ subdomain, active, fiscalYear }: Props) {
  return (
    <div className="border-b border-gp-border">
      <nav className="flex gap-2">
        {(Object.keys(TAB_META) as TabKey[]).map((key) => {
          const tab = TAB_META[key]
          const isActive = key === active
          return (
            <Link
              key={key}
              href={tab.href(subdomain, fiscalYear)}
              className={`inline-flex h-10 items-center border-b-2 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-gp-primary text-gp-primary'
                  : 'border-transparent text-gp-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
