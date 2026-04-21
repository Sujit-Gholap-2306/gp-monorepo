'use client'

import { useState, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const params = useParams()
  const tenant = params.tenant as string

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError('लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.')
        return
      }

      router.push(`/${tenant}/admin/dashboard`)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gp-surface px-4">
      <div className="w-full max-w-sm bg-card rounded-xl border border-gp-border p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gp-primary mb-1">प्रशासक लॉगिन</h1>
        <p className="text-sm text-gp-muted mb-6">Admin Login</p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              ईमेल
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gp-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              पासवर्ड
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gp-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-gp-primary text-white py-2 text-sm font-medium hover:bg-gp-primary-hover disabled:opacity-60 transition-colors"
          >
            {isPending ? 'लोड होत आहे...' : 'प्रवेश करा'}
          </button>
        </form>
      </div>
    </div>
  )
}
