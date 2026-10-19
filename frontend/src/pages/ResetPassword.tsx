import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import Field from '../components/Field'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { errorBox, linkText, primaryBtn } from '../lib/ui'

export default function ResetPassword() {
  const { user, loading } = useProfile()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) {
    return (
      <AuthCard title="Reset password">
        <p className="text-muted">Checking your link…</p>
      </AuthCard>
    )
  }

  if (!user) {
    return (
      <AuthCard title="Link expired" subtitle="Open this page from the link in your reset email, or request a new one.">
        <Link to="/forgot-password" className={linkText}>Request a new link</Link>
      </AuthCard>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) setError(error.message)
    else navigate('/dashboard', { replace: true })
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="New password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
        <Field label="Confirm password" name="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        {error && <p className={errorBox}>{error}</p>}
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthCard>
  )
}