/**
 * Shared form primitives for admin forms.
 * Consistent styling, sizing, and focus states.
 */

interface FieldProps {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  type?: string
  placeholder?: string
  hint?: string
}

export function Field({ label, name, defaultValue = '', required, type = 'text', placeholder, hint }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-foreground/80">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="h-10 rounded-md border border-gp-border bg-card px-3 text-sm placeholder:text-gp-muted/60 focus:outline-none focus:ring-2 focus:ring-gp-primary/40 focus:border-gp-primary transition-colors"
      />
      {hint && <p className="text-[11px] text-gp-muted">{hint}</p>}
    </div>
  )
}

interface TextareaFieldProps {
  label: string
  name: string
  defaultValue?: string
  rows?: number
  placeholder?: string
  hint?: string
}

export function TextareaField({ label, name, defaultValue = '', rows = 4, placeholder, hint }: TextareaFieldProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-foreground/80">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-md border border-gp-border bg-card px-3 py-2 text-sm placeholder:text-gp-muted/60 focus:outline-none focus:ring-2 focus:ring-gp-primary/40 focus:border-gp-primary transition-colors resize-y"
      />
      {hint && <p className="text-[11px] text-gp-muted">{hint}</p>}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  name: string
  defaultValue?: string
  options: Array<{ value: string; label: string }>
  hint?: string
}

export function SelectField({ label, name, defaultValue, options, hint }: SelectFieldProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-foreground/80">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-gp-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary/40 focus:border-gp-primary transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-[11px] text-gp-muted">{hint}</p>}
    </div>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="rounded-xl border border-gp-border bg-card p-5 sm:p-6 grid gap-4">
      <div>
        <h2 className="font-display text-sm font-bold text-foreground">{title}</h2>
        {description && (
          <p className="text-xs text-gp-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  )
}

interface SubmitButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'cta'
}

export function SubmitButton({ children, variant = 'primary' }: SubmitButtonProps) {
  const classes =
    variant === 'cta'
      ? 'bg-gp-cta text-white hover:bg-gp-cta/90'
      : 'bg-gp-primary text-gp-primary-fg hover:bg-gp-primary-hover'
  return (
    <button
      type="submit"
      className={`inline-flex items-center justify-center rounded-md ${classes} px-5 h-10 text-sm font-medium transition-colors w-fit shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gp-primary/40 focus:ring-offset-2`}
    >
      {children}
    </button>
  )
}
