import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useStories, type Story } from '../../hooks/useStories'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function StoryCard({ story }: { story: Story }) {
  return (
    <figure className="w-[85%] shrink-0 snap-start rounded-2xl bg-white p-6 ring-1 ring-green-100 sm:w-[45%] lg:w-[31%]">
      <Quote size={28} className="text-green-600" aria-hidden="true" />
      <blockquote className="mt-3 text-green-900">“{story.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {story.photo_url ? (
          <img src={story.photo_url} alt="" loading="lazy" className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-green-900"
            aria-hidden="true"
          >
            {initials(story.name)}
          </span>
        )}
        <span>
          <span className="block font-bold text-green-900">{story.name}</span>
          {story.role && <span className="block text-sm text-muted">{story.role}</span>}
        </span>
      </figcaption>
    </figure>
  )
}

const arrowClass =
  'flex h-10 w-10 items-center justify-center rounded-full border border-green-600 text-green-700 hover:bg-green-100'

export default function StoriesCarousel() {
  const { data, error, loading } = useStories()
  const track = useRef<HTMLDivElement>(null)

  function scrollByCard(direction: 1 | -1) {
    const el = track.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section
      id="stories"
      className="px-4 py-16"
      aria-roledescription="carousel"
      aria-label="Stories from our community"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-green-900">Stories from our community</h2>
            <p className="mt-1 text-muted">The people behind every shared meal.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className={arrowClass} aria-label="Previous stories" onClick={() => scrollByCard(-1)}>
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" className={arrowClass} aria-label="Next stories" onClick={() => scrollByCard(1)}>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 grid gap-4 md:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-green-100" />
            ))}
          </div>
        )}

        {error && <p className="mt-8 text-danger">We could not load stories right now.</p>}

        {data && data.length === 0 && <p className="mt-8 text-muted">Stories are coming soon.</p>}

        {data && data.length > 0 && (
          <div
            ref={track}
            tabIndex={0}
            role="group"
            aria-label="Story cards, scroll sideways"
            className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
          >
            {data.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}