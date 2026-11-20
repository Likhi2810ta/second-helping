import { Link } from 'react-router-dom'
import { ArrowRight, Play, UtensilsCrossed } from 'lucide-react'
import { useImpactStats } from '../../hooks/useImpactStats'
import { images } from '../../lib/images'

export default function Hero() {
  const { data: impact } = useImpactStats()

  return (
    <section id="top" className="px-4 pt-4 sm:pt-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-green-100">
        <img
          src={images.hero}
          alt="Smiling children waving together"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        {/* Soft light wash on the left so the card stays readable */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/25 to-transparent"
        />

        {/* Live counter floating on the photo */}
        {impact && impact.meals > 0 && (
          <div className="sh-float absolute right-6 top-6 z-10 hidden items-center gap-3 rounded-2xl bg-white/85 p-3 pr-5 shadow-lg ring-1 ring-white/80 backdrop-blur-xl md:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
              <UtensilsCrossed size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-heading text-xl font-extrabold leading-none text-ink">
                {impact.meals.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-muted">meals shared so far</span>
            </span>
          </div>
        )}

        <div className="relative flex min-h-[560px] flex-col justify-between gap-6 p-4 sm:min-h-[620px] sm:p-8 sm:pb-16 lg:flex-row lg:items-center">
          {/* Frosted glass card */}
          <div className="max-w-xl rounded-3xl bg-white/70 p-6 shadow-xl shadow-green-900/10 ring-1 ring-white/80 backdrop-blur-xl sm:p-10">
            <p className="inline-block rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-green-700">
              Surplus food, shared
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl lg:text-[3.4rem]">
              Share <span className="text-green-600">Food.</span>
              <br />
              Save Plates.
              <br />
              Feed Neighbours.
            </h1>
            <p className="mt-5 max-w-md text-ink/70">
              Restaurants, hostels and caterers post food they cannot use. Verified NGOs and shelters
              collect it while it is still fresh.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/post"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700"
              >
                Post Food <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/find"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink ring-1 ring-green-200 transition hover:ring-green-600"
              >
                Find Food <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {images.stories.map((src) => (
                  <img key={src} src={src} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
                ))}
              </div>
              <p className="text-sm font-medium text-ink/70">Trusted by restaurants, hostels and NGOs</p>
            </div>
          </div>

          {/* "Read our stories" glass card */}
          <a
            href="#stories"
            className="group flex max-w-xs items-center gap-4 self-end rounded-2xl bg-white/75 p-3 pr-5 shadow-lg ring-1 ring-white/80 backdrop-blur-xl transition hover:bg-white/90 lg:mb-2"
          >
            <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
              <img src={images.steps.pickup} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white transition group-hover:scale-110">
                  <Play size={14} fill="currentColor" aria-hidden="true" />
                </span>
              </span>
            </span>
            <span>
              <span className="block font-bold text-ink">Read our stories</span>
              <span className="block text-sm text-muted">See who is sharing food near you.</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
