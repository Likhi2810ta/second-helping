import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Field from './Field'
import LocationPicker, { type LatLng } from './LocationPicker'
import PhotoUpload from './PhotoUpload'
import { useProfile } from '../hooks/useProfile'
import { useToast } from '../hooks/useToast'
import { parsePoint } from '../lib/geo'
import { reverseGeocode } from '../lib/geocode'
import { supabase } from '../lib/supabase'
import { errorBox, noticeBox, primaryBtn } from '../lib/ui'
import { listingSchema, type ListingInput } from '../lib/validators'

const inputClass =
  'mt-1 w-full rounded-lg border border-muted/40 bg-white px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20'
const labelClass = 'block text-sm font-semibold text-green-900'

const categories = [
  { value: 'cooked', label: 'Cooked meal' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'fruits_veg', label: 'Fruits and vegetables' },
  { value: 'packed', label: 'Packed food' },
  { value: 'other', label: 'Other' },
]

const diets = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non_veg', label: 'Non-vegetarian' },
  { value: 'both', label: 'Both' },
]

const durations = [
  { value: 0.5, label: '30 minutes' },
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 4, label: '4 hours' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
]

// When the food stops being safe to eat, as a timestamp
function expiryIn(hours: number) {
  return new Date(Date.now() + hours * 3600e3).toISOString()
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-sm text-danger">
      {message}
    </p>
  )
}

export default function ListingForm() {
  const { user, organization } = useProfile()
  const navigate = useNavigate()
  const toast = useToast()

  const verified = organization?.status === 'verified'

  const [position, setPosition] = useState<LatLng | null>(() => parsePoint(organization?.location))
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [addressLoading, setAddressLoading] = useState(false)
  const lookupId = useRef(0)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'cooked',
      diet: 'veg',
      portions: 10,
      hoursValid: 4,
      address: organization?.address ?? '',
      pickup_note: '',
      safetyChecked: false,
    },
  })

  // Runs whenever the pin is placed, dragged or set by "Use my location"
  async function handlePinChange(p: LatLng) {
    setPosition(p)
    const id = ++lookupId.current
    setAddressLoading(true)
    try {
      const found = await reverseGeocode(p.lat, p.lng)
      if (id === lookupId.current && found) setValue('address', found, { shouldValidate: true })
    } catch {
      // Lookup failed: the donor can type the address by hand
    } finally {
      if (id === lookupId.current) setAddressLoading(false)
    }
  }

  async function onSubmit(values: ListingInput) {
    setSubmitError(null)
    if (!user || !organization) return
    if (!verified) {
      setSubmitError('Posting unlocks after admin approval.')
      return
    }
    if (!position) {
      setSubmitError('Please drop a pin on the map for the pickup location.')
      return
    }

    // 1. Upload the photo (if any) into our own folder in the public bucket
    let photoPath: string | null = null
    if (photo) {
      photoPath = `${user.id}/${crypto.randomUUID()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('food-photos')
        .upload(photoPath, photo, { contentType: 'image/jpeg' })
      if (uploadError) {
        setSubmitError(`Photo upload failed: ${uploadError.message}`)
        return
      }
    }

    // 2. Create the listing
    const { error } = await supabase.from('listings').insert({
      donor_org_id: organization.id,
      title: values.title.trim(),
      description: values.description?.trim() || null,
      category: values.category,
      diet: values.diet,
      portions: values.portions,
      photo_path: photoPath,
      expires_at: expiryIn(values.hoursValid),
      address: values.address.trim(),
      location: `SRID=4326;POINT(${position.lng} ${position.lat})`,
      pickup_note: values.pickup_note?.trim() || null,
    })
    if (error) {
      setSubmitError(error.message)
      return
    }

    toast('Your food is now live!')
    navigate('/my-listings')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {!verified && (
        <p className={noticeBox}>
          Posting unlocks after admin approval. You can look around, but the form is locked until your
          organisation is verified.
        </p>
      )}

      <fieldset disabled={!verified} className={`min-w-0 space-y-5 ${verified ? '' : 'opacity-60'}`}>
        <div>
          <Field label="Title" placeholder="e.g. Veg biryani" {...register('title')} />
          <ErrorText message={errors.title?.message} />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description (optional)
          </label>
          <textarea id="description" rows={3} className={inputClass} {...register('description')} />
          <ErrorText message={errors.description?.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select id="category" className={inputClass} {...register('category')}>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ErrorText message={errors.category?.message} />
          </div>

          <div>
            <label htmlFor="diet" className={labelClass}>
              Diet
            </label>
            <select id="diet" className={inputClass} {...register('diet')}>
              {diets.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <ErrorText message={errors.diet?.message} />
          </div>

          <div>
            <Field
              label="Portions"
              type="number"
              inputMode="numeric"
              min={1}
              max={1000}
              {...register('portions', { valueAsNumber: true })}
            />
            <ErrorText message={errors.portions?.message} />
          </div>

          <div>
            <label htmlFor="hoursValid" className={labelClass}>
              Safe to eat for
            </label>
            <select id="hoursValid" className={inputClass} {...register('hoursValid', { valueAsNumber: true })}>
              {durations.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <ErrorText message={errors.hoursValid?.message} />
          </div>
        </div>

        <PhotoUpload onChange={setPhoto} />

        <div>
          <Field
            label="Pickup address"
            hint={addressLoading ? 'Looking up address…' : 'Starts as your organisation address. Move the pin to change it.'}
            autoComplete="street-address"
            {...register('address')}
          />
          <ErrorText message={errors.address?.message} />
        </div>

        <LocationPicker value={position} onChange={handlePinChange} />

        <div>
          <Field label="Pickup note (optional)" placeholder="e.g. Ask for Ravi at the back door" {...register('pickup_note')} />
          <ErrorText message={errors.pickup_note?.message} />
        </div>

        <div>
          <label className="flex items-start gap-3 rounded-xl bg-green-100 p-4 text-sm text-green-900">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-green-600" {...register('safetyChecked')} />
            <span>Food is freshly prepared, stored hygienically, and not previously served.</span>
          </label>
          <ErrorText message={errors.safetyChecked?.message} />
        </div>
      </fieldset>

      {submitError && <p className={errorBox}>{submitError}</p>}

      <button type="submit" disabled={!verified || isSubmitting} className={primaryBtn}>
        {isSubmitting ? 'Posting…' : 'Post food'}
      </button>
    </form>
  )
}