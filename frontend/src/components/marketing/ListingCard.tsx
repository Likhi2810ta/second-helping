import { Link } from 'react-router-dom'
import type { NearbyListing } from '../../hooks/useNearbyListings'
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

const chip = 'rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-900'

export default function ListingCard({ listing, now }: { listing: NearbyListing; now: number }) {
  const left = timeLeftLabel(listing.expires_at, now)

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="flex gap-4 rounded-2xl bg-bg p-5 ring-1 ring-green-100 transition hover:shadow-md"
    >
      <FreshnessRing
        fraction={freshness(listing.prepared_at, listing.expires_at, now)}
        center={shortTimeLabel(listing.expires_at, now)}
        label={left}
      />
      <div className="min-w-0">
        <h3 className="truncate text-lg font-bold text-green-900">{listing.title}</h3>
        <p className="truncate text-sm text-muted">{listing.donor_name}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className={chip}>{categories[listing.category]}</span>
          <span className={chip}>{diets[listing.diet]}</span>
          <span className={chip}>{listing.portions} portions</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-green-700">{left}</p>
      </div>
    </Link>
  )
}
