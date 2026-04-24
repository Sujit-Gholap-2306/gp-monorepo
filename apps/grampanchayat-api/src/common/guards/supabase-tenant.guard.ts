import { createClient } from '@supabase/supabase-js'
import { ApiError } from '../exceptions/http.exception.ts'
import { asyncHandler } from './async-handler.ts'
import { env } from '../../config/index.ts'
import { tenantModel } from '../../models/tenant.model.ts'

function firstString(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value[0] : value
}

/**
 * Verifies `Authorization: Bearer <Supabase access token>` and ensures the user
 * is listed in `gp_admins` for the tenant in `:subdomain` with
 * `is_active = true` and `deleted_at IS NULL` (soft-deleted or inactive = no access).
 */
export const supabaseTenantAdminGuard = asyncHandler(async (req, _res, next) => {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined
  if (!token) throw new ApiError(401, 'Unauthorized')

  const subdomain = firstString(req.params.subdomain)
  if (!subdomain) throw new ApiError(400, 'Subdomain is required')

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser(token)
  if (userErr || !user) throw new ApiError(401, 'Invalid or expired session')

  const tenant = await tenantModel.findBySubdomain(subdomain)
  if (!tenant) throw new ApiError(404, 'Tenant not found')

  const { data: adminRow, error: adminErr } = await supabase
    .from('gp_admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('gp_id', tenant.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()

  if (adminErr) throw new ApiError(500, 'Failed to verify admin access')
  if (!adminRow) {
    throw new ApiError(403, 'Not an active admin for this GP (inactive or removed)')
  }

  req.supabaseUser = user
  req.gpTenant = tenant
  next()
})
