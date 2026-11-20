import { Link } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  Hourglass,
  ListChecks,
  MapPinned,
  ShieldCheck,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'
import DonorDashboard from '../components/DonorDashboard'
import EmptyState from '../components/EmptyState'
import PickupCard from '../components/PickupCard'
import StatCard from '../components/StatCard'
import WelcomeBanner from '../components/WelcomeBanner'
import { useApi } from '../hooks/useApi'
import { useNow } from '../hooks/useNow'
import { usePickups } from '../hooks/usePickups'
import { useProfile } from '../hooks/useProfile'
import { images } from '../lib/images'
import { isActivePickup } from '../lib/pickups'
import { outlinePill, solidPill } from '../lib/ui'
import type { AdminReport } from '../types/api'

function ReceiverDashboard() {
  const { profile, organization } = useProfile()
  const now = useNow(30_000)
  const { data, error, loading, reload } = usePickups()
  const verified = organization?.status === 'verified'

  const all = data ?? []
  const active = all.filter((p) => isActivePickup(p, now))
  const pending = active.filter((p) => p.request_status === 'pending').length
  const confirmed = active.filter((p) => p.request_status === 'accepted').length
  const collected = all.filter((p) => p.request_status === 'completed')
  const meals = collected.reduce((sum, p) => sum + p.portions, 0)

  return (
    <div className="space-y-8">
      <WelcomeBanner
        name={profile?.full_name}
        image={images.steps.pickup}
        subtitle={
          <>
            {organization?.name}. {verified ? 'Fresh food is waiting nearby.' : 'You can request food once an admin approves you.'}
          </>
        }
        action={
          <>
            <Link to="/find" className={solidPill}>
              <MapPinned size={18} aria-hidden="true" /> Find food nearby
            </Link>
            <Link to="/pickups" className={outlinePill}>
              <Truck size={18} aria-hidden="true" /> My pickups
            </Link>
          </>
        }
      />

      {error && (
        <p className="text-danger">We could not load your pickups. Please refresh the page in a moment.</p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-green-100/60" />)
        ) : (
          <>
            <StatCard icon={Hourglass} label="Waiting for donor" value={pending} to="/pickups" />
            <StatCard icon={Truck} label="Ready to collect" value={confirmed} to="/pickups" highlight={confirmed > 0} />
            <StatCard icon={CheckCircle2} label="Pickups completed" value={collected.length} to="/history" />
            <StatCard icon={UtensilsCrossed} label="Meals received" value={meals} />
          </>
        )}
      </div>

      <section aria-labelledby="active-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="active-heading" className="text-xl font-bold text-ink">
            Active pickups
          </h2>
          {active.length > 2 && (
            <Link to="/pickups" className="text-sm font-semibold text-green-700 hover:underline">
              See all {active.length}
            </Link>
          )}
        </div>

        {!loading && !error && active.length === 0 && (
          <div className="mt-4">
            <EmptyState
              icon={MapPinned}
              title="No active pickups"
              text="Browse the map to see food from verified donors around you."
              action={
                <Link to="/find" className={solidPill}>
                  Find food
                </Link>
              }
            />
          </div>
        )}

        <div className="mt-4 space-y-4">
          {active.slice(0, 2).map((p) => (
            <PickupCard key={p.request_id} pickup={p} now={now} onChanged={reload} />
          ))}
        </div>
      </section>
    </div>
  )
}

function AdminDashboard() {
  const { profile } = useProfile()
  const { data, error, loading } = useApi<AdminReport>('/api/admin/reports')
  const pending = data?.organizations.pending ?? 0
  const live = data ? data.listings.available + data.listings.requested + data.listings.confirmed : 0

  return (
    <div className="space-y-8">
      <WelcomeBanner
        name={profile?.full_name}
        image={images.impact}
        subtitle={
          pending > 0
            ? `${pending} ${pending === 1 ? 'organisation is' : 'organisations are'} waiting for your review.`
            : 'Everything is reviewed. Nice work.'
        }
        action={
          <>
            <Link to="/admin/verify" className={solidPill}>
              <ShieldCheck size={18} aria-hidden="true" /> Review organisations
            </Link>
            <Link to="/admin/reports" className={outlinePill}>
              <BarChart3 size={18} aria-hidden="true" /> Reports
            </Link>
          </>
        }
      />

      {error && <p className="text-danger">We could not load the numbers. Please refresh the page.</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-green-100/60" />)
        ) : (
          data && (
            <>
              <StatCard icon={Clock3} label="Waiting for review" value={pending} to="/admin/verify" highlight={pending > 0} />
              <StatCard icon={Building2} label="Verified organisations" value={data.organizations.verified} to="/admin/verify?status=verified" />
              <StatCard icon={ListChecks} label="Open listings" value={live} to="/admin/listings" />
              <StatCard icon={UtensilsCrossed} label="Meals shared" value={data.impact.meals} to="/admin/reports" />
            </>
          )
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useProfile()
  if (profile?.role === 'donor') return <DonorDashboard />
  if (profile?.role === 'receiver') return <ReceiverDashboard />
  return <AdminDashboard />
}
