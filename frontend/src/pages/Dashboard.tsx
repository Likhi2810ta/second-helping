import { Link } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { linkText } from '../lib/ui'

export default function Dashboard() {
  const { loading, user, profile, organization, signOut } = useProfile()

  if (loading) return <p className="p-10 text-muted">Loading…</p>

  if (!user) {
    return (
      <p className="p-10">
        You are not logged in. <Link to="/login" className={linkText}>Log in</Link>
      </p>
    )
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold text-green-900">Hello, {profile?.full_name}</h1>
      <p className="mt-2 text-muted">
        Role: {profile?.role} · Organisation: {organization?.name ?? 'not set up yet'}
        {organization ? ` (${organization.status})` : ''}
      </p>
      <button
        onClick={signOut}
        className="mt-6 rounded-full border border-green-600 px-5 py-2 font-semibold text-green-700"
      >
        Log out
      </button>
    </main>
  )
}