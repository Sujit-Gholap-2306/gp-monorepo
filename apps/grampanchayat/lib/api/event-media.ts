import { buildApiUrl, apiFetch } from './client'
import { tenantApiPaths } from './endpoints'

export async function listEventMedia(subdomain: string, eventId: string, init?: RequestInit) {
  return apiFetch<any[]>(buildApiUrl(subdomain, tenantApiPaths.events.mediaList(eventId)), { method: 'GET', ...init })
}

export async function getEventMedia(subdomain: string, eventId: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.events.mediaById(eventId, id)), { method: 'GET', ...init })
}

export async function createEventMedia(subdomain: string, eventId: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.events.mediaList(eventId)), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updateEventMedia(subdomain: string, eventId: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.events.mediaById(eventId, id)), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deleteEventMedia(subdomain: string, eventId: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, tenantApiPaths.events.mediaById(eventId, id)), { method: 'DELETE', ...init })
}
