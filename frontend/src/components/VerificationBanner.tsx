import { Clock3, XCircle } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'

export default function VerificationBanner() {
  const { profile, organization } = useProfile()

  if (!profile || profile.role === 'admin' || !organization) return null

  if (organization.status === 'pending') {
    return (
      <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl bg-warn/10 px-4 py-3 text-sm text-ink ring-1 ring-warn/30">
        <Clock3 size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
        <p>
          <strong>Your organisation is waiting for admin approval.</strong> You can look around, but{' '}
          {profile.role === 'donor' ? 'posting food' : 'requesting food'} unlocks once you are verified.
        </p>
      </div>
    )
  }

  if (organization.status === 'rejected') {
    return (
      <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-ink ring-1 ring-danger/30">
        <XCircle size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
        <p>
          <strong>Your organisation was not approved.</strong> Reason: {organization.reject_reason ?? 'No reason was given.'}
        </p>
      </div>
    )
  }

  return null
}
