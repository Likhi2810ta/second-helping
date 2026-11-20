import { Link } from 'react-router-dom'
import {
  BellRing,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Lightbulb,
  PlusCircle,
  Radio,
  Send,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react'
import EmptyState from './EmptyState'
import StatCard from './StatCard'
import WelcomeBanner from './WelcomeBanner'
import { useMyListings } from '../hooks/useMyListings'
import { useNow } from '../hooks/useNow'
import { useProfile } from '../hooks/useProfile'
import { buildActivity, timeAgo } from '../lib/activity'
import { images } from '../lib/images'
import { card, outlinePill, solidPill } from '../lib/ui'

// Picks an icon for each activity line from its id suffix
const activityIcon = { posted: Send, requested: BellRing, done: CheckCircle2, expired: XCircle } as const

const tips = [
  'Add a clear photo. Listings with photos are requested faster.',
  'Set an honest "safe to eat" time so NGOs can plan their trip.',
  'Answer requests quickly. The food is reserved while you decide.',
]

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
    <div className="space-y-8">
      <WelcomeBanner
        name={profile?.full_name}
        image={images.steps.post}
        subtitle={
          <>
            {organization?.name}. {verified ? 'Have something to share today?' : 'You can post once an admin approves you.'}
          </>
        }
        action={
          <>
            {verified ? (
              <Link to="/post" className={solidPill}>
                <PlusCircle size={18} aria-hidden="true" /> Post surplus food
              </Link>
            ) : (
              <span aria-disabled="true" className={`${solidPill} cursor-not-allowed opacity-50`}>
                <Clock3 size={18} aria-hidden="true" /> Waiting for approval
              </span>
            )}
            <Link to="/my-listings" className={outlinePill}>
              <ClipboardList size={18} aria-hidden="true" /> My listings
            </Link>
          </>
        }
      />

      {error && <p className="text-danger">We could not load your numbers. Please refresh the page.</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-green-100/60" />)
        ) : (
          <>
            <StatCard icon={Radio} label="Live listings" value={live} to="/my-listings?tab=live" />
            <StatCard
              icon={BellRing}
              label="Waiting for your answer"
              value={waiting}
              to="/my-listings?tab=requested"
              highlight={waiting > 0}
            />
            <StatCard icon={UtensilsCrossed} label="Meals donated" value={meals} />
            <StatCard icon={CheckCircle2} label="Pickups completed" value={finished.length} to="/my-listings?tab=completed" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="activity-heading" className="lg:col-span-2">
          <h2 id="activity-heading" className="text-xl font-bold text-ink">
            Recent activity
          </h2>

          {!loading && activity.length === 0 && (
            <div className="mt-4">
              <EmptyState
                icon={Send}
                title="Nothing has happened yet"
                text="Post your first listing and you will see requests and pickups here."
              />
            </div>
          )}

          {activity.length > 0 && (
            <ul className={`${card} mt-4 divide-y divide-green-100`}>
              {activity.map((item) => {
                const kind = item.id.split('-').pop() as keyof typeof activityIcon
                const Icon = activityIcon[kind] ?? Send
                return (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-ink">{item.text}</span>
                    <time dateTime={item.at} className="shrink-0 text-xs text-muted">
                      {timeAgo(item.at, now)}
                    </time>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <aside className="h-fit rounded-3xl bg-green-50 p-6 ring-1 ring-green-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm">
            <Lightbulb size={20} aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-bold text-ink">Tips for faster pickups</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted">
            {tips.map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
