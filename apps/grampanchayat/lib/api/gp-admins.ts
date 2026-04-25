import { buildApiUrl, apiFetch } from './client'
import { tenantApiPaths } from './endpoints'

export async function getMe(subdomain: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.admins.me), { method: 'GET', ...init })
}

export async function listGpAdmins(subdomain: string, init?: RequestInit) {
  return apiFetch<any[]>(buildApiUrl(subdomain, tenantApiPaths.admins.list), { method: 'GET', ...init })
}

export async function getGpAdmin(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.admins.byId(id)), { method: 'GET', ...init })
}

export async function createGpAdmin(subdomain: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.admins.list), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updateGpAdmin(subdomain: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.admins.byId(id)), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deleteGpAdmin(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, tenantApiPaths.admins.byId(id)), { method: 'DELETE', ...init })
}
