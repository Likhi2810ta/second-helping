import { Link, useSearchParams } from 'react-router-dom'
import { ClipboardList, PlusCircle } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import MyListingCard from '../components/MyListingCard'
import PageHeader from '../components/PageHeader'
import { useMyListings, type MyListing } from '../hooks/useMyListings'
import { useNow } from '../hooks/useNow'
import { useProfile } from '../hooks/useProfile'
import { solidPill, tabClass } from '../lib/ui'

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
  // The open tab lives in the web address (?tab=requested), so links and Back work
  const [params, setParams] = useSearchParams()
  const tab = tabs.find((t) => t.key === params.get('tab')) ?? tabs[0]
  const setTabKey = (key: string) => setParams(key === 'live' ? {} : { tab: key }, { replace: true })
  const all = data ?? []
  const visible = all.filter((l) => tab.match(l.status))
  // Food that expires soonest goes first on the Live tab
  if (tab.key === 'live') visible.sort((a, b) => a.expires_at.localeCompare(b.expires_at))

  return (
    <div>
      <PageHeader
        eyebrow="Donor"
        title="My listings"
        subtitle="Answer requests, confirm pickups and keep track of what you shared."
        action={
          <Link to="/post" className={solidPill}>
            <PlusCircle size={18} aria-hidden="true" /> Post food
          </Link>
        }
      />

      <div role="group" aria-label="Filter listings" className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = all.filter((l) => t.match(l.status)).length
          const active = t.key === tab.key
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={active}
              onClick={() => setTabKey(t.key)}
              className={tabClass(active)}
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
              <div key={i} className="h-40 animate-pulse rounded-3xl bg-green-100/60" />
            ))}
          </div>
        )}

        {error && <p className="text-danger">We could not load your listings. Please refresh the page.</p>}

        {data && visible.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title={tab.empty}
            action={
              tab.key === 'live' ? (
                <Link to="/post" className={solidPill}>
                  Post a listing
                </Link>
              ) : undefined
            }
          />
        )}

        {visible.map((listing) => (
          <MyListingCard key={listing.id} listing={listing} now={now} onChanged={reload} />
        ))}
      </div>
    </div>
  )
}