import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

export type Story = Database['public']['Tables']['stories']['Row']

export function useStories() {
  const [data, setData] = useState<Story[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('stories')
      .select('*')
      .order('name')
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
  }, [])

  return { data, error, loading: !data && !error }
}