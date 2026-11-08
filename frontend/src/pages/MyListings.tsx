import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom' // changed: added useSearchParams
import MyListingCard from '../components/MyListingCard'
import { useMyListings, type MyListing } from '../hooks/useMyListings'
import { useNow } from '../hooks/useNow'
import { useProfile } from '../hooks/useProfile'

type Status = MyListing['status']

const tabs = [
  { key: 'live', label: 'Live', match: (s: Status) => s === 'available', empty: 'You have no live listings.' },
  {
    key: 'requested',
    label: 'Requested',
    match: (s: Status) => s === 'requested' || s === 'confirmed',
    empty: 'No one has requested your food right now.',
  },
  { key: 'completed', label: 'Completed', match: (s: Status) => s === 'picked_up', empty: 'No completed pickups yet.' },
  {
    key: 'expired',
    label: 'Expired',
    match: (s: Status) => s === 'expired' || s === 'cancelled',
    empty: 'Nothing has expired or been withdrawn.',
  },
]

export default function MyListings() {
  const { organization } = useProfile()
  const now = useNow()
  const { data, error, loading, reload } = useMyListings(organization?.id)
  const [params] = useSearchParams() // changed: reads ?tab=... from the web address
  const [tabKey, setTabKey] = useState(() => params.get('tab') ?? 'live') // changed

  const tab = tabs.find((t) => t.key === tabKey) ?? tabs[0]
  const all = data ?? []
  const visible = all.filter((l) => tab.match(l.status))
  // Food that expires soonest goes first on the Live tab
  if (tab.key === 'live') visible.sort((a, b) => a.expires_at.localeCompare(b.expires_at))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-green-900">My listings</h1>
        <Link
          to="/post"
          className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Post food
        </Link>
      </div>

      <div role="group" aria-label="Filter listings" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = all.filter((l) => t.match(l.status)).length
          const active = t.key === tab.key
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={active}
              onClick={() => setTabKey(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                active ? 'bg-green-600 text-white' : 'bg-white text-green-900 ring-1 ring-green-100 hover:bg-green-100'
              }`}
            >
              {t.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-4">
        {loading && (
          <div aria-busy="true" className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-green-100" />
            ))}
          </div>
        )}

        {error && <p className="text-danger">We could not load your listings. Please refresh the page.</p>}

        {data && visible.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-green-100">
            <p className="text-muted">{tab.empty}</p>
            {tab.key === 'live' && (
              <Link to="/post" className="mt-3 inline-block font-semibold text-green-700 underline">
                Post your first listing
              </Link>
            )}
          </div>
        )}

        {visible.map((listing) => (
          <MyListingCard key={listing.id} listing={listing} now={now} onChanged={reload} />
        ))}
      </div>
    </div>
  )
}