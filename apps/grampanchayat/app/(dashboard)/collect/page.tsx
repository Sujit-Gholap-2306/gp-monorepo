'use client'

import { useForm, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SearchInput } from '@gp/shadcn/ui/search-input'
import { Button } from '@gp/shadcn/ui/button'

const schema = z.object({
  citizenQuery: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function CollectPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { citizenQuery: '' },
  })

  const { field, fieldState } = useController({
    control: form.control,
    name: 'citizenQuery',
  })

  return (
    <div className="flex max-w-xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">वसूली (नमुना १०)</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">वसूली — नागरिक शोध</p>
      </div>

      {/* TODO: on submit → query citizen by name/ID, show results, select → open payment modal */}
      <form className="space-y-4" onSubmit={form.handleSubmit(() => undefined)}>
        <div className="grid gap-2">
          <label htmlFor={field.name} className="text-sm font-medium text-foreground">
            नागरिक शोध
          </label>
          <p className="text-[0.8rem] text-muted-foreground">नाव किंवा नोंद क्रमांकाने शोधा</p>
          <SearchInput
            ref={field.ref}
            id={field.name}
            name={field.name}
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChange={(v) => field.onChange(v)}
            placeholder="उदा. पाटील..."
            debounceMs={300}
            className="h-11 rounded-xl border-border bg-card shadow-sm md:text-sm"
          />
          {fieldState.error?.message ? (
            <p className="text-[0.8rem] font-medium text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
        <Button type="submit" size="sm">
          पुढे
        </Button>
      </form>
    </div>
  )
}
