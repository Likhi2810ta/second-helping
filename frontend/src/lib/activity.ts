import type { MyListing } from '../hooks/useMyListings'

export type ActivityItem = { id: string; text: string; at: string }

// Turns listings and their requests into a "what happened lately" list, newest first
export function buildActivity(listings: MyListing[], now: number): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const l of listings) {
    items.push({ id: `${l.id}-posted`, text: `You posted “${l.title}”`, at: l.created_at })

    for (const r of l.pickup_requests) {
      const who = r.organizations?.name ?? 'A receiver'
      items.push({ id: `${r.id}-requested`, text: `${who} requested “${l.title}”`, at: r.requested_at })
      if (r.completed_at) {
        items.push({ id: `${r.id}-done`, text: `“${l.title}” was picked up by ${who}`, at: r.completed_at })
      }
    }

    if (l.status === 'expired') {
      items.push({ id: `${l.id}-expired`, text: `“${l.title}” expired`, at: l.expires_at })
    }
  }

  return items
    .filter((i) => new Date(i.at).getTime() <= now)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

// "5 minutes ago", "yesterday", "3 days ago"
export function timeAgo(iso: string, now: number): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000) // negative = in the past
  const abs = Math.abs(seconds)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (abs < 60) return 'just now'
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour')
  return rtf.format(Math.round(seconds / 86400), 'day')
}