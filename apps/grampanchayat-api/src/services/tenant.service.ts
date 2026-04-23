import type { NewGpTenant } from '../db/schema/tenants.ts'
import { tenantModel } from '../models/tenant.model.ts'
import { storageService } from './storage.service.ts'
import type { GpTenant } from '../db/schema/tenants.ts'
import type { FeatureFlagsInput } from '../types/tenant-settings.dto.ts'

function compactJsonFields(
  input: Record<string, string | undefined>
): Record<string, string> {
  const o: Record<string, string> = {}
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined && v !== '') o[k] = v
  }
  return o
}

export type TenantSettingsPayload = {
  nameMr: string
  nameEn: string
  established: string | undefined
  village: Record<string, string | undefined>
  contact: Record<string, string | undefined>
  portalTheme: string
  featureFlags: FeatureFlagsInput
  portalConfigPatch: Record<string, unknown>
}

export const tenantService = {
  async getTenantBySubdomain(subdomain: string): Promise<GpTenant | null> {
    const tenant = await tenantModel.findBySubdomain(subdomain)
    return tenant || null
  },

  async updateSettings(
    subdomain: string,
    data: TenantSettingsPayload,
    logoFile?: Express.Multer.File
  ): Promise<GpTenant> {
    const tenant = await tenantModel.findBySubdomain(subdomain)
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    let logoUrl: string | undefined
    if (logoFile && logoFile.size > 0) {
      const dest = `${tenant.id}/logo-${Date.now()}${logoFile.originalname.substring(logoFile.originalname.lastIndexOf('.')) || '.png'}`
      logoUrl = await storageService.upload(logoFile.path, 'logos', dest, logoFile.mimetype) || undefined
    }

    const prevCfg =
      tenant.portalConfig &&
      typeof tenant.portalConfig === 'object' &&
      !Array.isArray(tenant.portalConfig)
        ? { ...(tenant.portalConfig as Record<string, unknown>) }
        : {}
    const portalConfig: Record<string, unknown> = {
      ...prevCfg,
      ...data.portalConfigPatch,
    }

    const updateData: Partial<NewGpTenant> = {
      nameMr:        data.nameMr,
      nameEn:        data.nameEn,
      established:   data.established ? new Date(data.established) : null,
      village:       compactJsonFields(data.village),
      contact:       compactJsonFields(data.contact),
      portalTheme:   data.portalTheme || 'civic-elegant',
      featureFlags:  {
        showProgress:    data.featureFlags.showProgress,
        showMap:         data.featureFlags.showMap,
        showAchievements: data.featureFlags.showAchievements,
      },
      portalConfig,
    }
    if (logoUrl) {
      updateData.logoUrl = logoUrl
    }

    const updated = await tenantModel.update(tenant.id, updateData)
    if (!updated) throw new Error('Failed to update tenant')

    return updated
  }
}
