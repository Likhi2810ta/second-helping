import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import Field from '../components/Field'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { errorBox, linkText, noticeBox, primaryBtn } from '../lib/ui'

type Role = 'donor' | 'receiver'

const roles: { value: Role; title: string; text: string }[] = [
  { value: 'donor', title: 'Donor', text: 'I have surplus food to give' },
  { value: 'receiver', title: 'Receiver', text: 'I collect food for people in need' },
]

export default function Register() {
  const { user } = useProfile()
  const [role, setRole] = useState<Role>('donor')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be 10 digits.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setBusy(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), phone, role } },
    })
    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }
    // If email confirmation is on, there is no session yet.
    if (!data.session) setNotice('Check your email to confirm your account, then log in.')
  }

  return (
    <AuthCard title="Create your account" subtitle="Join Second Helping in a minute.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <label
              key={r.value}
              className={`cursor-pointer rounded-xl border p-3 text-sm ${
                role === r.value ? 'border-green-600 bg-green-100' : 'border-muted/40'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={() => setRole(r.value)}
                className="sr-only"
              />
              <span className="block font-semibold text-green-900">{r.title}</span>
              <span className="text-muted">{r.text}</span>
            </label>
          ))}
        </div>

        <Field label="Full name" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
        <Field label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        <Field label="Phone" name="phone" type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} hint="10 digits" autoComplete="tel" required />
        <Field label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters" autoComplete="new-password" required />

        {error && <p className={errorBox}>{error}</p>}
        {notice && <p className={noticeBox}>{notice}</p>}

        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className={linkText}>Log in</Link>
        </p>
      </form>
    </AuthCard>
  )
}