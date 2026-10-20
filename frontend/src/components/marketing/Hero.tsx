import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'

const avatars = ['R', 'M', 'I', 'K']

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-700 to-green-600 pb-28 pt-10 sm:pt-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-green-100/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-warn/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Glass card */}
        <div className="rounded-3xl bg-white/10 p-6 text-white ring-1 ring-white/20 backdrop-blur-md sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-100">
            Surplus food, shared
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Share Food. Save Plates. Feed Neighbours.
          </h1>
          <p className="mt-4 max-w-xl text-green-100">
            Restaurants, hostels and caterers post food they cannot use. Verified NGOs and shelters
            collect it while it is still fresh.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/post"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-green-900 hover:bg-green-100"
            >
              Post Food <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/find"
              className="rounded-full border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Find Food
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2" aria-hidden="true">
              {avatars.map((letter) => (
                <span
                  key={letter}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-900 ring-2 ring-green-700"
                >
                  {letter}
                </span>
              ))}
            </div>
            <p className="text-sm text-green-100">Restaurants, hostels and NGOs in Bengaluru</p>
          </div>
        </div>

        {/* "Watch our story" mini card */}
        <a
          href="#stories"
          className="group hidden items-center gap-4 rounded-2xl bg-white p-5 shadow-lg lg:flex"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-600 text-white group-hover:bg-green-700">
            <Play size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold text-green-900">Watch our story</span>
            <span className="block text-sm text-muted">See who is sharing food near you.</span>
          </span>
        </a>
      </div>
    </section>
  )
}