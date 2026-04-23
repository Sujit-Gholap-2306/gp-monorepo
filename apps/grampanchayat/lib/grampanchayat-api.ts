/**
 * Public base URL for the Express grampanchayat-api (used by the browser for tenant settings, etc.).
 * @example http://localhost:3005
 */
export function getGrampanchayatApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_GRAMPANCHAYAT_API_URL
  if (raw && raw.length > 0) return raw.replace(/\/$/, '')
  return 'http://localhost:3005'
}
