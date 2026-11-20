import { useCallback, useEffect, useState } from 'react'
import { api, messageOf } from '../lib/api'

type Options = {
  auth?: boolean // send the login token (default true)
  refreshMs?: number // fetch again on this interval
}

type Result<T> = { path: string; data: T | null; error: string | null }

// Loads `path` from the API. Pass null to wait (for example until we know the user).
// Old data stays on screen while the same path refreshes, so lists do not flicker,
// but switching to a new path never shows the previous path's data.
export function useApi<T>(path: string | null, { auth = true, refreshMs }: Options = {}) {
  const [result, setResult] = useState<Result<T> | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!path) return
    let cancelled = false
    api<T>(path, { auth })
      .then((data) => {
        if (!cancelled) setResult({ path, data, error: null })
      })
      .catch((e) => {
        if (cancelled) return
        // Keep showing good data if only a background refresh failed
        setResult((prev) =>
          prev?.path === path && prev.data !== null ? prev : { path, data: null, error: messageOf(e) }
        )
      })
    return () => {
      cancelled = true
    }
  }, [path, auth, version])

  useEffect(() => {
    if (!path || !refreshMs) return
    const id = setInterval(() => setVersion((v) => v + 1), refreshMs)
    return () => clearInterval(id)
  }, [path, refreshMs])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const current = result && result.path === path ? result : null
  const data = current?.data ?? null
  const error = current?.error ?? null

  return { data, error: error !== null, errorMessage: error, loading: !data && !error, reload }
}
