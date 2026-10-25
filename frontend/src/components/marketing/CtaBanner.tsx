import { Link } from 'react-router-dom'

export default function CtaBanner() {
  return (
    <section aria-label="Join Second Helping" className="px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-green-700 to-green-900 px-6 py-14 text-center text-white sm:px-12">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Be the reason someone eats tonight.</h2>
        <p className="mx-auto mt-3 max-w-xl text-green-100">
          Join as a donor with food to share, or as an NGO or shelter ready to collect it. Setting up takes
          a few minutes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="rounded-full bg-white px-6 py-3 font-semibold text-green-900 hover:bg-green-100"
          >
            Join Second Helping
          </Link>
          <a
            href="#live-food"
            className="rounded-full border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            See live food
          </a>
        </div>
      </div>
    </section>
  )
}