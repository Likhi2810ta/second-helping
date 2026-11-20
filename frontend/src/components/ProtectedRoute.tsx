import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { CloudOff } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { outlinePill, solidPill } from '../lib/ui'
import type { Profile } from '../types'
import Spinner from './Spinner'

type Role = Profile['role']

type Props = {
  roles?: Role[] // if set, only these roles may enter
  requireOrg?: boolean // if true, non-admins must have an organisation first
}

function ProfileError() {
  const { refresh, signOut } = useProfile()
  const [busy, setBusy] = useState(false)

  async function retry() {
    setBusy(true)
    await refresh()
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-green-100">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <CloudOff size={26} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink">We could not load your account</h1>
        <p className="mt-2 text-sm text-muted">
          The server may be starting up or your connection dropped. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={retry} disabled={busy} className={solidPill}>
            {busy ? 'Trying…' : 'Try again'}
          </button>
          <button type="button" onClick={signOut} className={outlinePill}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ roles, requireOrg = true }: Props) {
  const { loading, user, profile, organization } = useProfile()
  const location = useLocation()

  if (loading) return <Spinner />

  // Remember where they were going, so login can send them back
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />

  if (!profile) return <ProfileError />

  if (requireOrg && profile.role !== 'admin' && !organization) {
    return <Navigate to="/onboarding" replace />
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
