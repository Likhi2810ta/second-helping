import type { Pickup } from '../types/api'
import { isLive } from './time'

// How long after the safe-to-eat time an accepted pickup can still be confirmed
// (the receiver may have collected it on time but confirms later)
const CONFIRM_GRACE_MS = 24 * 60 * 60 * 1000

// A request is still in play while:
// - it is pending and the food has not expired, or
// - it is accepted and not yet confirmed (with a grace period after expiry)
export function isActivePickup(p: Pickup, now: number) {
  if (p.request_status === 'pending') return isLive(p.expires_at, now)
  if (p.request_status === 'accepted') return new Date(p.expires_at).getTime() + CONFIRM_GRACE_MS > now
  return false
}
