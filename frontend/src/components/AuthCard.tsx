import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Leaf, MapPin } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { images } from '../lib/images'
import Logo from './marketing/Logo'

type Props = { title: string; subtitle?: string; children: ReactNode; wide?: boolean }

const perks = [
  { icon: BadgeCheck, text: 'Every donor and NGO is verified' },
  { icon: MapPin, text: 'Live food on a map near you' },
  { icon: Leaf, text: 'Every meal shared is counted' },
]

// Split screen: photo panel on large screens, the form on the right
export default function AuthCard({ title, subtitle, children, wide = false }: Props) {
  usePageTitle(title)

  return (
    <main className="grid min-h-screen bg-bg lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <img src={images.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/85 via-green-900/30 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="w-fit rounded-2xl bg-white/85 px-3 py-2 backdrop-blur">
            <Logo />
          </Link>
          <div className="text-white">
            <p className="font-heading text-4xl font-extrabold leading-tight">
              Good food deserves
              <br />a second helping.
            </p>
            <ul className="mt-6 space-y-3">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-green-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <Link
            to="/"
            className="mb-6 hidden w-fit items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-green-700 lg:inline-flex"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to website
          </Link>
          <h1 className="text-3xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  )
}
