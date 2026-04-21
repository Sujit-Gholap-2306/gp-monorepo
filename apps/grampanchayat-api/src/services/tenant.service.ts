import { tenantModel } from '../models/tenant.model.ts'
import { storageService } from './storage.service.ts'
import type { GpTenant } from '../db/schema/tenants.ts'

export const tenantService = {
  async getTenantBySubdomain(subdomain: string): Promise<GpTenant | null> {
    const tenant = await tenantModel.findBySubdomain(subdomain)
    return tenant || null
  },

  async updateSettings(
    subdomain: string,
    data: any,
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

    const updateData: any = {
      nameMr: data.nameMr,
      nameEn: data.nameEn,
      established: data.established ? new Date(data.established) : undefined,
      village: data.village,
      contact: data.contact,
      portalTheme: data.portalTheme || 'civic-elegant',
      featureFlags: data.featureFlags,
      ...(logoUrl && { logoUrl }),
    }

    const updated = await tenantModel.update(tenant.id, updateData)
    if (!updated) throw new Error('Failed to update tenant')

    return updated
  }
}
