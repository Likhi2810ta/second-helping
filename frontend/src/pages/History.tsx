import { Link } from 'react-router-dom'
import { CheckCircle2, History as HistoryIcon, UtensilsCrossed, XCircle } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import MyListingCard from '../components/MyListingCard'
import PageHeader from '../components/PageHeader'
import PickupCard from '../components/PickupCard'
import StatCard from '../components/StatCard'
import { useMyListings } from '../hooks/useMyListings'
import { useNow } from '../hooks/useNow'
import { usePickups } from '../hooks/usePickups'
import { useProfile } from '../hooks/useProfile'
import { isActivePickup } from '../lib/pickups'
import { solidPill } from '../lib/ui'

function Skeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-3xl bg-green-100/60" />
      ))}
    </div>
  )
}

function DonorHistory() {
  const { organization } = useProfile()
  const now = useNow()
  const { data, error, loading, reload } = useMyListings(organization?.id)
  const past = (data ?? []).filter((l) => ['picked_up', 'expired', 'cancelled'].includes(l.status))
  const done = past.filter((l) => l.status === 'picked_up')
  const meals = done.reduce((sum, l) => sum + l.portions, 0)

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Pickups completed" value={done.length} />
        <StatCard icon={UtensilsCrossed} label="Meals donated" value={meals} />
        <StatCard icon={XCircle} label="Expired or withdrawn" value={past.length - done.length} />
      </div>
      <div className="mt-8 space-y-4">
        {loading && <Skeleton />}
        {error && <p className="text-danger">We could not load your history. Please refresh the page.</p>}
        {data && past.length === 0 && (
          <EmptyState
            icon={HistoryIcon}
            title="No history yet"
            text="Finished, expired and withdrawn listings will appear here."
            action={
              <Link to="/post" className={solidPill}>
                Post food
              </Link>
            }
          />
        )}
        {past.map((l) => (
          <MyListingCard key={l.id} listing={l} now={now} onChanged={reload} />
        ))}
      </div>
    </>
  )
}

function ReceiverHistory() {
  const now = useNow(30_000)
  const { data, error, loading, reload } = usePickups()
  const past = (data ?? []).filter((p) => !isActivePickup(p, now))
  const done = past.filter((p) => p.request_status === 'completed')
  const meals = done.reduce((sum, p) => sum + p.portions, 0)

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Pickups completed" value={done.length} />
        <StatCard icon={UtensilsCrossed} label="Meals received" value={meals} />
        <StatCard icon={XCircle} label="Declined, cancelled or expired" value={past.length - done.length} />
      </div>
      <div className="mt-8 space-y-4">
        {loading && <Skeleton />}
        {error && <p className="text-danger">We could not load your history. Please refresh the page.</p>}
        {data && past.length === 0 && (
          <EmptyState
            icon={HistoryIcon}
            title="No history yet"
            text="Collected, declined and cancelled pickups will appear here."
            action={
              <Link to="/find" className={solidPill}>
                Find food
              </Link>
            }
          />
        )}
        {past.map((p) => (
          <PickupCard key={p.request_id} pickup={p} now={now} onChanged={reload} />
        ))}
      </div>
    </>
  )
}

export default function History() {
  const { profile } = useProfile()
  const donor = profile?.role === 'donor'

  return (
    <div>
      <PageHeader
        eyebrow="History"
        title={donor ? 'Your sharing history' : 'Your pickup history'}
        subtitle={donor ? 'Everything you have shared, and what happened to it.' : 'Every pickup you have made through Second Helping.'}
      />
      {donor ? <DonorHistory /> : <ReceiverHistory />}
    </div>
  )
}
