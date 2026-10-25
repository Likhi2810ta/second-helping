import { Link } from 'react-router-dom'
import { useNearbyListings } from '../../hooks/useNearbyListings'
import { useNow } from '../../hooks/useNow'
import { isLive } from '../../lib/time'
import ListingCard from './ListingCard'

const CITY = { lat: 12.9716, lng: 77.5946 } // Bengaluru
const RADIUS_KM = 30

export default function LiveFood() {
  const now = useNow()
  const { data, error, loading } = useNearbyListings(CITY.lat, CITY.lng, RADIUS_KM)
  const live = data?.filter((l) => isLive(l.expires_at, now)).slice(0, 6) ?? []

  return (
    <section id="live-food" className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-green-900">Live food near you</h2>
            <p className="mt-1 text-muted">Fresh listings from verified donors in Bengaluru right now.</p>
          </div>
          <Link to="/find" className="font-semibold text-green-700 underline">
            See all on the map
          </Link>
        </div>

        {loading && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-green-100" />
            ))}
          </div>
        )}

        {error && <p className="mt-8 text-danger">We could not load listings right now.</p>}

        {data && live.length === 0 && (
          <p className="mt-8 text-muted">No food is listed right now. Check back soon.</p>
        )}

        {live.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {live.map((listing) => (
              <ListingCard key={listing.id} listing={listing} now={now} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
