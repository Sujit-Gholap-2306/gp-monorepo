import { buildApiUrl, apiFetch } from './client'

export async function listAnnouncements(subdomain: string, publishedOnly = false, init?: RequestInit) {
  const url = new URL(buildApiUrl(subdomain, 'announcements'))
  if (publishedOnly) url.searchParams.set('published', 'true')
  return apiFetch<any[]>(url.toString(), { method: 'GET', ...init })
}

export async function getAnnouncement(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `announcements/${id}`), { method: 'GET', ...init })
}

export async function createAnnouncement(subdomain: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, 'announcements'), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updateAnnouncement(subdomain: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `announcements/${id}`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deleteAnnouncement(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, `announcements/${id}`), { method: 'DELETE', ...init })
}
