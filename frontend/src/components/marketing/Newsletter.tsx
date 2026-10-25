import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabase'

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

    setBusy(true)
    const { error: insertError } = await supabase.from('subscribers').insert({ email: value })
    setBusy(false)

    // 23505 = this email is already on the list. We show the same friendly message
    // so nobody can use this form to find out who is subscribed.
    if (insertError && insertError.code !== '23505') {
      setError('Something went wrong. Please try again.')
      return
    }

    setEmail('')
    toast('Thanks for subscribing!')
  }

  return (
    <section aria-label="Newsletter" className="bg-green-100 px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-green-900">Stay in the loop</h2>
        <p className="mt-1 text-green-900/80">
          Get occasional updates on our impact, new events and ways to help.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-3 sm:flex-row">
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
            className="w-full rounded-full border border-muted/40 bg-white px-5 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
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
    </section>
  )
}