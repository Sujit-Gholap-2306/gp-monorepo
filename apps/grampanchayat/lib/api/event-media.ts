import { buildApiUrl, apiFetch } from './client'

export async function listEventMedia(subdomain: string, eventId: string, init?: RequestInit) {
  return apiFetch<any[]>(buildApiUrl(subdomain, `events/${eventId}/media`), { method: 'GET', ...init })
}

export async function getEventMedia(subdomain: string, eventId: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `events/${eventId}/media/${id}`), { method: 'GET', ...init })
}

export async function createEventMedia(subdomain: string, eventId: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `events/${eventId}/media`), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updateEventMedia(subdomain: string, eventId: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `events/${eventId}/media/${id}`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deleteEventMedia(subdomain: string, eventId: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, `events/${eventId}/media/${id}`), { method: 'DELETE', ...init })
}
