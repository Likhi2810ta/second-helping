import type { Database } from '../types/database'
import { useApi } from './useApi'

export type EventItem = Database['public']['Tables']['events']['Row']

export function useEvents(limit = 3) {
  const { data, error, loading } = useApi<EventItem[]>(`/api/events?limit=${limit}`, { auth: false })
  return { data, error, loading }
}
