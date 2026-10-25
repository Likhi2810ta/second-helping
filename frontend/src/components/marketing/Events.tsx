import { MapPin } from 'lucide-react'
import { useEvents } from '../../hooks/useEvents'

// "2026-11-08" -> { day: "8", month: "Nov" }, without time-zone surprises
function dateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return {
    day: date.toLocaleDateString('en-IN', { day: 'numeric' }),
    month: date.toLocaleDateString('en-IN', { month: 'short' }),
  }
}

export default function Events() {
  const { data, error, loading } = useEvents(3)

  return (
    <section id="events" className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-green-900">Upcoming events</h2>
        <p className="mt-1 text-muted">Meet the community and learn how to help.</p>

        {loading && (
          <div className="mt-8 grid gap-4 md:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-green-100" />
            ))}
          </div>
        )}

        {error && <p className="mt-8 text-danger">We could not load events right now.</p>}

        {data && data.length === 0 && <p className="mt-8 text-muted">No events are scheduled yet.</p>}

        {data && data.length > 0 && (
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {data.map((event) => {
              const parts = event.event_date ? dateParts(event.event_date) : null
              return (
                <li key={event.id} className="flex gap-4 rounded-2xl bg-bg p-5 ring-1 ring-green-100">
                  {parts && (
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-green-600 text-white">
                      <span className="text-2xl font-extrabold leading-none">{parts.day}</span>
                      <span className="text-xs font-semibold uppercase">{parts.month}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-green-900">{event.title}</h3>
                    {event.blurb && <p className="mt-1 text-sm text-muted">{event.blurb}</p>}
                    {event.city && (
                      <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-green-700">
                        <MapPin size={16} aria-hidden="true" /> {event.city}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}