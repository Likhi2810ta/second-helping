import { Link } from 'react-router-dom'
import StatCard from './StatCard'
import { useMyListings } from '../hooks/useMyListings'
import { useNow } from '../hooks/useNow'
import { useProfile } from '../hooks/useProfile'
import { buildActivity, timeAgo } from '../lib/activity'

export default function DonorDashboard() {
  const { profile, organization } = useProfile()
  const now = useNow()
  const { data, error, loading } = useMyListings(organization?.id)

  const listings = data ?? []
  const live = listings.filter((l) => l.status === 'available').length
  const waiting = listings.filter(
    (l) => l.status === 'requested' && l.pickup_requests.some((r) => r.status === 'pending')
  ).length
  const finished = listings.filter((l) => l.status === 'picked_up')
  const meals = finished.reduce((sum, l) => sum + l.portions, 0)
  const activity = buildActivity(listings, now).slice(0, 6)
  const verified = organization?.status === 'verified'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Hello, {profile?.full_name}</h1>
          <p className="mt-1 text-muted">{organization?.name}</p>
        </div>

        {verified ? (
          <Link
            to="/post"
            className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Post surplus food
          </Link>
        ) : (
          <div className="text-right">
            <span
              aria-disabled="true"
              className="inline-block rounded-full bg-green-600 px-6 py-3 font-semibold text-white opacity-50"
            >
              Post surplus food
            </span>
            <p className="mt-1 text-xs text-muted">Unlocks after admin approval</p>
          </div>
        )}
      </div>

      {error && <p className="mt-6 text-danger">We could not load your numbers. Please refresh the page.</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-green-100" />)
        ) : (
          <>
            <StatCard label="Live listings" value={live} to="/my-listings" />
            <StatCard
              label="Waiting for your answer"
              value={waiting}
              to="/my-listings?tab=requested"
              highlight={waiting > 0}
            />
            <StatCard label="Meals donated" value={meals} />
            <StatCard label="Pickups completed" value={finished.length} to="/my-listings?tab=completed" />
          </>
        )}
      </div>

      <section aria-labelledby="activity-heading" className="mt-8">
        <h2 id="activity-heading" className="text-xl font-bold text-green-900">
          Recent activity
        </h2>

        {!loading && activity.length === 0 && (
          <p className="mt-3 rounded-2xl bg-white p-6 text-muted ring-1 ring-green-100">
            Nothing has happened yet. Post your first listing to get started.
          </p>
        )}

        {activity.length > 0 && (
          <ul className="mt-3 divide-y divide-green-100 rounded-2xl bg-white ring-1 ring-green-100">
            {activity.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="text-green-900">{item.text}</span>
                <time dateTime={item.at} className="shrink-0 text-sm text-muted">
                  {timeAgo(item.at, now)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}