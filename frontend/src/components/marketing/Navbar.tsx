import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, LayoutDashboard, Menu, X } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import Logo from './Logo'

type NavLinkItem = { href: string; label: string; route?: boolean }

const sections: NavLinkItem[] = [
  { href: '#top', label: 'Home' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#live-food', label: 'Live food' },
  { href: '#impact', label: 'Impact' },
  { href: '#stories', label: 'Stories' },
]

const itemClass = 'rounded-full px-3 py-2 text-sm font-semibold text-ink/80 transition hover:bg-green-50 hover:text-green-700'
const pillClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700'

function NavItem({ item, onClick }: { item: NavLinkItem; onClick?: () => void }) {
  return item.route ? (
    <Link to={item.href} className={itemClass} onClick={onClick}>
      {item.label}
    </Link>
  ) : (
    <a href={item.href} className={itemClass} onClick={onClick}>
      {item.label}
    </a>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, profile, loading } = useProfile()

  // A little shadow once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The main button depends on who is looking
  const cta =
    profile?.role === 'receiver'
      ? { to: '/find', label: 'Find Food' }
      : profile?.role === 'admin'
        ? { to: '/admin/verify', label: 'Review' }
        : user
          ? { to: '/post', label: 'Post Food' }
          : { to: '/register', label: 'Get started' }

  const authLink = loading ? null : user ? (
    <Link to="/dashboard" className={`${itemClass} inline-flex items-center gap-1.5`}>
      <LayoutDashboard size={16} aria-hidden="true" /> Dashboard
    </Link>
  ) : (
    <Link to="/login" className={itemClass}>
      Log in
    </Link>
  )

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md transition-shadow ${
        scrolled ? 'border-green-100 shadow-sm shadow-green-900/5' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="#top" aria-label="Second Helping home">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {sections.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authLink}
          <Link to={cta.to} className={pillClass}>
            {cta.label} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-ink hover:bg-green-50 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-green-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2" aria-label="Mobile">
            {sections.map((item) => (
              <NavItem key={item.label} item={item} onClick={() => setOpen(false)} />
            ))}
            {authLink}
            <Link to={cta.to} className={`${pillClass} mt-2`}>
              {cta.label} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
