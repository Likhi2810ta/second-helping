import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

export type NearbyListing = Database['public']['Functions']['nearby_listings']['Returns'][number]

export function useNearbyListings(lat: number, lng: number, radiusKm: number) {
  const [data, setData] = useState<NearbyListing[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('nearby_listings', { lat, lng, radius_km: radiusKm }).then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        setError(true)
        return
      }
      setData(data ?? [])
    })
    return () => {
      cancelled = true
    }
  }, [lat, lng, radiusKm])

  return { data, error, loading: !data && !error }
}
