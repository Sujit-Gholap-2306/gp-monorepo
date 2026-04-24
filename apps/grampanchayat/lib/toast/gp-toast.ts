import { toast as sonnerToast } from 'sonner'
import type { ExternalToast } from 'sonner'
import type { GpToastOptions } from './toast-defaults'

function apply(
  fn: (message: Parameters<typeof sonnerToast.error>[0], data?: ExternalToast) => ReturnType<
    typeof sonnerToast.error
  >,
  message: Parameters<typeof sonnerToast.error>[0],
  options?: GpToastOptions
) {
  return options != null && Object.keys(options).length > 0
    ? fn(message, options as ExternalToast)
    : fn(message)
}

/**
 * App-wide toast API. Defaults (duration, close button, position) come from `<AppToaster />`.
 * Use `options` for per-toast overrides; use `id` to replace/update the same toast (e.g. dedupe).
 */
export const gpToast = {
  success: (message: Parameters<typeof sonnerToast.success>[0], options?: GpToastOptions) =>
    apply(sonnerToast.success, message, options),

  error: (message: Parameters<typeof sonnerToast.error>[0], options?: GpToastOptions) =>
    apply(sonnerToast.error, message, options),

  info: (message: Parameters<typeof sonnerToast.info>[0], options?: GpToastOptions) =>
    apply(sonnerToast.info, message, options),

  warning: (message: Parameters<typeof sonnerToast.warning>[0], options?: GpToastOptions) =>
    apply(sonnerToast.warning, message, options),

  loading: (message: Parameters<typeof sonnerToast.loading>[0], options?: GpToastOptions) =>
    apply(sonnerToast.loading, message, options),

  message: (message: Parameters<typeof sonnerToast.message>[0], options?: GpToastOptions) =>
    apply(sonnerToast.message, message, options),

  /** `unknown` from catch / query — shows `Error#message` when possible. */
  fromError: (error: unknown, fallbackMessage: string, options?: GpToastOptions) => {
    const text = error instanceof Error ? error.message : fallbackMessage
    return apply(sonnerToast.error, text, options)
  },

  promise: sonnerToast.promise,

  dismiss: sonnerToast.dismiss,

  /** Escape hatch when you need the raw Sonner API. */
  raw:     sonnerToast,
} as const
