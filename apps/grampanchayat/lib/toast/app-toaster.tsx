'use client'

import { Toaster } from 'sonner'
import { appToasterProps } from './toast-defaults'

/** Mount once under `app/providers.tsx`. Do not add a second `<Toaster />`. */
export function AppToaster() {
  return <Toaster {...appToasterProps} />
}
