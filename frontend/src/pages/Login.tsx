import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import Field from '../components/Field'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { errorBox, linkText, primaryBtn } from '../lib/ui'

export default function Login() {
  const { user } = useProfile()
  const location = useLocation()
  // Where the user was heading before being asked to log in
  const from = (location.state as { from?: string } | null)?.from
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from && from.startsWith('/') ? from : '/dashboard'} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to share or collect food near you.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        <div>
          <Field label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          <p className="mt-2 text-right text-sm">
            <Link to="/forgot-password" className={linkText}>Forgot your password?</Link>
          </p>
        </div>

        {error && <p className={errorBox}>{error}</p>}

        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>

        <p className="pt-2 text-center text-sm text-muted">
          New here? <Link to="/register" className={linkText}>Create an account</Link>
        </p>
      </form>
    </AuthCard>
  )
}