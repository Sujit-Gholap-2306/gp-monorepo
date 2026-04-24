import { buildApiUrl, apiFetch } from './client'

export async function getMe(subdomain: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, 'admins/me'), { method: 'GET', ...init })
}

export async function listGpAdmins(subdomain: string, init?: RequestInit) {
  return apiFetch<any[]>(buildApiUrl(subdomain, 'admins'), { method: 'GET', ...init })
}

export async function getGpAdmin(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `admins/${id}`), { method: 'GET', ...init })
}

export async function createGpAdmin(subdomain: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, 'admins'), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updateGpAdmin(subdomain: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `admins/${id}`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deleteGpAdmin(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, `admins/${id}`), { method: 'DELETE', ...init })
}
