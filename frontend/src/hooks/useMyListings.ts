import type { Database } from '../types/database'
import { useApi } from './useApi'

type Listing = Database['public']['Tables']['listings']['Row']

export type PickupRequestInfo = {
  id: string
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
  message: string | null
  eta_minutes: number | null
  requested_at: string
  completed_at: string | null
  rating: number | null
  organizations: { name: string } | null
}

export type MyListing = Listing & { pickup_requests: PickupRequestInfo[] }

// The donor's own listings with their pickup requests
export function useMyListings(orgId: string | undefined) {
  const { data, error, loading, reload } = useApi<MyListing[]>(orgId ? '/api/listings/mine' : null)
  return { data, error, loading, reload }
}
