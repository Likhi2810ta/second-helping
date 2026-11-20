import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import Field from '../components/Field'
import LocationPicker, { type LatLng } from '../components/LocationPicker'
import { useProfile } from '../hooks/useProfile'
import { reverseGeocode } from '../lib/geocode'
import { api, messageOf } from '../lib/api'
import { supabase } from '../lib/supabase'
import { errorBox, inputClass, labelClass, primaryBtn } from '../lib/ui'
import type { Organization } from '../types'

type OrgType = Organization['type']

const donorTypes: { value: OrgType; label: string }[] = [
  { value: 'restaurant', label: 'Restaurant or café' },
  { value: 'hostel', label: 'Hostel or mess' },
  { value: 'caterer', label: 'Caterer' },
  { value: 'event', label: 'Event or function hall' },
]

const receiverTypes: { value: OrgType; label: string }[] = [
  { value: 'ngo', label: 'NGO' },
  { value: 'shelter', label: 'Shelter' },
  { value: 'individual', label: 'Community kitchen or individual' },
]

const ALLOWED_FILES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_BYTES = 5 * 1024 * 1024

export default function Onboarding() {
  const { user, profile, organization, refresh, signOut } = useProfile()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [type, setType] = useState<OrgType | ''>('')
  const [address, setAddress] = useState('')
  const [position, setPosition] = useState<LatLng | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const lookupId = useRef(0)

  // Admins and users who already finished onboarding do not belong here
  if (profile?.role === 'admin' || organization) return <Navigate to="/dashboard" replace />

  const isDonor = profile?.role === 'donor'
  const typeOptions = isDonor ? donorTypes : receiverTypes

  // Runs whenever the pin is placed, dragged or set by "Use my location"
  async function handlePinChange(p: LatLng) {
    setPosition(p)
    const id = ++lookupId.current
    setAddressLoading(true)
    try {
      const found = await reverseGeocode(p.lat, p.lng)
      if (id === lookupId.current && found) setAddress(found)
    } catch {
      // Lookup failed: the user can type the address by hand
    } finally {
      if (id === lookupId.current) setAddressLoading(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!user) return

    if (name.trim().length < 3) {
      setError('Organisation name must be at least 3 characters.')
      return
    }
    if (!type) {
      setError('Please choose a type.')
      return
    }
    if (address.trim().length < 5) {
      setError('Please enter the full address.')
      return
    }
    if (!position) {
      setError('Please drop a pin on the map.')
      return
    }
    if (!file) {
      setError('Please upload a verification document.')
      return
    }
    if (!ALLOWED_FILES.includes(file.type)) {
      setError('The document must be a JPG, PNG or PDF file.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('The document must be smaller than 5 MB.')
      return
    }

    setBusy(true)

    // 1. Upload the document into the private bucket, inside our own folder
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${user.id}/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('org-docs')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      setBusy(false)
      setError(`Upload failed: ${uploadError.message}`)
      return
    }

    // 2. Create the organisation (status starts as "pending")
    try {
      await api('/api/organizations', {
        method: 'POST',
        body: {
          name: name.trim(),
          type,
          address: address.trim(),
          lat: position.lat,
          lng: position.lng,
          doc_path: path,
        },
      })
    } catch (e) {
      setBusy(false)
      setError(messageOf(e))
      return
    }

    // 3. Reload our account data, then go to the dashboard
    await refresh()
    navigate('/dashboard', { replace: true })
  }

  const subtitle = `${
    isDonor ? 'Tell us where the food will be picked up from.' : 'Tell us who will be collecting the food.'
  } An admin checks your document before you can ${isDonor ? 'post food' : 'request food'}.`

  return (
    <AuthCard title="Set up your organisation" subtitle={subtitle} wide>
      <ol className="mb-8 flex items-center gap-2 text-xs font-semibold" aria-label="Sign-up progress">
        <li className="flex items-center gap-2 text-green-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">✓</span> Account
        </li>
        <li aria-hidden="true" className="h-px flex-1 bg-green-200" />
        <li className="flex items-center gap-2 text-ink" aria-current="step">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white ring-4 ring-green-100">2</span> Organisation
        </li>
        <li aria-hidden="true" className="h-px flex-1 bg-green-200" />
        <li className="flex items-center gap-2 text-muted">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">3</span> Approval
        </li>
      </ol>

        <form onSubmit={onSubmit} className="space-y-5">
          <Field
            label="Organisation name"
            name="orgName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label htmlFor="orgType" className={labelClass}>
              Type
            </label>
            <select
              id="orgType"
              value={type}
              onChange={(e) => setType(e.target.value as OrgType | '')}
              className={inputClass}
              required
            >
              <option value="">Choose…</option>
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            hint={addressLoading ? 'Looking up address…' : 'Filled in from the pin. You can edit it.'}
            autoComplete="street-address"
            required
          />

          <LocationPicker value={position} onChange={handlePinChange} />

          <div>
            <label htmlFor="doc" className={labelClass}>
              Verification document
            </label>
            <input
              id="doc"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-green-100 file:px-4 file:py-2 file:font-semibold file:text-green-900 hover:file:bg-green-200"
            />
            <p className="mt-1 text-xs text-muted">
              {isDonor
                ? 'A food licence (FSSAI) or business registration.'
                : 'An NGO or society registration certificate.'}{' '}
              JPG, PNG or PDF, up to 5 MB.
            </p>
          </div>

          {error && <p className={errorBox}>{error}</p>}

          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? 'Saving…' : 'Submit for verification'}
          </button>
        </form>

        <button onClick={signOut} className="mt-4 w-full text-center text-sm text-muted underline-offset-4 hover:underline">
          Log out
        </button>
    </AuthCard>
  )
}