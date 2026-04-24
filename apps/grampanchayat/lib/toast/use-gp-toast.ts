'use client'

import { useMemo } from 'react'
import { gpToast } from './gp-toast'

/**
 * Returns the same `gpToast` singleton; useful in client components if you later need
 * scoped defaults or want a stable object for effect deps.
 */
export function useGpToast() {
  return useMemo(() => gpToast, [])
}
