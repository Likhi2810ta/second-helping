import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useNearbyListings } from '../../hooks/useNearbyListings'
import { useNow } from '../../hooks/useNow'
import { images } from '../../lib/images'
import { isLive } from '../../lib/time'
import ListingCard from './ListingCard'
import SectionHeading, { outlinePill } from './SectionHeading'

const CITY = { lat: 12.9716, lng: 77.5946 } // Bengaluru
const RADIUS_KM = 30

export default function LiveFood() {
  const now = useNow()
  const { data, error, loading } = useNearbyListings(CITY.lat, CITY.lng, RADIUS_KM)
  const live = data?.filter((l) => isLive(l.expires_at, now)).slice(0, 6) ?? []

  return (
    <section id="live-food" className="bg-gradient-to-b from-white to-green-50/60 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Live right now"
          title={
            <>
              Fresh food <span className="text-green-600">near you</span>
            </>
          }
          text="Listings from verified donors in Bengaluru, updated live."
          action={
            <Link to="/find" className={outlinePill}>
              See all on the map <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />

        {loading && (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-green-50" />
            ))}
          </div>
        )}

        {error && <p className="mt-10 text-danger">We could not load listings right now.</p>}

        {data && live.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-green-100 sm:flex-row sm:p-4 sm:text-left">
            <img src={images.newsletter} alt="" loading="lazy" className="h-32 w-full rounded-2xl object-cover sm:w-48" />
            <div className="flex-1">
              <p className="text-lg font-bold text-ink">No food is listed right now</p>
              <p className="mt-1 text-sm text-muted">
                New listings appear here the moment a donor posts. Have something to share?
              </p>
            </div>
            <Link
              to="/post"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 sm:mr-4"
            >
              Post Food <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}

        {live.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {live.map((listing) => (
              <ListingCard key={listing.id} listing={listing} now={now} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
