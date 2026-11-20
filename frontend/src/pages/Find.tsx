import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { LocateFixed, Search } from 'lucide-react'
import FoodMap from '../components/FoodMap'
import PageHeader from '../components/PageHeader'
import type { LatLng } from '../components/LocationPicker'
import ListingCard from '../components/marketing/ListingCard'
import { useNearbyListings } from '../hooks/useNearbyListings'
import { useNow } from '../hooks/useNow'
import { useProfile } from '../hooks/useProfile'
import { searchAddress } from '../lib/geocode'
import { parsePoint } from '../lib/geo'
import { categoryLabels, dietLabels } from '../lib/labels'
import { isLive } from '../lib/time'
import type { Category, Diet } from '../types/api'

const RADII = [2, 5, 10, 25]
const FALLBACK: LatLng = { lat: 12.9716, lng: 77.5946 } // Bengaluru
const SAVED_KEY = 'sh-find-location'

const selectClass =
  'rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-ink outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10'

function savedLocation(): LatLng | null {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    const p = raw ? JSON.parse(raw) : null
    return typeof p?.lat === 'number' && typeof p?.lng === 'number' ? p : null
  } catch {
    return null
  }
}

function saveLocation(p: LatLng) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(p))
  } catch {
    // Storage blocked: we just will not remember it
  }
}

export default function Find() {
  const { organization } = useProfile()
  const now = useNow(30_000)

  // Start from the last place searched, then the organisation, then the city centre
  const [center, setCenter] = useState<LatLng>(
    () => savedLocation() ?? parsePoint(organization?.location) ?? FALLBACK
  )
  const [locNote, setLocNote] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const [radius, setRadius] = useState(10)
  const [diet, setDiet] = useState<Diet | ''>('')
  const [category, setCategory] = useState<Category | ''>('')
  const [sort, setSort] = useState<'distance' | 'expiry'>('distance')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list') // phones only

  const { data, error, loading } = useNearbyListings(center.lat, center.lng, radius, {
    diet: diet || null,
    category: category || null,
    sort,
    refreshMs: 30_000,
  })
  const listings = (data ?? []).filter((l) => isLive(l.expires_at, now))

  const moveTo = useCallback((p: LatLng, note: string | null = null) => {
    setCenter(p)
    saveLocation(p)
    setLocNote(note)
    setSelectedId(null)
  }, [])

  const askBrowser = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => moveTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocNote('Could not get your location. Search for an area or click the map instead.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 }
    )
  }, [moveTo])

  function locateMe() {
    if (!navigator.geolocation) {
      setLocNote('Your browser cannot share its location. Search for an area or click the map.')
      return
    }
    askBrowser()
  }

  // First visit: ask the browser where we are
  useEffect(() => {
    if (!savedLocation() && navigator.geolocation) askBrowser()
  }, [askBrowser])

  async function onSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const place = await searchAddress(query)
      if (place) moveTo(place, `Showing food near ${place.label}`)
      else setLocNote('We could not find that place. Try a nearby landmark or area name.')
    } catch {
      setLocNote('Address search is not available right now. Click the map instead.')
    } finally {
      setSearching(false)
    }
  }

  function selectFromMap(id: string) {
    setSelectedId(id)
    document.getElementById(`listing-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Receiver"
        title="Find food nearby"
        subtitle="Available food from verified donors. Updates every 30 seconds."
      />

      {/* Location */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <form onSubmit={onSearch} className="flex flex-1 gap-2" role="search">
          <label htmlFor="find-search" className="sr-only">
            Search for an area or address
          </label>
          <input
            id="find-search"
            type="search"
            placeholder="Search an area, e.g. Indiranagar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 rounded-full border border-green-200 bg-white px-5 py-2.5 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
          />
          <button
            type="submit"
            disabled={searching}
            aria-label="Search"
            className="rounded-full bg-green-600 px-5 py-2.5 text-white shadow-sm shadow-green-600/20 transition hover:bg-green-700 disabled:opacity-60"
          >
            <Search size={18} aria-hidden="true" />
          </button>
        </form>
        <button
          type="button"
          onClick={locateMe}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-green-200 transition hover:text-green-700 hover:ring-green-600"
        >
          <LocateFixed size={16} aria-hidden="true" /> Use my location
        </button>
      </div>
      {locNote && (
        <p role="status" className="mt-2 text-sm text-muted">
          {locNote}
        </p>
      )}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
        <label className="sr-only" htmlFor="f-radius">
          Distance
        </label>
        <select
          id="f-radius"
          className={selectClass}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          {RADII.map((r) => (
            <option key={r} value={r}>
              Within {r} km
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="f-diet">
          Diet
        </label>
        <select id="f-diet" className={selectClass} value={diet} onChange={(e) => setDiet(e.target.value as Diet | '')}>
          <option value="">Any diet</option>
          {Object.entries(dietLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="f-category">
          Category
        </label>
        <select
          id="f-category"
          className={selectClass}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | '')}
        >
          <option value="">All food</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="f-sort">
          Sort
        </label>
        <select
          id="f-sort"
          className={selectClass}
          value={sort}
          onChange={(e) => setSort(e.target.value as 'distance' | 'expiry')}
        >
          <option value="distance">Nearest first</option>
          <option value="expiry">Expiring soon</option>
        </select>

        {/* List / map switch on small screens */}
        <div className="ml-auto flex rounded-full bg-white p-1 ring-1 ring-green-100 lg:hidden" role="group" aria-label="View">
          {(['list', 'map'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                view === v ? 'bg-green-600 text-white' : 'text-green-900'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <section
          aria-label="Listings"
          aria-busy={loading}
          className={`space-y-3 lg:col-span-2 lg:block lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1 ${
            view === 'list' ? 'block' : 'hidden'
          }`}
        >
          {loading && [0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-green-100/60" />)}

          {error && <p className="text-danger">We could not load listings. Please try again in a moment.</p>}

          {data && listings.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-green-200 bg-white/60 p-8 text-center">
              <p className="font-semibold text-ink">No food within {radius} km right now.</p>
              {radius < 25 && (
                <button
                  type="button"
                  onClick={() => setRadius(RADII[RADII.indexOf(radius) + 1] ?? 25)}
                  className="mt-2 font-semibold text-green-700 underline"
                >
                  Search a wider area
                </button>
              )}
            </div>
          )}

          {listings.length > 0 && (
            <p className="text-sm text-muted" role="status">
              {listings.length} {listings.length === 1 ? 'listing' : 'listings'} found
            </p>
          )}
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} now={now} selected={l.id === selectedId} showDistance />
          ))}
        </section>

        <div className={`h-[60vh] overflow-hidden rounded-3xl shadow-sm ring-1 ring-green-100 lg:col-span-3 lg:block lg:h-[70vh] ${view === 'map' ? 'block' : 'hidden'}`}>
          <FoodMap
            center={center}
            radiusKm={radius}
            listings={listings}
            selectedId={selectedId}
            onSelect={selectFromMap}
            onPickLocation={(p) => moveTo(p, 'Showing food near the point you picked.')}
          />
        </div>
      </div>
    </div>
  )
}
