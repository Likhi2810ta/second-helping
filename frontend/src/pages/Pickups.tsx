import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPinned, Truck } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import PickupCard from '../components/PickupCard'
import { useNow } from '../hooks/useNow'
import { usePickups } from '../hooks/usePickups'
import { isActivePickup } from '../lib/pickups'
import { solidPill, tabClass } from '../lib/ui'

const tabs = [
  { key: 'active', label: 'Active', empty: 'You have no open requests.' },
  { key: 'past', label: 'Past', empty: 'Nothing here yet.' },
] as const

export default function Pickups() {
  const now = useNow(30_000)
  const { data, error, loading, reload } = usePickups()
  const [tab, setTab] = useState<'active' | 'past'>('active')

  const all = data ?? []
  const active = all.filter((p) => isActivePickup(p, now))
  const past = all.filter((p) => !isActivePickup(p, now))
  const visible = tab === 'active' ? active : past
  const current = tabs.find((t) => t.key === tab)!

  return (
    <div>
      <PageHeader
        eyebrow="Receiver"
        title="My pickups"
        subtitle="Track your requests. Updates every 30 seconds."
        action={
          <Link to="/find" className={solidPill}>
            <MapPinned size={18} aria-hidden="true" /> Find food
          </Link>
        }
      />

      <div role="group" aria-label="Filter pickups" className="mt-8 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => setTab(t.key)}
            className={tabClass(tab === t.key)}
          >
            {t.label} ({t.key === 'active' ? active.length : past.length})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading && (
          <div aria-busy="true" className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-3xl bg-green-100/60" />
            ))}
          </div>
        )}

        {error && <p className="text-danger">We could not load your pickups. Please refresh the page.</p>}

        {data && visible.length === 0 && (
          <EmptyState
            icon={Truck}
            title={current.empty}
            action={
              tab === 'active' ? (
                <Link to="/find" className={solidPill}>
                  Find food nearby
                </Link>
              ) : undefined
            }
          />
        )}

        {visible.map((p) => (
          <PickupCard key={p.request_id} pickup={p} now={now} onChanged={reload} />
        ))}
      </div>
    </div>
  )
}
