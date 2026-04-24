import { buildApiUrl, apiFetch } from './client'

export async function listEvents(subdomain: string, publishedOnly = false, init?: RequestInit) {
  const url = new URL(buildApiUrl(subdomain, 'events'))
  if (publishedOnly) url.searchParams.set('published', 'true')
  return apiFetch<any[]>(url.toString(), { method: 'GET', ...init })
}

export async function getEvent(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `events/${id}`), { method: 'GET', ...init })
}

export async function createEvent(subdomain: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, 'events'), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updateEvent(subdomain: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `events/${id}`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deleteEvent(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, `events/${id}`), { method: 'DELETE', ...init })
}
