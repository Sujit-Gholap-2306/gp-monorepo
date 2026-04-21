import type { Tables, TablesInsert, TablesUpdate } from './supabase/types'

export type Locale = 'mr' | 'en'

// ─── JSON column shapes ───────────────────────────────────────────────────────

export type VillageInfo = {
  name_mr?: string
  name_en?: string
  taluka?: string
  district?: string
  pincode?: string
}

export type ContactInfo = {
  phone?: string
  email?: string
  address_mr?: string
  address_en?: string
}

// ─── Domain types (derived from DB, no manual duplication) ───────────────────

export type GpTenant = Omit<Tables<'gp_tenants'>, 'village' | 'contact'> & {
  village: VillageInfo | null
  contact: ContactInfo | null
}

export type PostHolder = Tables<'post_holders'>

export type GpEvent = Tables<'events'>

export type EventMedia = Tables<'event_media'> & {
  type: 'photo' | 'video'
}

export type Announcement = Tables<'announcements'> & {
  category: 'general' | 'scheme' | 'notice'
}

export type Gallery = Tables<'gallery'> & {
  type: 'photo' | 'video'
}

export type GpAdmin = Tables<'gp_admins'> & {
  role: 'admin' | 'owner'
}

// ─── Insert / Update helpers ──────────────────────────────────────────────────

export type GpTenantInsert = TablesInsert<'gp_tenants'>
export type PostHolderInsert = TablesInsert<'post_holders'>
export type GpEventInsert = TablesInsert<'events'>
export type AnnouncementInsert = TablesInsert<'announcements'>
export type GalleryInsert = TablesInsert<'gallery'>

export type PostHolderUpdate = TablesUpdate<'post_holders'>
export type GpEventUpdate = TablesUpdate<'events'>
export type AnnouncementUpdate = TablesUpdate<'announcements'>
export type GalleryUpdate = TablesUpdate<'gallery'>
