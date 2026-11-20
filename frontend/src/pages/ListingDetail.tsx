import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, ShieldCheck } from 'lucide-react'
import CountdownBadge from '../components/CountdownBadge'
import FreshnessRing from '../components/marketing/FreshnessRing'
import { useApi } from '../hooks/useApi'
import { useNow } from '../hooks/useNow'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProfile } from '../hooks/useProfile'
import { useToast } from '../hooks/useToast'
import { api, messageOf } from '../lib/api'
import { categoryLabels, dietLabels } from '../lib/labels'
import { directionsUrl } from '../lib/maps'
import { images } from '../lib/images'
import { foodPhotoUrl } from '../lib/storage'
import { freshness, isLive, shortTimeLabel, timeLeftLabel } from '../lib/time'
import { errorBox, inputClass, linkText, noticeBox, primaryBtn } from '../lib/ui'
import type { ListingDetail as Detail } from '../types/api'

const ETAS = [15, 30, 45, 60, 90, 120]
const chip = 'rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-900'

function RequestForm({ listing, onDone }: { listing: Detail; onDone: () => void }) {
  const toast = useToast()
  const [message, setMessage] = useState('')
  const [eta, setEta] = useState(30)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await api(`/api/listings/${listing.id}/request`, {
        method: 'POST',
        body: { message: message.trim() || null, eta_minutes: eta },
      })
      toast('Pickup requested. We will let you know when the donor answers.')
      onDone()
    } catch (err) {
      const text = messageOf(err)
      setError(text)
      toast(text, 'error')
      onDone() // the listing may have changed, so show its latest state
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="eta" className="block text-sm font-semibold text-green-900">
          When can you collect it?
        </label>
        <select id="eta" value={eta} onChange={(e) => setEta(Number(e.target.value))} className={inputClass}>
          {ETAS.map((m) => (
            <option key={m} value={m}>
              In about {m < 60 ? `${m} minutes` : `${m / 60} hour${m === 60 ? '' : 's'}`}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="msg" className="block text-sm font-semibold text-green-900">
          Message to the donor (optional)
        </label>
        <textarea
          id="msg"
          rows={3}
          maxLength={300}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. We will send a van with two volunteers."
          className={inputClass}
        />
        <p className="mt-1 text-xs text-muted">{300 - message.length} characters left</p>
      </div>
      {error && <p className={errorBox}>{error}</p>}
      <button type="submit" disabled={busy} className={primaryBtn}>
        {busy ? 'Sending request…' : 'Request pickup'}
      </button>
    </form>
  )
}

// What the receiver can do next, depending on where this listing stands
function RequestPanel({ listing, now, onChanged }: { listing: Detail; now: number; onChanged: () => void }) {
  const { organization } = useProfile()
  const mine = listing.my_request_status

  if (mine === 'accepted' || mine === 'completed') {
    return (
      <div className="space-y-3">
        <p className={noticeBox}>
          {mine === 'accepted' ? <strong>The donor accepted your request.</strong> : <strong>You collected this food.</strong>}
        </p>
        {listing.address && (
          <p className="flex items-start gap-2 text-green-900">
            <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> {listing.address}
          </p>
        )}
        {listing.donor_phone && (
          <a href={`tel:${listing.donor_phone}`} className="flex items-center gap-2 font-semibold text-green-700">
            <Phone size={18} aria-hidden="true" /> {listing.donor_phone}
          </a>
        )}
        {mine === 'accepted' && (
          <a
            href={directionsUrl(listing.latitude, listing.longitude)}
            target="_blank"
            rel="noreferrer"
            className={`${primaryBtn} block text-center`}
          >
            Get directions
          </a>
        )}
      </div>
    )
  }

  if (mine === 'pending' && listing.status === 'requested') {
    return (
      <p className={noticeBox}>
        Request sent. The donor will accept or decline soon.{' '}
        <Link to="/pickups" className={linkText}>
          Track it in My pickups
        </Link>
      </p>
    )
  }

  if (listing.status !== 'available' || !isLive(listing.expires_at, now)) {
    const why =
      listing.status === 'requested'
        ? 'Another organisation has requested this food. It comes back here if the donor declines.'
        : 'This food is no longer available.'
    return (
      <p className={noticeBox}>
        {why}{' '}
        <Link to="/find" className={linkText}>
          Find other food nearby
        </Link>
      </p>
    )
  }

  if (organization?.status !== 'verified') {
    return <p className={noticeBox}>Requesting food unlocks after an admin approves your organisation.</p>
  }

  if (mine === 'declined') {
    return <p className={noticeBox}>The donor declined your earlier request for this food.</p>
  }

  return <RequestForm listing={listing} onDone={onChanged} />
}

export default function ListingDetail() {
  const { id } = useParams()
  const now = useNow(30_000)
  const { data: listing, error, errorMessage, loading, reload } = useApi<Detail>(
    id ? `/api/listings/${id}` : null,
    { refreshMs: 30_000 }
  )
  usePageTitle(listing?.title ?? 'Listing')

  if (loading) {
    return (
      <div aria-busy="true" className="mx-auto max-w-3xl space-y-4">
        <div className="h-64 animate-pulse rounded-2xl bg-green-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-green-100" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center ring-1 ring-green-100">
        <p className="text-muted">{errorMessage ?? 'This listing is no longer available.'}</p>
        <Link to="/find" className={`${linkText} mt-3 inline-block`}>
          Back to Find food
        </Link>
      </div>
    )
  }

  const photo = foodPhotoUrl(listing.photo_path) ?? images.categories[listing.category]
  const open = ['available', 'requested', 'confirmed'].includes(listing.status) && isLive(listing.expires_at, now)

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/find" className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Find food
      </Link>

      <article className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-green-100">
        <img src={photo} alt={`Photo of ${listing.title}`} className="h-64 w-full object-cover sm:h-80" />

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-green-900 sm:text-3xl">{listing.title}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-muted">
                {listing.donor_name}
                {listing.donor_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-900">
                    <ShieldCheck size={14} aria-hidden="true" /> Verified donor
                  </span>
                )}
              </p>
              {open && (
                <div className="mt-3">
                  <CountdownBadge preparedAt={listing.prepared_at} expiresAt={listing.expires_at} now={now} />
                </div>
              )}
            </div>
            {open && (
              <FreshnessRing
                fraction={freshness(listing.prepared_at, listing.expires_at, now)}
                center={shortTimeLabel(listing.expires_at, now)}
                label={timeLeftLabel(listing.expires_at, now)}
              />
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className={chip}>{listing.portions} portions</span>
            <span className={chip}>{categoryLabels[listing.category]}</span>
            <span className={chip}>{dietLabels[listing.diet]}</span>
          </div>

          {listing.description && <p className="mt-5 whitespace-pre-line text-ink">{listing.description}</p>}

          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-green-900">Pickup area</dt>
              <dd className="text-muted">
                {listing.address ?? listing.area}
                {!listing.address && (
                  <span className="block text-xs">The exact address appears once the donor accepts your request.</span>
                )}
              </dd>
            </div>
            {listing.pickup_note && (
              <div>
                <dt className="font-semibold text-green-900">Pickup note</dt>
                <dd className="text-muted">{listing.pickup_note}</dd>
              </div>
            )}
          </dl>
        </div>

        <section aria-label="Request pickup" className="border-t border-green-100 bg-green-50/60 p-6 sm:p-8">
          <RequestPanel listing={listing} now={now} onChanged={reload} />
        </section>
      </article>
    </div>
  )
}
