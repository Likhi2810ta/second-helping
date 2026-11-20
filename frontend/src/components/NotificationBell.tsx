import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useNow } from '../hooks/useNow'
import { useToast } from '../hooks/useToast'
import { timeAgo } from '../lib/activity'
import { api } from '../lib/api'

type Notification = { id: string; title: string; body: string; read: boolean; created_at: string }

// Bell in the app header. Checks for news every 30 seconds and pops a toast
// when something new arrives while the app is open.
export default function NotificationBell() {
  const toast = useToast()
  const now = useNow()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const { data, reload } = useApi<Notification[]>('/api/notifications', { refreshMs: 30_000 })
  const seen = useRef<Set<string> | null>(null)

  const list = data ?? []
  const unread = list.filter((n) => !n.read).length

  // Toast anything that arrived since the last check (not on the first load)
  useEffect(() => {
    if (!data) return
    if (seen.current) {
      const fresh = data.filter((n) => !n.read && !seen.current!.has(n.id))
      if (fresh.length > 0) toast(fresh.length === 1 ? fresh[0].title : `${fresh.length} new notifications`)
    }
    seen.current = new Set(data.map((n) => n.id))
  }, [data, toast])

  // Closing refreshes the list, so the badge drops the items just read
  const close = useCallback(() => {
    setOpen(false)
    reload()
  }, [reload])

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  async function toggle() {
    if (open) {
      close()
      return
    }
    setOpen(true)
    // Opening the list counts as reading it
    if (unread > 0) {
      try {
        await api('/api/notifications/read', { method: 'POST' })
      } catch {
        // Not important: they stay unread and we try again next time
      }
    }
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink ring-1 ring-green-100 transition hover:text-green-700 hover:ring-green-200"
      >
        <Bell size={18} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-xl shadow-green-900/10 ring-1 ring-green-100">
          <p className="border-b border-green-100 bg-green-50/60 px-4 py-3 font-semibold text-ink">Notifications</p>
          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted">
              <BellOff size={22} aria-hidden="true" />
              You are all caught up.
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-green-100 overflow-y-auto">
              {list.map((n) => (
                <li key={n.id} className={`flex gap-3 px-4 py-3 ${n.read ? '' : 'bg-green-50/50'}`}>
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-green-600'}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    <p className="text-sm text-muted">{n.body}</p>
                    <time dateTime={n.created_at} className="text-xs text-muted/80">
                      {timeAgo(n.created_at, now)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
