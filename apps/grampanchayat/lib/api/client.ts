import { getGrampanchayatApiBaseUrl } from '../grampanchayat-api'

export function buildApiUrl(subdomain: string, path: string) {
  return `${getGrampanchayatApiBaseUrl()}/api/v1/tenants/${encodeURIComponent(subdomain)}/${path}`
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.method && init.method !== 'GET' && init.method !== 'DELETE') {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  })

  // For 204 No Content
  if (res.status === 204) return {} as T

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = json.message || `API request failed with status ${res.status}`
    throw new Error(msg)
  }
  return json.data as T
}
