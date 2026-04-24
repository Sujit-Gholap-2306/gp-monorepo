import { Router } from 'express'
import { tenantController } from '../controllers/tenant.controller.ts'
import { supabaseTenantAdminGuard } from '../common/guards/supabase-tenant.guard.ts'
import { tenantGuard } from '../common/guards/tenant.guard.ts'
import { gpAdminsController } from '../controllers/gp-admins.controller.ts'
import { announcementsController } from '../controllers/announcements.controller.ts'
import { eventsController } from '../controllers/events.controller.ts'
import { eventMediaController } from '../controllers/event-media.controller.ts'
import { galleryController } from '../controllers/gallery.controller.ts'
import { postHoldersController } from '../controllers/post-holders.controller.ts'
import { upload } from '../common/guards/upload.guard.ts'
import { mastersBulkController, mastersBulkUpload } from '../controllers/masters-bulk.controller.ts'
import { bulkImportRateLimit } from '../common/guards/rate-limit.guard.ts'
import { propertyTypeRatesController } from '../controllers/property-type-rates.controller.ts'

const router = Router()

// Public - Get tenant details
router.get('/:subdomain', tenantController.getTenant)

// Masters — template metadata + Excel (admin only; same constraints as bulk POST)
router.get(
  '/:subdomain/masters/template-meta',
  supabaseTenantAdminGuard,
  mastersBulkController.getTemplateMeta
)
router.get(
  '/:subdomain/masters/citizens/template',
  supabaseTenantAdminGuard,
  mastersBulkController.downloadCitizensTemplate
)
router.get(
  '/:subdomain/masters/properties/template',
  supabaseTenantAdminGuard,
  mastersBulkController.downloadPropertiesTemplate
)
router.get(
  '/:subdomain/masters/citizens',
  supabaseTenantAdminGuard,
  mastersBulkController.listCitizens
)
router.get(
  '/:subdomain/masters/properties',
  supabaseTenantAdminGuard,
  mastersBulkController.listProperties
)

// Property type rates — template + bulk before collection routes
router.get(
  '/:subdomain/masters/property-type-rates/template',
  supabaseTenantAdminGuard,
  mastersBulkController.downloadPropertyTypeRatesTemplate
)
// Property type rates master (admin only)
router.get(
  '/:subdomain/masters/property-type-rates',
  supabaseTenantAdminGuard,
  propertyTypeRatesController.list
)
router.put(
  '/:subdomain/masters/property-type-rates',
  supabaseTenantAdminGuard,
  propertyTypeRatesController.upsert
)

// Protected - Update tenant settings (used by admin)
router.put(
  '/:subdomain/settings',
  supabaseTenantAdminGuard,
  upload.single('logo'),
  tenantController.updateSettings
)

// Masters bulk import (multipart file — citizens first, then properties in separate request)
router.post(
  '/:subdomain/masters/citizens/bulk',
  bulkImportRateLimit,
  supabaseTenantAdminGuard,
  mastersBulkUpload,
  mastersBulkController.importCitizens
)
router.post(
  '/:subdomain/masters/properties/bulk',
  bulkImportRateLimit,
  supabaseTenantAdminGuard,
  mastersBulkUpload,
  mastersBulkController.importProperties
)
router.post(
  '/:subdomain/masters/property-type-rates/bulk',
  bulkImportRateLimit,
  supabaseTenantAdminGuard,
  mastersBulkUpload,
  mastersBulkController.importPropertyTypeRates
)

// --- GP Admins ---
router.get('/:subdomain/admins/me', supabaseTenantAdminGuard, gpAdminsController.getMe)
router.get('/:subdomain/admins', supabaseTenantAdminGuard, gpAdminsController.list)
router.get('/:subdomain/admins/:id', supabaseTenantAdminGuard, gpAdminsController.getById)
router.post('/:subdomain/admins', supabaseTenantAdminGuard, gpAdminsController.create)
router.patch('/:subdomain/admins/:id', supabaseTenantAdminGuard, gpAdminsController.update)
router.delete('/:subdomain/admins/:id', supabaseTenantAdminGuard, gpAdminsController.delete)

// --- Announcements ---
router.get('/:subdomain/announcements', tenantGuard, announcementsController.list)
router.get('/:subdomain/announcements/:id', tenantGuard, announcementsController.getById)
router.post('/:subdomain/announcements', supabaseTenantAdminGuard, announcementsController.create)
router.patch('/:subdomain/announcements/:id', supabaseTenantAdminGuard, announcementsController.update)
router.delete('/:subdomain/announcements/:id', supabaseTenantAdminGuard, announcementsController.delete)

// --- Events ---
router.get('/:subdomain/events', tenantGuard, eventsController.list)
router.get('/:subdomain/events/:id', tenantGuard, eventsController.getById)
router.post('/:subdomain/events', supabaseTenantAdminGuard, eventsController.create)
router.patch('/:subdomain/events/:id', supabaseTenantAdminGuard, eventsController.update)
router.delete('/:subdomain/events/:id', supabaseTenantAdminGuard, eventsController.delete)

// --- Event Media ---
router.get('/:subdomain/events/:eventId/media', tenantGuard, eventMediaController.list)
router.get('/:subdomain/events/:eventId/media/:id', tenantGuard, eventMediaController.getById)
router.post('/:subdomain/events/:eventId/media', supabaseTenantAdminGuard, eventMediaController.create)
router.patch('/:subdomain/events/:eventId/media/:id', supabaseTenantAdminGuard, eventMediaController.update)
router.delete('/:subdomain/events/:eventId/media/:id', supabaseTenantAdminGuard, eventMediaController.delete)

// --- Gallery ---
router.get('/:subdomain/gallery', tenantGuard, galleryController.list)
router.get('/:subdomain/gallery/:id', tenantGuard, galleryController.getById)
router.post('/:subdomain/gallery', supabaseTenantAdminGuard, galleryController.create)
router.patch('/:subdomain/gallery/:id', supabaseTenantAdminGuard, galleryController.update)
router.delete('/:subdomain/gallery/:id', supabaseTenantAdminGuard, galleryController.delete)

// --- Post Holders ---
router.get('/:subdomain/post-holders', tenantGuard, postHoldersController.list)
router.get('/:subdomain/post-holders/:id', tenantGuard, postHoldersController.getById)
router.post('/:subdomain/post-holders', supabaseTenantAdminGuard, postHoldersController.create)
router.patch('/:subdomain/post-holders/:id', supabaseTenantAdminGuard, postHoldersController.update)
router.delete('/:subdomain/post-holders/:id', supabaseTenantAdminGuard, postHoldersController.delete)

export default router
