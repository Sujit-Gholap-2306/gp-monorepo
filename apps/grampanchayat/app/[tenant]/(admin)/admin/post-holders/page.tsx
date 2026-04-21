import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { deletePostHolder } from '@/lib/actions/post-holders'

export default async function AdminPostHoldersPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const supabase = await createSupabaseServerClient()
  const { data: holders } = await supabase
    .from('post_holders')
    .select('*')
    .eq('gp_id', tenant.id)
    .order('sort_order', { ascending: true })

  const list = holders ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">पदाधिकारी</h1>
          <p className="text-sm text-gp-muted">Post Holders — {list.length} नोंदी</p>
        </div>
        <Link
          href={`/${subdomain}/admin/post-holders/new`}
          className="rounded-md bg-gp-primary text-white px-4 py-2 text-sm font-medium hover:bg-gp-primary-hover transition-colors"
        >
          + नवीन जोडा
        </Link>
      </div>

      {!list.length ? (
        <p className="text-gp-muted text-sm">अद्याप कोणतेही पदाधिकारी नाहीत</p>
      ) : (
        <div className="bg-card rounded-lg border border-gp-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gp-surface border-b border-gp-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">क्रम</th>
                <th className="text-left px-4 py-3 font-medium">नाव</th>
                <th className="text-left px-4 py-3 font-medium">पद</th>
                <th className="text-left px-4 py-3 font-medium">फोन</th>
                <th className="text-left px-4 py-3 font-medium">स्थिती</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gp-border">
              {list.map((ph) => (
                <tr key={ph.id} className="hover:bg-gp-surface/50">
                  <td className="px-4 py-3 text-gp-muted">{ph.sort_order}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{ph.name_mr}</p>
                    <p className="text-xs text-gp-muted">{ph.name_en}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{ph.post_mr}</p>
                    <p className="text-xs text-gp-muted">{ph.post_en}</p>
                  </td>
                  <td className="px-4 py-3 text-gp-muted">{ph.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ph.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ph.is_active ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <Link
                      href={`/${subdomain}/admin/post-holders/${ph.id}/edit`}
                      className="text-sm text-gp-primary hover:underline"
                    >
                      संपादित
                    </Link>
                    <form
                      action={async () => {
                        'use server'
                        await deletePostHolder(subdomain, ph.id)
                      }}
                    >
                      <button type="submit" className="text-sm text-destructive hover:underline">
                        हटवा
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
