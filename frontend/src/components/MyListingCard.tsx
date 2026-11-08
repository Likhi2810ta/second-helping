import { useState } from 'react'
import { Star, UtensilsCrossed } from 'lucide-react'
import CountdownBadge from './CountdownBadge'
import FreshnessRing from './marketing/FreshnessRing'
import StatusStepper from './StatusStepper'
import type { MyListing, PickupRequestInfo } from '../hooks/useMyListings'
import { useToast } from '../hooks/useToast'
import { categoryLabels, dietLabels } from '../lib/labels'
import { foodPhotoUrl } from '../lib/storage'
import { supabase } from '../lib/supabase'
import { freshness, shortTimeLabel, timeLeftLabel } from '../lib/time'

type Props = { listing: MyListing; now: number; onChanged: () => void }

const outlineBtn =
  'rounded-full border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60'
const solidBtn =
  'rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'

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
  const photo = foodPhotoUrl(listing.photo_path)
  const isOpen = ['available', 'requested', 'confirmed'].includes(listing.status)

  // Runs one action, then shows a message and refreshes the list
  async function run(action: () => PromiseLike<{ error: { message: string } | null }>, success: string) {
    setBusy(true)
    const { error } = await action()
    setBusy(false)
    if (error) toast(error.message, 'error')
    else toast(success)
    onChanged()
  }

  async function withdraw() {
    if (!window.confirm('Withdraw this listing? It will disappear from the map.')) return
    setBusy(true)
    const { data, error } = await supabase
      .from('listings')
      .update({ status: 'cancelled' })
      .eq('id', listing.id)
      .eq('status', 'available')
      .select('id')
    setBusy(false)
    if (error) toast(error.message, 'error')
    else if (!data?.length) toast('This listing just changed. Please check its status.', 'error')
    else toast('Listing withdrawn')
    onChanged()
  }

  function accept() {
    if (!request) return
    run(() => supabase.rpc('accept_request', { p_request: request.id }), 'Accepted. The receiver has been notified.')
  }

  function decline() {
    if (!request) return
    run(() => supabase.rpc('decline_request', { p_request: request.id }), 'Declined. Your food is back on the map.')
  }

  function complete() {
    if (!request) return
    run(
      () => supabase.rpc('complete_request', { p_request: request.id, p_rating: rating ?? undefined }),
      'Marked as picked up. Thank you for sharing!'
    )
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-green-100">
      <div className="flex gap-4 p-5">
        {photo ? (
          <img
            src={photo}
            alt={`Photo of ${listing.title}`}
            loading="lazy"
            className="h-24 w-24 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700"
            aria-hidden="true"
          >
            <UtensilsCrossed size={30} />
          </div>
        )}

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
        <div className="border-t border-green-100 bg-green-100/50 p-5 text-sm text-green-900">
          Picked up by <strong>{receiver}</strong>
          {request.rating ? ` · rated ${request.rating} out of 5` : ''}
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