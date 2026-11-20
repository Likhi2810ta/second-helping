import { useApi } from './useApi'

export type Impact = {
  meals: number
  kg_food: number
  kg_co2: number
  donors: number
  receivers: number
}

export function useImpactStats() {
  const { data, error, loading } = useApi<Impact>('/api/impact', { auth: false })
  return { data, error, loading }
}
