# Toasts (`@/lib/toast`)

Central place for in-app toasts (Sonner). **Use only this module** in components — do not `import { toast } from 'sonner'` in feature files.

- **`appToasterProps` / `AppToaster`** — global defaults (position, `richColors`, `toastOptions.duration`, etc.). Mounted once in `app/providers.tsx`.
- **`gpToast`** — `success`, `error`, `info`, `warning`, `loading`, `message`, `fromError` (unknown → string), `promise`, `dismiss`, and `raw` for edge cases.
- **`GpToastOptions`** — per-toast overrides (`id`, `description`, `duration`, `className`, …); same shape as Sonner’s options.
- **`useGpToast()`** — returns the `gpToast` singleton (handy for stable deps later).

Tweak **shared** behaviour in `toast-defaults.ts` (`GP_TOAST_DURATION_MS`, `appToasterProps`).
