import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { assertBulkFile } from '../common/guards/bulk-upload.guard.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { namuna9OpeningBalancesService } from '../services/namuna9-opening-balances.service.ts'
import { namuna9OpeningTemplateService } from '../services/namuna9-opening-template.service.ts'
import { namuna9Service } from '../services/namuna9.service.ts'
import {
  namuna9DemandParamsSchema,
  namuna9GenerateBodySchema,
  namuna9ListQuerySchema,
} from '../types/namuna9.dto.ts'

class Namuna9Controller extends BaseController {
  downloadOpeningTemplate = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const modeRaw = typeof req.query?.mode === 'string' ? req.query.mode : 'blank'
    if (modeRaw !== 'blank' && modeRaw !== 'properties') {
      throw new ApiError(422, 'Invalid template mode. Use `blank` or `properties`.')
    }
    const fiscalYearRaw = typeof req.query?.fiscalYear === 'string' ? req.query.fiscalYear : undefined

    const buf = await namuna9OpeningTemplateService.buildTemplateXlsx({
      mode: modeRaw,
      gpId: tenant.id,
      fiscalYear: fiscalYearRaw,
    })
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      modeRaw === 'properties'
        ? 'attachment; filename="gp-namuna9-opening-balances-properties-template.xlsx"'
        : 'attachment; filename="gp-namuna9-opening-balances-template.xlsx"'
    )
    return res.status(200).send(buf)
  })

  importOpeningBalances = asyncHandler(async (req, res) => {
    assertBulkFile(req)
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const out = await namuna9OpeningBalancesService.importFile({
      gpId: tenant.id,
      buffer: req.file!.buffer,
      generatedBy: req.supabaseUser?.id ?? null,
      fiscalYear: typeof req.body?.fiscalYear === 'string' ? req.body.fiscalYear : undefined,
    })
    return this.ok(res, out, 'Opening balances import processed')
  })

  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna9ListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    }

    const data = await namuna9Service.list(tenant.id, parsed.data)
    return this.ok(res, data, 'Namuna 9 demand list')
  })

  listCitizens = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna9ListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    }

    const data = await namuna9Service.listCitizens(tenant.id, parsed.data)
    return this.ok(res, data, 'Namuna 9 citizen summary list')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna9DemandParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid path params', parsed.error.issues)
    }

    const data = await namuna9Service.getById(tenant.id, parsed.data.id)
    return this.ok(res, data, 'Namuna 9 demand detail')
  })

  generate = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna9GenerateBodySchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid body', parsed.error.issues)
    }

    const data = await namuna9Service.generate({
      gpId: tenant.id,
      generatedBy: req.supabaseUser?.id ?? null,
      fiscalYear: parsed.data.fiscalYear,
    })

    return this.ok(res, data, 'Namuna 9 demands generated')
  })
}

export const namuna9Controller = new Namuna9Controller()
