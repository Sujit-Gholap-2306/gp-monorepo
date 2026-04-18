'use client'

import { useQuery } from '@tanstack/react-query'
import { getMasterSnapshot } from './repository'

export const MASTERS_QUERY_KEY = ['masters', 'snapshot'] as const

export function useMasterSnapshot() {
  return useQuery({
    queryKey: MASTERS_QUERY_KEY,
    queryFn: getMasterSnapshot,
    staleTime: 60 * 1000,
  })
}
