import type { Database } from '../types/database'
import { useApi } from './useApi'

export type Story = Database['public']['Tables']['stories']['Row']

export function useStories() {
  const { data, error, loading } = useApi<Story[]>('/api/stories', { auth: false })
  return { data, error, loading }
}
