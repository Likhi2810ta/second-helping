import { useMemo, useState } from 'react'
import { ListChecks, Search } from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { useApi } from '../../hooks/useApi'
import { categoryLabels, listingStatusLabels, listingStatusTone } from '../../lib/labels'
import { card, inputClass } from '../../lib/ui'
import type { AdminListing, ListingStatus } from '../../types/api'

const statuses = Object.keys(listingStatusLabels) as ListingStatus[]

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

// The organisation that requested or collected this listing, if any
function receiverOf(l: AdminListing) {
  const r =
    l.pickup_requests.find((p) => p.status === 'completed') ??
    l.pickup_requests.find((p) => p.status === 'accepted') ??
    l.pickup_requests.find((p) => p.status === 'pending')
  return r?.organizations?.name ?? null
}

export default function AdminListings() {
  const [status, setStatus] = useState<ListingStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const { data, error, errorMessage, loading } = useApi<AdminListing[]>(
    `/api/admin/listings?status=${status}&limit=300`,
    { refreshMs: 60_000 }
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data ?? []
    return (data ?? []).filter(
      (l) => l.title.toLowerCase().includes(q) || (l.organizations?.name ?? '').toLowerCase().includes(q)
    )
  }, [data, query])

  return (
    <div>
      <PageHeader eyebrow="Admin" title="All listings" subtitle="Every listing on the platform, newest first." />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="admin-search" className="sr-only">
            Search by food or donor
          </label>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 mt-0.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="admin-search"
            type="search"
            placeholder="Search by food or donor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputClass} pl-11`}
          />
        </div>
        <label htmlFor="admin-status" className="sr-only">
          Status
        </label>
        <select
          id="admin-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ListingStatus | 'all')}
          className={`${inputClass} sm:w-52`}
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {listingStatusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading && <div className="h-64 animate-pulse rounded-3xl bg-green-100/60" />}
        {error && <p className="text-danger">{errorMessage}</p>}
        {data && rows.length === 0 && <EmptyState icon={ListChecks} title="No listings match" />}

        {rows.length > 0 && (
          <div className={`${card} overflow-hidden`}>
            <p className="border-b border-green-100 px-5 py-3 text-sm text-muted" role="status">
              {rows.length} {rows.length === 1 ? 'listing' : 'listings'}
            </p>
            <ul className="divide-y divide-green-100">
              {rows.map((l) => {
                const receiver = receiverOf(l)
                return (
                  <li key={l.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[2fr_1.4fr_1fr_auto] sm:items-center sm:gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{l.title}</p>
                      <p className="truncate text-sm text-muted">
                        {l.organizations?.name ?? 'Unknown donor'} · {l.portions} portions · {categoryLabels[l.category]}
                      </p>
                    </div>
                    <p className="truncate text-sm text-muted">{receiver ? `→ ${receiver}` : 'No requests'}</p>
                    <p className="text-sm text-muted">{formatDate(l.created_at)}</p>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${listingStatusTone[l.status]}`}
                    >
                      {listingStatusLabels[l.status]}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
