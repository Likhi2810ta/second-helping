import type { Pickup } from '../types/api'
import { useApi } from './useApi'

// The receiver's pickup requests, newest first. Refreshes every 30 seconds
// so an accepted request shows up without reloading the page.
export function usePickups() {
  return useApi<Pickup[]>('/api/pickups', { refreshMs: 30_000 })
}
