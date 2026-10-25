import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Impact = {
  meals: number
  kg_food: number
  kg_co2: number
  donors: number
  receivers: number
}

export function useImpactStats() {
  const [data, setData] = useState<Impact | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('impact_stats').then(({ data, error }) => {
      if (cancelled) return
      if (error || !data?.[0]) {
        setError(true)
        return
      }
      setData(data[0])
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error, loading: !data && !error }
}
