import { useState } from 'react'
import { Star } from 'lucide-react'
import CountdownBadge from './CountdownBadge'
import FreshnessRing from './marketing/FreshnessRing'
import StatusStepper from './StatusStepper'
import type { MyListing, PickupRequestInfo } from '../hooks/useMyListings'
import { useToast } from '../hooks/useToast'
import { categoryLabels, dietLabels } from '../lib/labels'
import { images } from '../lib/images'
import { foodPhotoUrl } from '../lib/storage'
import { outlinePill as outlineBtn, solidPill as solidBtn } from '../lib/ui'
import { api, messageOf } from '../lib/api'
import { freshness, shortTimeLabel, timeLeftLabel } from '../lib/time'

type Props = { listing: MyListing; now: number; onChanged: () => void }


// The request this listing is currently about (waiting, accepted, or finished)
function currentRequest(listing: MyListing): PickupRequestInfo | undefined {
  const requests = listing.pickup_requests
  return (
    requests.find((r) => r.status === 'pending') ??
    requests.find((r) => r.status === 'accepted') ??
    requests.find((r) => r.status === 'completed')
  )
}

function RatingPicker({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Rate this pickup" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
          onClick={() => onChange(n)}
          className="rounded p-1 text-green-700 hover:scale-110"
        >
          <Star size={26} fill={value !== null && n <= value ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

export default function MyListingCard({ listing, now, onChanged }: Props) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [askRating, setAskRating] = useState(false)
  const [rating, setRating] = useState<number | null>(null)

  const request = currentRequest(listing)
  const receiver = request?.organizations?.name ?? 'A receiver'
  const photo = foodPhotoUrl(listing.photo_path) ?? images.categories[listing.category]
  const isOpen = ['available', 'requested', 'confirmed'].includes(listing.status)

  // Runs one action, then shows a message and refreshes the list
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true)
    try {
      await action()
      toast(success)
    } catch (e) {
      toast(messageOf(e), 'error')
    } finally {
      setBusy(false)
      onChanged()
    }
  }

  function withdraw() {
    if (!window.confirm('Withdraw this listing? It will disappear from the map.')) return
    run(() => api(`/api/listings/${listing.id}/withdraw`, { method: 'POST' }), 'Listing withdrawn')
  }

  function accept() {
    if (!request) return
    run(
      () => api(`/api/requests/${request.id}/accept`, { method: 'POST' }),
      'Accepted. The receiver has been notified.'
    )
  }

  function decline() {
    if (!request) return
    run(
      () => api(`/api/requests/${request.id}/decline`, { method: 'POST' }),
      'Declined. Your food is back on the map.'
    )
  }

  function complete() {
    if (!request) return
    run(
      () => api(`/api/requests/${request.id}/complete`, { method: 'POST', body: { rating } }),
      'Marked as picked up. Thank you for sharing!'
    )
  }

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-green-100">
      <div className="flex gap-4 p-5">
        <img
          src={photo}
          alt={`Photo of ${listing.title}`}
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-2xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-green-900">{listing.title}</h2>
              <p className="text-sm text-muted">
                {listing.portions} portions · {categoryLabels[listing.category]} · {dietLabels[listing.diet]}
              </p>
              {isOpen && (
                <div className="mt-2">
                  <CountdownBadge preparedAt={listing.prepared_at} expiresAt={listing.expires_at} now={now} />
                </div>
              )}
              {listing.status === 'expired' && (
                <p className="mt-2 text-sm font-semibold text-green-900">Expired</p>
              )}
              {listing.status === 'cancelled' && (
                <p className="mt-2 text-sm font-semibold text-green-900">Withdrawn</p>
              )}
            </div>
            {isOpen && (
              <FreshnessRing
                fraction={freshness(listing.prepared_at, listing.expires_at, now)}
                center={shortTimeLabel(listing.expires_at, now)}
                label={timeLeftLabel(listing.expires_at, now)}
              />
            )}
          </div>
          <StatusStepper status={listing.status} />
        </div>
      </div>

      {/* A receiver is waiting for an answer */}
      {listing.status === 'requested' && request?.status === 'pending' && (
        <div className="border-t border-green-100 bg-green-100/50 p-5">
          <p className="font-semibold text-green-900">{receiver} wants this food.</p>
          {request.message && <p className="mt-1 text-sm text-muted">“{request.message}”</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={accept} disabled={busy} className={solidBtn}>
              Accept
            </button>
            <button type="button" onClick={decline} disabled={busy} className={outlineBtn}>
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Accepted: waiting for the receiver to collect it */}
      {listing.status === 'confirmed' && request?.status === 'accepted' && (
        <div className="border-t border-green-100 bg-green-100/50 p-5">
          <p className="font-semibold text-green-900">{receiver} is collecting this food.</p>
          {askRating ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted">How did the pickup go? (optional)</p>
              <RatingPicker value={rating} onChange={setRating} />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={complete} disabled={busy} className={solidBtn}>
                  {busy ? 'Saving…' : 'Confirm pickup'}
                </button>
                <button type="button" onClick={() => setAskRating(false)} disabled={busy} className={outlineBtn}>
                  Back
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setAskRating(true)} className={`${solidBtn} mt-3`}>
              Mark picked up
            </button>
          )}
        </div>
      )}

      {/* Finished */}
      {listing.status === 'picked_up' && request?.status === 'completed' && (
        <div className="border-t border-green-100 bg-green-50/70 p-5 text-sm text-green-900">
          <p>
            Picked up by <strong>{receiver}</strong>
            {request.rating ? ` · rated ${request.rating} out of 5` : ''}
          </p>
          {/* The receiver confirmed first, so the donor has not rated yet */}
          {!request.rating && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-muted">How did it go?</span>
              <RatingPicker value={rating} onChange={setRating} />
              <button
                type="button"
                onClick={() =>
                  run(
                    () => api(`/api/requests/${request.id}/complete`, { method: 'POST', body: { rating } }),
                    'Thanks for the rating!'
                  )
                }
                disabled={busy || rating === null}
                className={solidBtn}
              >
                Save rating
              </button>
            </div>
          )}
        </div>
      )}

      {/* Nobody has asked yet */}
      {listing.status === 'available' && (
        <div className="border-t border-green-100 p-5">
          <button type="button" onClick={withdraw} disabled={busy} className={outlineBtn}>
            Withdraw listing
          </button>
        </div>
      )}
    </article>
  )
}