import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Test() {
  const [rows, setRows] = useState<unknown[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('ping')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRows(data)
      })
  }, [])

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold text-green-900">Supabase connection test</h1>
      {error && <p className="mt-4 text-danger">Error: {error}</p>}
      {!error && !rows && <p className="mt-4 text-muted">Loading…</p>}
      {rows && (
        <pre className="mt-4 rounded-lg bg-green-100 p-4 text-green-900">
          {JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </main>
  )
}