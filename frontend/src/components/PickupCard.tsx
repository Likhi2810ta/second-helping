import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, MapPin, Navigation, PackageCheck, Phone } from 'lucide-react'
import CountdownBadge from './CountdownBadge'
import { Stepper } from './StatusStepper'
import { useToast } from '../hooks/useToast'
import { api, messageOf } from '../lib/api'
import { categoryLabels, dietLabels } from '../lib/labels'
import { directionsUrl } from '../lib/maps'
import { isActivePickup } from '../lib/pickups'
import { images } from '../lib/images'
import { foodPhotoUrl } from '../lib/storage'
import { outlinePill as outlineBtn, solidPill as solidBtn } from '../lib/ui'
import { isLive } from '../lib/time'
import type { Pickup } from '../types/api'

const steps = ['Requested', 'Confirmed', 'Picked up']
const stepOf = { pending: 0, accepted: 1, completed: 2 } as const

function closedLabel(p: Pickup, now: number): string | null {
  switch (p.request_status) {
    case 'declined':
      return 'The donor declined this request.'
    case 'cancelled':
      return 'You cancelled this request.'
    case 'completed':
      return null
    case 'accepted':
      return isActivePickup(p, now) ? null : 'This pickup was never confirmed.'
    default:
      return isLive(p.expires_at, now) ? null : 'This food expired before it was collected.'
  }
}

type Props = { pickup: Pickup; now: number; onChanged: () => void }

export default function PickupCard({ pickup: p, now, onChanged }: Props) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const photo = foodPhotoUrl(p.photo_path) ?? images.categories[p.category]
  const active = isActivePickup(p, now)
  const closed = closedLabel(p, now)
  const step = p.request_status in stepOf ? stepOf[p.request_status as keyof typeof stepOf] : null
  const live = isLive(p.expires_at, now)

  async function markCollected() {
    if (!window.confirm(`Confirm you have collected "${p.title}"? The donor will be told.`)) return
    setBusy(true)
    try {
      await api(`/api/requests/${p.request_id}/collected`, { method: 'POST' })
      toast('Marked as collected. Thank you for picking it up!')
    } catch (e) {
      toast(messageOf(e), 'error')
    } finally {
      setBusy(false)
      onChanged()
    }
  }

  async function cancel() {
    const ask =
      p.request_status === 'accepted'
        ? 'Cancel this pickup? The donor is expecting you, and the food goes back on the map.'
        : 'Cancel this request?'
    if (!window.confirm(ask)) return
    setBusy(true)
    try {
      await api(`/api/requests/${p.request_id}/cancel`, { method: 'POST' })
      toast('Request cancelled')
    } catch (e) {
      toast(messageOf(e), 'error')
    } finally {
      setBusy(false)
      onChanged()
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-green-100">
      <div className="flex gap-4 p-5">
        <img
          src={photo}
          alt={`Photo of ${p.title}`}
          loading="lazy"
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-green-900">{p.title}</h2>
          <p className="text-sm text-muted">
            {p.donor_name} · {p.portions} portions · {categoryLabels[p.category]} · {dietLabels[p.diet]}
          </p>
          {active && live && (
            <div className="mt-2">
              <CountdownBadge preparedAt={p.prepared_at} expiresAt={p.expires_at} now={now} />
            </div>
          )}
          {closed ? (
            <p className="mt-2 text-sm font-semibold text-green-900">{closed}</p>
          ) : (
            step !== null && <Stepper steps={steps} current={step} label="Pickup progress" />
          )}
        </div>
      </div>

      {/* Accepted: show the exact location and contact */}
      {p.request_status === 'accepted' && active && (
        <div className="space-y-2 border-t border-green-100 bg-green-50/70 p-5 text-sm">
          {live ? (
            <p className="font-semibold text-green-900">Confirmed! The donor is expecting you.</p>
          ) : (
            <p className="font-semibold text-ink">
              The safe-to-eat time has passed. If you collected the food in time, please confirm it below.
            </p>
          )}
          {p.address && (
            <p className="flex items-start gap-2 text-green-900">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {p.address}
            </p>
          )}
          {p.donor_phone && (
            <a href={`tel:${p.donor_phone}`} className="flex items-center gap-2 font-semibold text-green-700">
              <Phone size={16} aria-hidden="true" /> {p.donor_phone}
            </a>
          )}
          {p.pickup_note && <p className="text-muted">Note: {p.pickup_note}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={markCollected} disabled={busy} className={solidBtn}>
              <PackageCheck size={16} aria-hidden="true" /> I've collected it
            </button>
            {live && p.latitude !== null && p.longitude !== null && (
              <a href={directionsUrl(p.latitude, p.longitude)} target="_blank" rel="noreferrer" className={outlineBtn}>
                <Navigation size={16} aria-hidden="true" /> Get directions
              </a>
            )}
            <button type="button" onClick={cancel} disabled={busy} className={outlineBtn}>
              {live ? 'Cancel pickup' : "I didn't collect it"}
            </button>
          </div>
        </div>
      )}

      {/* Waiting for the donor */}
      {p.request_status === 'pending' && active && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-green-100 p-5 text-sm">
          <span className="text-muted">
            Waiting for the donor to answer · pickup area: {p.area}
          </span>
          <div className="flex gap-2">
            <Link to={`/listing/${p.listing_id}`} className={outlineBtn}>
              View
            </Link>
            <button type="button" onClick={cancel} disabled={busy} className={outlineBtn}>
              Cancel request
            </button>
          </div>
        </div>
      )}

      {p.request_status === 'completed' && (
        <div className="flex items-center gap-2 border-t border-green-100 bg-green-50/70 p-5 text-sm text-green-900">
          <CheckCircle2 size={18} className="shrink-0 text-green-600" aria-hidden="true" />
          Collected{p.completed_at ? ` on ${new Date(p.completed_at).toLocaleDateString('en-IN')}` : ''}. Thank you!
        </div>
      )}
    </article>
  )
}
