import { buildApiUrl, apiFetch } from './client'
import { tenantApiPaths } from './endpoints'

export async function listEvents(subdomain: string, publishedOnly = false, init?: RequestInit) {
  const url = new URL(buildApiUrl(subdomain, tenantApiPaths.events.list))
  if (publishedOnly) url.searchParams.set('published', 'true')
  return apiFetch<any[]>(url.toString(), { method: 'GET', ...init })
}

export async function getEvent(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.events.byId(id)), { method: 'GET', ...init })
}

export async function createEvent(subdomain: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.events.list), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updateEvent(subdomain: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.events.byId(id)), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deleteEvent(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, tenantApiPaths.events.byId(id)), { method: 'DELETE', ...init })
}
