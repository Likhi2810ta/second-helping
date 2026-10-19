import { useProfile } from '../hooks/useProfile'

export default function VerificationBanner() {
  const { profile, organization } = useProfile()

  if (!profile || profile.role === 'admin' || !organization) return null

  if (organization.status === 'pending') {
    return (
      <div
        role="status"
        className="mb-4 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-green-900"
      >
        <strong>Your account is waiting for admin approval.</strong> You can browse, but{' '}
        {profile.role === 'donor' ? 'posting food' : 'requesting food'} unlocks after approval.
      </div>
    )
  }

  if (organization.status === 'rejected') {
    return (
      <div role="alert" className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-green-900">
        <strong>Your organisation was not approved.</strong>{' '}
        Reason: {organization.reject_reason ?? 'No reason was given.'}
      </div>
    )
  }

  return null
}