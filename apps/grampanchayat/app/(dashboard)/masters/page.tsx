'use client'

import type { ReactNode } from 'react'
import { useMasterSnapshot } from '@/lib/masters'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <h2 className="border-b border-border bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  )
}

function roleLabelMr(role: string): string {
  switch (role) {
    case 'sarpanch':
      return 'सरपंच'
    case 'upa_sarpanch':
      return 'उपसरपंच'
    case 'ward_member':
      return 'नगरसेवक'
    default:
      return role
  }
}

export default function MastersPage() {
  const { data, isLoading, isError, error } = useMasterSnapshot()

  if (isLoading) {
    return (
      <div className="animate-fade-in max-w-5xl space-y-4 p-5 md:p-7">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-sm text-destructive">
        मास्टर डेटा लोड करता आला नाही: {error instanceof Error ? error.message : 'अज्ञात त्रुटी'}
      </div>
    )
  }

  const { gpProfile, financialYears, assessmentYears, accountHeads, bankAccounts, citizens, electedMembers } =
    data

  const activeFy = financialYears.find(f => f.status === 'active')
  const activeAy = assessmentYears.find(a => a.status === 'active')

  return (
    <div className="animate-fade-in max-w-5xl space-y-6 p-5 md:p-7">
      <div>
        <h1 className="text-xl font-bold text-foreground">मास्टर मॉड्यूल</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          नमुन्यांपूर्वी लागणारे मूलभूत मास्टर — ब्राउझरमध्ये जतन (IndexedDB). प्रात्यक्षिक सीड.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="१. ग्रामपंचायत प्रोफाइल">
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">नाव</dt>
              <dd className="font-medium text-foreground">{gpProfile.nameMr}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">कोड</dt>
              <dd>{gpProfile.gpCode}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">जिल्हा / तालुका</dt>
              <dd>
                {gpProfile.districtMr}, {gpProfile.talukaMr}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">पंचायत समिती</dt>
              <dd>{gpProfile.panchayatSamitiMr}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">सरपंच / ग्रामसेवक</dt>
              <dd>
                {gpProfile.sarpanchNameMr} · {gpProfile.gramSevakNameMr}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">पत्ता</dt>
              <dd>{gpProfile.addressMr}</dd>
            </div>
          </dl>
        </Section>

        <Section title="२–३. आर्थिक वर्ष व कर आकारण वर्ष">
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">सक्रिय आर्थिक वर्ष</p>
              <p className="mt-1 font-semibold text-foreground">
                {activeFy?.labelMr ?? '—'}{' '}
                <span className="font-normal text-muted-foreground">
                  ({activeFy?.labelEn})
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">सक्रिय आकारण वर्ष</p>
              <p className="mt-1 font-semibold text-foreground">{activeAy?.labelMr ?? '—'}</p>
              <p className="text-xs text-muted-foreground">
                ठराव: {activeAy?.resolutionNumber} · {activeAy?.resolutionDate}
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section title="४. लेखाशीर्षके (नमुना)">
        <ul className="divide-y divide-border text-sm">
          {accountHeads.map(h => (
            <li key={h.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2 first:pt-0 last:pb-0">
              <span className="font-mono text-xs text-muted-foreground">{h.code}</span>
              <span className="min-w-0 flex-1 font-medium text-foreground">{h.descriptionMr}</span>
              <span className="text-xs capitalize text-muted-foreground">
                {h.category} · {h.subCategory}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="५. बँक खाती">
        <ul className="space-y-3 text-sm">
          {bankAccounts.map(b => (
            <li key={b.id} className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
              <p className="font-medium text-foreground">
                {b.bankNameMr} — {b.branchMr}
              </p>
              <p className="text-xs text-muted-foreground">
                {b.accountType} · {b.ifsc} · {b.accountNumber}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="६. नागरिक (नमुना)">
          <ul className="space-y-2 text-sm">
            {citizens.map(c => (
              <li key={c.id} className="rounded-lg border border-border/80 px-3 py-2">
                <p className="font-medium text-foreground">{c.nameMr}</p>
                <p className="text-xs text-muted-foreground">
                  वॉर्ड {c.wardNumber} · {c.mobile}
                  {c.aadhaarLast4 ? ` · ****${c.aadhaarLast4}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="७. निवडून आलेले सदस्य">
          <ul className="space-y-2 text-sm">
            {electedMembers.map(e => (
              <li key={e.id} className="rounded-lg border border-border/80 px-3 py-2">
                <p className="font-medium text-foreground">
                  {e.nameMr}{' '}
                  <span className="font-normal text-muted-foreground">({roleLabelMr(e.role)})</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  वॉर्ड {e.wardNumber} · {e.mobile}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
