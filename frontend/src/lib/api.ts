import { supabase } from './supabase'

// In development Vite forwards /api to the FastAPI server (see vite.config.ts).
// In production set VITE_API_URL to the API's address.
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Options = { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; auth?: boolean }

// FastAPI puts the reason in "detail": a string, or a list of validation errors
function errorMessage(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg)
  return fallback
}

// Calls the Second Helping API, sending the logged-in user's Supabase token
export async function api<T = unknown>(path: string, { method = 'GET', body, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const { data } = await supabase.auth.getSession()
    if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`
  }

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new ApiError(res.status, errorMessage(data?.detail, 'Something went wrong. Please try again.'))
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// Turns any thrown value into a message we can show in a toast
export function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}
