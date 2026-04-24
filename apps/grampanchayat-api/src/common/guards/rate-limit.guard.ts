import rateLimit from 'express-rate-limit'

// Strict limiter for auth endpoints — prevent brute force
export const authRateLimit = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many attempts, please try again in 15 minutes' },
})

// Bulk import endpoints — admin-only but still cap to prevent runaway scripts
export const bulkImportRateLimit = rateLimit({
  windowMs:        60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many import requests, please wait a minute' },
})
