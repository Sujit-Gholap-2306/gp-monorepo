import { asyncHandler } from '../common/guards/async-handler.ts'
import { assertBulkFile, memoryUploadSingle } from '../common/guards/bulk-upload.guard.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { mastersBulkService } from '../services/masters-bulk.service.ts'
import { mastersBulkTemplateService } from '../services/masters-bulk-template.service.ts'
import {
  citizenListQuerySchema,
  createCitizenSchema,
  createPropertySchema,
  masterRecordIdParamsSchema,
  propertyListQuerySchema,
  updateCitizenSchema,
  updatePropertySchema,
} from '../types/masters-crud.dto.ts'
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
    return this.ok(res, out, 'Citizens import processed')
  })

  importProperties = asyncHandler(async (req, res) => {
    assertBulkFile(req)
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const f = req.file!
    const out = await mastersBulkService.importPropertiesFile(tenant.id, f.buffer)
    return this.ok(res, out, 'Properties import processed')
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
    const parsed = citizenListQuerySchema.safeParse(req.query)
    if (!parsed.success) throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    const data = await mastersBulkService.listCitizensForGp(tenant.id, parsed.data)
    return this.ok(res, data, 'Citizens list')
  })

  getCitizenById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = masterRecordIdParamsSchema.safeParse(req.params)
    if (!parsed.success) throw new ApiError(422, 'Invalid params', parsed.error.issues)
    const data = await mastersBulkService.getCitizenById(tenant.id, parsed.data.id)
    return this.ok(res, data, 'Citizen retrieved')
  })

  createCitizen = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createCitizenSchema.safeParse(req.body)
    if (!parsed.success) throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    const data = await mastersBulkService.createCitizen(tenant.id, parsed.data)
    return this.created(res, data, 'Citizen created')
  })

  updateCitizen = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsedParams = masterRecordIdParamsSchema.safeParse(req.params)
    if (!parsedParams.success) throw new ApiError(422, 'Invalid params', parsedParams.error.issues)
    const parsedBody = updateCitizenSchema.safeParse(req.body)
    if (!parsedBody.success) throw new ApiError(422, 'Invalid request body', parsedBody.error.issues)
    const data = await mastersBulkService.updateCitizen(tenant.id, parsedParams.data.id, parsedBody.data)
    return this.ok(res, data, 'Citizen updated')
  })

  listProperties = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = propertyListQuerySchema.safeParse(req.query)
    if (!parsed.success) throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    const data = await mastersBulkService.listPropertiesForGp(tenant.id, parsed.data)
    return this.ok(res, data, 'Properties list')
  })

  getPropertyById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = masterRecordIdParamsSchema.safeParse(req.params)
    if (!parsed.success) throw new ApiError(422, 'Invalid params', parsed.error.issues)
    const data = await mastersBulkService.getPropertyById(tenant.id, parsed.data.id)
    return this.ok(res, data, 'Property retrieved')
  })

  createProperty = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createPropertySchema.safeParse(req.body)
    if (!parsed.success) throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    const data = await mastersBulkService.createProperty(tenant.id, parsed.data)
    return this.created(res, data, 'Property created')
  })

  updateProperty = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsedParams = masterRecordIdParamsSchema.safeParse(req.params)
    if (!parsedParams.success) throw new ApiError(422, 'Invalid params', parsedParams.error.issues)
    const parsedBody = updatePropertySchema.safeParse(req.body)
    if (!parsedBody.success) throw new ApiError(422, 'Invalid request body', parsedBody.error.issues)
    const data = await mastersBulkService.updateProperty(tenant.id, parsedParams.data.id, parsedBody.data)
    return this.ok(res, data, 'Property updated')
  })
}

export const mastersBulkController = new MastersBulkController()

export const mastersBulkUpload = memoryUploadSingle.single('file')
