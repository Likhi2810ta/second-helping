import { ArrowRight, MapPin } from 'lucide-react'
import { useEvents } from '../../hooks/useEvents'
import { images, pick } from '../../lib/images'
import SectionHeading from './SectionHeading'

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
    <section id="events" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Events & updates"
          title={
            <>
              Stay connected, <span className="text-green-600">get involved</span>
            </>
          }
          text="Meet the community and learn how to help."
        />

        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-green-50" />
            ))}
          </div>
        )}

        {error && <p className="mt-10 text-danger">We could not load events right now.</p>}

        {data && data.length === 0 && <p className="mt-10 text-muted">No events are scheduled yet.</p>}

        {data && data.length > 0 && (
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {data.map((event, i) => {
              const parts = event.event_date ? dateParts(event.event_date) : null
              return (
                <li
                  key={event.id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-green-100 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.photo_url || pick(images.events, i)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {parts && (
                      <div className="absolute left-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white text-ink shadow-md">
                        <span className="text-[10px] font-bold uppercase text-green-600">{parts.month}</span>
                        <span className="text-xl font-extrabold leading-none">{parts.day}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-ink">{event.title}</h3>
                    {event.blurb && <p className="mt-1 text-sm text-muted">{event.blurb}</p>}
                    {event.city && (
                      <p className="mt-4 flex items-center justify-between border-t border-green-100 pt-4 text-sm">
                        <span className="flex items-center gap-1.5 font-semibold text-green-700">
                          <MapPin size={15} aria-hidden="true" /> {event.city}
                        </span>
                        <ArrowRight size={16} className="text-muted transition group-hover:translate-x-1 group-hover:text-green-700" aria-hidden="true" />
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
