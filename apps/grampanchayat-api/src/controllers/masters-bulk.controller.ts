import { asyncHandler } from '../common/guards/async-handler.ts'
import { assertBulkFile, memoryUploadSingle } from '../common/guards/bulk-upload.guard.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { mastersBulkService } from '../services/masters-bulk.service.ts'
import { mastersBulkTemplateService } from '../services/masters-bulk-template.service.ts'
import { getMastersTemplateMetaPayload } from '../types/masters-bulk-template.meta.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

export class MastersBulkController extends BaseController {
  getTemplateMeta = asyncHandler(async (_req, res) => {
    return this.ok(res, getMastersTemplateMetaPayload(), 'Masters import template metadata')
  })

  downloadCitizensTemplate = asyncHandler(async (_req, res) => {
    const buf = await mastersBulkTemplateService.buildCitizensTemplateXlsx()
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="gp-masters-citizens-template.xlsx"'
    )
    return res.status(200).send(buf)
  })

  downloadPropertiesTemplate = asyncHandler(async (_req, res) => {
    const buf = await mastersBulkTemplateService.buildPropertiesTemplateXlsx()
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="gp-masters-properties-template.xlsx"'
    )
    return res.status(200).send(buf)
  })

  downloadPropertyTypeRatesTemplate = asyncHandler(async (_req, res) => {
    const buf = await mastersBulkTemplateService.buildPropertyTypeRatesTemplateXlsx()
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="gp-masters-property-tax-rates-template.xlsx"'
    )
    return res.status(200).send(buf)
  })

  importCitizens = asyncHandler(async (req, res) => {
    assertBulkFile(req)
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const f = req.file!
    const out = await mastersBulkService.importCitizensFile(tenant.id, f.buffer)
    return this.created(res, out, 'Citizens imported successfully')
  })

  importProperties = asyncHandler(async (req, res) => {
    assertBulkFile(req)
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const f = req.file!
    const out = await mastersBulkService.importPropertiesFile(tenant.id, f.buffer)
    return this.created(res, out, 'Properties imported successfully')
  })

  importPropertyTypeRates = asyncHandler(async (req, res) => {
    assertBulkFile(req)
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const f = req.file!
    const out = await mastersBulkService.importPropertyTypeRatesFile(tenant.id, f.buffer)
    return this.created(res, out, 'Property tax rates imported successfully')
  })

  listCitizens = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const rows = await mastersBulkService.listCitizensForGp(tenant.id)
    return this.ok(res, { items: rows }, 'Citizens list')
  })

  listProperties = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const rows = await mastersBulkService.listPropertiesForGp(tenant.id)
    return this.ok(res, { items: rows }, 'Properties list')
  })
}

export const mastersBulkController = new MastersBulkController()

export const mastersBulkUpload = memoryUploadSingle.single('file')
