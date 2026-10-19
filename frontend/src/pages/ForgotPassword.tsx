import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import Field from '../components/Field'
import { supabase } from '../lib/supabase'
import { errorBox, linkText, noticeBox, primaryBtn } from '../lib/ui'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <AuthCard title="Forgot your password?" subtitle="We will email you a reset link.">
      {sent ? (
        <p className={noticeBox}>If an account exists for {email}, a reset link is on its way.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          {error && <p className={errorBox}>{error}</p>}
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className={linkText}>Back to log in</Link>
      </p>
    </AuthCard>
  )
}