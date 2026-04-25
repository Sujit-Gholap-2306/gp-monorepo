import { buildApiUrl, apiFetch } from './client'
import { tenantApiPaths } from './endpoints'

export async function listGallery(subdomain: string, init?: RequestInit) {
  return apiFetch<any[]>(buildApiUrl(subdomain, tenantApiPaths.gallery.list), { method: 'GET', ...init })
}

export async function getGalleryItem(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.gallery.byId(id)), { method: 'GET', ...init })
}

export async function createGalleryItem(subdomain: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.gallery.list), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function updateGalleryItem(subdomain: string, id: string, payload: any, init?: RequestInit) {
  return apiFetch<any>(buildApiUrl(subdomain, tenantApiPaths.gallery.byId(id)), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...init,
  })
}

export async function deleteGalleryItem(subdomain: string, id: string, init?: RequestInit) {
  return apiFetch<void>(buildApiUrl(subdomain, tenantApiPaths.gallery.byId(id)), { method: 'DELETE', ...init })
}
