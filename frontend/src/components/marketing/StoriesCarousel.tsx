import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useStories, type Story } from '../../hooks/useStories'
import { images, pick } from '../../lib/images'
import SectionHeading from './SectionHeading'

function StoryCard({ story, index }: { story: Story; index: number }) {
  const photo = story.photo_url || pick(images.stories, index)

  return (
    <figure className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]">
      <img src={photo} alt="" loading="lazy" className="h-56 w-full rounded-3xl object-cover" />
      <div className="relative mx-3 -mt-12 rounded-2xl bg-white p-5 shadow-lg shadow-green-900/5 ring-1 ring-green-100">
        <Quote size={22} className="text-green-600" fill="currentColor" aria-hidden="true" />
        <blockquote className="mt-2 text-sm leading-relaxed text-ink/80">{story.quote}</blockquote>
        <figcaption className="mt-4 flex items-center gap-3 border-t border-green-100 pt-4">
          <img src={photo} alt="" loading="lazy" className="h-10 w-10 rounded-full object-cover" />
          <span>
            <span className="block text-sm font-bold text-ink">{story.name}</span>
            <span className="block text-xs text-muted">
              {story.role}
              {story.since ? ` · Sharing since ${story.since}` : ''}
            </span>
          </span>
        </figcaption>
      </div>
    </figure>
  )
}

const arrowClass =
  'flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-green-200 transition hover:text-green-700 hover:ring-green-600'

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
      className="px-4 py-20"
      aria-roledescription="carousel"
      aria-label="Stories from our community"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Stories of hope"
          title={
            <>
              Real people. <span className="text-green-600">Real change.</span>
            </>
          }
          action={
            <div className="flex gap-2">
              <button type="button" className={arrowClass} aria-label="Previous stories" onClick={() => scrollByCard(-1)}>
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button type="button" className={arrowClass} aria-label="Next stories" onClick={() => scrollByCard(1)}>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          }
        />

        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-green-50" />
            ))}
          </div>
        )}

        {error && <p className="mt-10 text-danger">We could not load stories right now.</p>}

        {data && data.length === 0 && <p className="mt-10 text-muted">Stories are coming soon.</p>}

        {data && data.length > 0 && (
          <div
            ref={track}
            tabIndex={0}
            role="group"
            aria-label="Story cards, scroll sideways"
            className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none]"
          >
            {data.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
