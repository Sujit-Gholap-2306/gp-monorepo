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
  onboarding: {
    status: 'onboarding',
    markReady: 'onboarding/mark-ready',
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
    n09List: 'namune/9',
    n09Citizens: 'namune/9/citizens',
    n09Generate: 'namune/9/generate',
    n09OpeningTemplate: 'namune/9/opening-template',
    n09OpeningBalances: 'namune/9/opening-balances',
    n09ById: (demandId: string) => `namune/9/${demandId}`,
    n05List: 'namune/5',
    n06List: 'namune/6',
    n10Create: 'namune/10',
    n10List: 'namune/10',
    n10ById: (id: string) => `namune/10/${id}`,
    n10Void: (id: string) => `namune/10/${id}/void`,
  },
} as const
