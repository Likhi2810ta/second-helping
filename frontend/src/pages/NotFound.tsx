import { Link } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'
import Logo from '../components/marketing/Logo'
import { usePageTitle } from '../hooks/usePageTitle'
import { images } from '../lib/images'
import { solidPill } from '../lib/ui'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <main className="flex min-h-screen flex-col bg-bg">
      <header className="mx-auto w-full max-w-6xl px-4 py-4">
        <Link to="/" aria-label="Second Helping home">
          <Logo />
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="grid max-w-4xl items-center gap-10 md:grid-cols-2">
          <div className="relative">
            <img src={images.categories.fruits_veg} alt="" className="h-72 w-full rounded-[2rem] object-cover" />
            <span className="absolute -bottom-5 left-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-green-600 shadow-lg">
              <SearchX size={28} aria-hidden="true" />
            </span>
          </div>
          <div>
            <p className="font-heading text-7xl font-extrabold text-green-600/25">404</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">This plate is empty</h1>
            <p className="mt-2 text-muted">
              The page you are looking for does not exist or has moved. Let us get you back to the good food.
            </p>
            <Link to="/" className={`${solidPill} mt-6`}>
              <ArrowLeft size={16} aria-hidden="true" /> Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
