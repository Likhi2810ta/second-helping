import { useState, type FormEvent } from 'react'
import { Mail, Send } from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import { api } from '../../lib/api'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Newsletter() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const value = email.trim().toLowerCase()
    if (!EMAIL.test(value)) {
      setError('Please enter a valid email address.')
      return
    }

    // The API answers the same way for emails already on the list,
    // so nobody can use this form to find out who is subscribed.
    setBusy(true)
    try {
      await api('/api/subscribers', { method: 'POST', body: { email: value }, auth: false })
    } catch {
      setBusy(false)
      setError('Something went wrong. Please try again.')
      return
    }
    setBusy(false)

    setEmail('')
    toast('Thanks for subscribing!')
  }

  return (
    <section aria-label="Newsletter" className="px-4 pb-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl bg-green-50 p-6 ring-1 ring-green-100 sm:p-8 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm">
            <Mail size={24} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-ink">Stay updated</h2>
            <p className="text-sm text-muted">Occasional news on our impact, new events and ways to help.</p>
          </div>
        </div>

        <div className="w-full lg:max-w-md">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'newsletter-error' : undefined}
            className="w-full rounded-full border border-green-200 bg-white px-5 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {busy ? 'Subscribing…' : 'Subscribe'} <Send size={16} aria-hidden="true" />
          </button>
        </form>

        {error && (
          <p id="newsletter-error" role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}
        </div>
      </div>
    </section>
  )
}