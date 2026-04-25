import { buildApiUrl, apiFetch } from './client'
import { tenantApiPaths } from './endpoints'

export async function listPostHolders(subdomain: string, init?: RequestInit) {
  return apiFetch<any[]>(buildApiUrl(subdomain, tenantApiPaths.postHolders.list), { method: 'GET', ...init })
}

export async function getPostHolder(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.postHolders.byId(id)), { method: 'GET', ...init })
}

export async function createPostHolder(subdomain: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.postHolders.list), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updatePostHolder(subdomain: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.postHolders.byId(id)), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deletePostHolder(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, tenantApiPaths.postHolders.byId(id)), { method: 'DELETE', ...init })
}
