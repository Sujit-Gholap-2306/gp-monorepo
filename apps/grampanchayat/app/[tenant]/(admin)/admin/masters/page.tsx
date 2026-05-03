import { redirect } from 'next/navigation'

export default async function AdminMastersPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params
  redirect(`/${tenant}/admin/masters/citizens`)
}
