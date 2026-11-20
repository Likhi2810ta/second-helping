import { Building2, Leaf, Scale, Trophy, UtensilsCrossed } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import { useApi } from '../../hooks/useApi'
import { listingStatusLabels } from '../../lib/labels'
import { card } from '../../lib/ui'
import type { AdminReport, ListingStatus } from '../../types/api'

const barColor: Record<ListingStatus, string> = {
  available: 'bg-green-400',
  requested: 'bg-warn',
  confirmed: 'bg-sky-400',
  picked_up: 'bg-green-600',
  expired: 'bg-gray-300',
  cancelled: 'bg-gray-200',
}

// A simple horizontal bar per row, scaled to the largest value
function Bars({ rows }: { rows: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm">
            <span className="text-ink">{r.label}</span>
            <span className="font-semibold text-ink">{r.value.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-green-50">
            <div className={`h-full rounded-full ${r.color}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function RescueRing({ percent }: { percent: number | null }) {
  const r = 52
  const c = 2 * Math.PI * r
  const p = percent ?? 0
  return (
    <div className="relative mx-auto h-40 w-40" role="img" aria-label={percent === null ? 'No data yet' : `${p}% of food rescued`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" className="stroke-green-50" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p / 100)}
          className="stroke-green-600 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-extrabold text-ink">{percent === null ? '–' : `${p}%`}</span>
        <span className="text-xs text-muted">rescued</span>
      </span>
    </div>
  )
}

export default function AdminReports() {
  const { data, error, errorMessage, loading } = useApi<AdminReport>('/api/admin/reports')

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Reports" subtitle="How much food the platform is saving, and who is helping most." />

      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-3xl bg-green-100/60" />
          ))}
        </div>
      )}
      {error && <p className="mt-8 text-danger">{errorMessage}</p>}

      {data && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={UtensilsCrossed} label="Meals shared" value={data.impact.meals} />
            <StatCard icon={Scale} label="Kg of food saved" value={Math.round(data.impact.kg_food)} />
            <StatCard icon={Leaf} label="Kg CO₂ avoided" value={Math.round(data.impact.kg_co2)} />
            <StatCard icon={Building2} label="Verified partners" value={data.impact.donors + data.impact.receivers} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section className={`${card} p-6`}>
              <h2 className="font-bold text-ink">Rescue rate</h2>
              <p className="mt-1 text-sm text-muted">Picked up, out of all listings that closed.</p>
              <div className="mt-6">
                <RescueRing percent={data.rescue_rate} />
              </div>
            </section>

            <section className={`${card} p-6 lg:col-span-2`}>
              <h2 className="font-bold text-ink">Listings by status</h2>
              <div className="mt-5">
                <Bars
                  rows={(Object.keys(listingStatusLabels) as ListingStatus[]).map((s) => ({
                    label: listingStatusLabels[s],
                    value: data.listings[s] ?? 0,
                    color: barColor[s],
                  }))}
                />
              </div>
            </section>

            <section className={`${card} p-6`}>
              <h2 className="font-bold text-ink">Organisations</h2>
              <div className="mt-5">
                <Bars
                  rows={[
                    { label: 'Verified', value: data.organizations.verified, color: 'bg-green-600' },
                    { label: 'Waiting', value: data.organizations.pending, color: 'bg-warn' },
                    { label: 'Rejected', value: data.organizations.rejected, color: 'bg-danger/70' },
                  ]}
                />
              </div>
            </section>

            <section className={`${card} p-6 lg:col-span-2`}>
              <h2 className="flex items-center gap-2 font-bold text-ink">
                <Trophy size={18} className="text-warn" aria-hidden="true" /> Top donors
              </h2>
              {data.top_donors.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No completed pickups yet.</p>
              ) : (
                <ol className="mt-4 divide-y divide-green-100">
                  {data.top_donors.map((d, i) => (
                    <li key={d.name} className="flex items-center gap-4 py-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          i === 0 ? 'bg-warn/20 text-ink' : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold text-ink">{d.name}</span>
                      <span className="text-sm text-muted">{d.meals.toLocaleString('en-IN')} meals</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}
