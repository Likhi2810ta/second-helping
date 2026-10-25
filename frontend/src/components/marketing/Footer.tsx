import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'

type FooterLink = { label: string; href?: string; to?: string }

const explore: FooterLink[] = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Live food', href: '#live-food' },
  { label: 'Impact', href: '#impact' },
  { label: 'Stories', href: '#stories' },
  { label: 'Events', href: '#events' },
]

const getInvolved: FooterLink[] = [
  { label: 'Post food', to: '/post' },
  { label: 'Find food', to: '/find' },
  { label: 'Create an account', to: '/register' },
  { label: 'Log in', to: '/login' },
]

// TODO: replace each "#" with your real social page address
const socials: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </>
    ),
  },
  {
    label: 'X',
    href: '#',
    icon: (
      <>
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
]

const linkClass = 'text-sm text-green-100 hover:text-white hover:underline'
const YEAR = new Date().getFullYear()

function LinkList({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h2>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className={linkClass}>
                {l.label}
              </Link>
            ) : (
              <a href={l.href} className={linkClass}>
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-ink px-4 pb-8 pt-14 text-green-100">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-heading text-xl font-bold text-white">Second Helping</p>
          <p className="mt-3 text-sm">
            Connecting surplus food with the people who need it, one verified pickup at a time.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <LinkList title="Explore" links={explore} />
        <LinkList title="Get involved" links={getInvolved} />

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} aria-hidden="true" />
              {/* TODO: replace with your real contact email */}
              <a href="mailto:hello@secondhelping.example" className="hover:text-white hover:underline">
                hello@secondhelping.example
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} aria-hidden="true" /> Bengaluru, India
            </li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs">
        © {YEAR} Second Helping. All rights reserved.
      </p>
    </footer>
  )
}