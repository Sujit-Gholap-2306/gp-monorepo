import { buildApiUrl, apiFetch } from './client'

export async function listPostHolders(subdomain: string, init?: RequestInit) {
  return apiFetch<any[]>(buildApiUrl(subdomain, 'post-holders'), { method: 'GET', ...init })
}

export async function getPostHolder(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `post-holders/${id}`), { method: 'GET', ...init })
}

export async function createPostHolder(subdomain: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, 'post-holders'), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updatePostHolder(subdomain: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, `post-holders/${id}`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deletePostHolder(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, `post-holders/${id}`), { method: 'DELETE', ...init })
}
