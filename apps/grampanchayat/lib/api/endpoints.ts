/**
 * Frontend API endpoint registry.
 * Keep all tenant-relative endpoint paths here so client modules avoid ad-hoc strings.
 */
export const tenantApiPaths = {
  admins: {
    me: 'admins/me',
    list: 'admins',
    byId: (id: string) => `admins/${id}`,
  },
  announcements: {
    list: 'announcements',
    byId: (id: string) => `announcements/${id}`,
  },
  events: {
    list: 'events',
    byId: (id: string) => `events/${id}`,
    mediaList: (eventId: string) => `events/${eventId}/media`,
    mediaById: (eventId: string, mediaId: string) => `events/${eventId}/media/${mediaId}`,
  },
  gallery: {
    list: 'gallery',
    byId: (id: string) => `gallery/${id}`,
  },
  postHolders: {
    list: 'post-holders',
    byId: (id: string) => `post-holders/${id}`,
  },
  namune: {
    n08List: 'namune/8',
    n08ById: (propertyId: string) => `namune/8/${propertyId}`,
  },
} as const
