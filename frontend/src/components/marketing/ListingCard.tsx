import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import type { NearbyListing } from '../../hooks/useNearbyListings'
import { images } from '../../lib/images'
import { distanceLabel } from '../../lib/maps'
import { foodPhotoUrl } from '../../lib/storage'
import { freshness, shortTimeLabel, timeLeftLabel } from '../../lib/time'
import FreshnessRing from './FreshnessRing'

const diets: Record<NearbyListing['diet'], string> = {
  veg: 'Veg',
  non_veg: 'Non-veg',
  both: 'Veg & non-veg',
}

const categories: Record<NearbyListing['category'], string> = {
  cooked: 'Cooked',
  bakery: 'Bakery',
  fruits_veg: 'Fruits & veg',
  packed: 'Packed',
  other: 'Other',
}

const chip = 'rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100'

type Props = {
  listing: NearbyListing
  now: number
  selected?: boolean // highlighted because its map marker was clicked
  showDistance?: boolean
}

export default function ListingCard({ listing, now, selected = false, showDistance = false }: Props) {
  const left = timeLeftLabel(listing.expires_at, now)
  const photo = foodPhotoUrl(listing.photo_path) ?? images.categories[listing.category]

  return (
    <Link
      id={`listing-${listing.id}`}
      to={`/listing/${listing.id}`}
      className={`group flex overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? 'ring-2 ring-green-600' : 'ring-1 ring-green-100'
      }`}
    >
      <div className="relative w-28 shrink-0 overflow-hidden sm:w-32">
        <img
          src={photo}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-ink">{listing.title}</h3>
          <p className="truncate text-sm text-muted">
            {listing.donor_name}
            {showDistance && ` · ${distanceLabel(listing.distance_km)}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={chip}>{categories[listing.category]}</span>
            <span className={chip}>{diets[listing.diet]}</span>
            <span className={chip}>{listing.portions} portions</span>
          </div>
          <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-green-700">
            <Clock size={14} aria-hidden="true" /> {left}
          </p>
        </div>
        <div className="hidden sm:block">
          <FreshnessRing
            fraction={freshness(listing.prepared_at, listing.expires_at, now)}
            center={shortTimeLabel(listing.expires_at, now)}
            label={left}
          />
        </div>
      </div>
    </Link>
  )
}
