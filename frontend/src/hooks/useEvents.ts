import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

export type EventItem = Database['public']['Tables']['events']['Row']

export function useEvents(limit = 3) {
  const [data, setData] = useState<EventItem[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const today = new Date().toISOString().slice(0, 10)
    supabase
      .from('events')
      .select('*')
      .gte('event_date', today)
      .order('event_date')
      .limit(limit)
      .then(({ data, error }) => {
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
  }, [limit])

  return { data, error, loading: !data && !error }
}