import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

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

export function useMyListings(orgId: string | undefined) {
  const [data, setData] = useState<MyListing[] | null>(null)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!orgId) return
    let cancelled = false
    supabase
      .from('listings')
      .select(
        '*, pickup_requests(id, status, message, eta_minutes, requested_at, completed_at, rating, organizations(name))'
      )
      .eq('donor_org_id', orgId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(true)
          return
        }
        setError(false)
        setData((data ?? []) as unknown as MyListing[])
      })
    return () => {
      cancelled = true
    }
  }, [orgId, version])

  // Fetch again (the list stays on screen while it refreshes)
  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { data, error, loading: !data && !error, reload }
}