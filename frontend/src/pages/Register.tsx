import { useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { HandHeart, Store, type LucideIcon } from 'lucide-react'
import AuthCard from '../components/AuthCard'
import Field from '../components/Field'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { errorBox, linkText, noticeBox, primaryBtn } from '../lib/ui'

type Role = 'donor' | 'receiver'

const roles: { value: Role; title: string; text: string; icon: LucideIcon }[] = [
  { value: 'donor', title: 'Donor', text: 'I have surplus food to give', icon: Store },
  { value: 'receiver', title: 'Receiver', text: 'I collect food for people in need', icon: HandHeart },
]

export default function Register() {
  const { user } = useProfile()
  const [params] = useSearchParams()
  // "Join as a receiver" links open the form with that role picked
  const [role, setRole] = useState<Role>(() => (params.get('role') === 'receiver' ? 'receiver' : 'donor'))
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
    <AuthCard title="Create your account" subtitle="Join Second Helping in a minute. It is free.">
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="sr-only">I am joining as a</legend>
          {roles.map((r) => {
            const active = role === r.value
            const Icon = r.icon
            return (
              <label
                key={r.value}
                className={`cursor-pointer rounded-2xl border-2 p-4 text-sm transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-green-600/15 ${
                  active ? 'border-green-600 bg-green-50' : 'border-green-100 bg-white hover:border-green-200'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={active}
                  onChange={() => setRole(r.value)}
                  className="sr-only"
                />
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="mt-3 block font-bold text-ink">{r.title}</span>
                <span className="text-muted">{r.text}</span>
              </label>
            )
          })}
        </fieldset>

        <Field label="Full name" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
        <Field label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        <Field label="Phone" name="phone" type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} hint="10 digits" autoComplete="tel" required />
        <Field label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters" autoComplete="new-password" required />

        {error && <p className={errorBox}>{error}</p>}
        {notice && <p className={noticeBox}>{notice}</p>}

        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <p className="pt-2 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className={linkText}>Log in</Link>
        </p>
      </form>
    </AuthCard>
  )
}