import type { ExternalToast, ToasterProps } from 'sonner'

/** Base duration for transient toasts (also set on `<AppToaster />` via `toastOptions`). */
export const GP_TOAST_DURATION_MS = 5_000

/**
 * Global `<Toaster />` props — position, density, and default options for every toast.
 * Override per-toast via `gpToast.*(message, { ... })`.
 */
export const appToasterProps = {
  position:      'top-center',
  expand:          true,
  visibleToasts:   4,
  richColors:      true,
  closeButton:     true,
  toastOptions: {
    duration:    GP_TOAST_DURATION_MS,
    closeButton: true,
  },
} satisfies ToasterProps

/** Per-call overrides (id, description, duration, className, …). */
export type GpToastOptions = Partial<ExternalToast>
