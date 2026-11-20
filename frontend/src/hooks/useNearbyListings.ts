import type { Category, Diet, NearbyListing } from '../types/api'
import { useApi } from './useApi'

export type { NearbyListing }

export type NearbyFilters = {
  diet?: Diet | null
  category?: Category | null
  sort?: 'distance' | 'expiry'
  refreshMs?: number
}

export function useNearbyListings(lat: number, lng: number, radiusKm: number, filters: NearbyFilters = {}) {
  const params = new URLSearchParams({
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
    radius_km: String(radiusKm),
    sort: filters.sort ?? 'distance',
  })
  if (filters.diet) params.set('diet', filters.diet)
  if (filters.category) params.set('category', filters.category)

  return useApi<NearbyListing[]>(`/api/listings/nearby?${params}`, {
    auth: false,
    refreshMs: filters.refreshMs,
  })
}
