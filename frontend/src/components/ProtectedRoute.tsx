import { Navigate, Outlet } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import type { Profile } from '../types'
import Spinner from './Spinner'

type Role = Profile['role']

type Props = {
  roles?: Role[] // if set, only these roles may enter
  requireOrg?: boolean // if true, non-admins must have an organisation first
}

export default function ProtectedRoute({ roles, requireOrg = true }: Props) {
  const { loading, user, profile, organization, signOut } = useProfile()

  if (loading) return <Spinner />

  if (!user) return <Navigate to="/login" replace />

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-danger">We could not load your profile.</p>
        <button
          onClick={signOut}
          className="rounded-full border border-green-600 px-5 py-2 font-semibold text-green-700"
        >
          Log out
        </button>
      </div>
    )
  }

  if (requireOrg && profile.role !== 'admin' && !organization) {
    return <Navigate to="/onboarding" replace />
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}