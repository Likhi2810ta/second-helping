import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { images } from '../../lib/images'

export default function CtaBanner() {
  return (
    <section aria-label="Join Second Helping" className="px-4 py-8">
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-100 via-green-50 to-white ring-1 ring-green-100 md:grid-cols-2">
        <div className="relative z-10 p-8 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">Make a difference</p>
          <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
            Be the reason someone <span className="text-green-600">eats tonight.</span>
          </h2>
          <p className="mt-3 max-w-md text-muted">
            Join as a donor with food to share, or as an NGO or shelter ready to collect it. Setting up
            takes a few minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700"
            >
              Join Second Helping <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href="#live-food"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink ring-1 ring-green-200 transition hover:ring-green-600"
            >
              <Heart size={16} className="text-green-600" aria-hidden="true" /> See live food
            </a>
          </div>
        </div>

        <div className="relative min-h-64">
          <img src={images.cta} alt="Happy children smiling" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-green-50 via-transparent to-transparent md:bg-gradient-to-r"
          />
        </div>
      </div>
    </section>
  )
}
