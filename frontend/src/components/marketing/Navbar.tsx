import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'

type NavLinkItem = { href: string; label: string; route?: boolean }

const links: NavLinkItem[] = [
  { href: '#top', label: 'Home' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '/find', label: 'Find Food', route: true },
  { href: '#impact', label: 'Impact' },
  { href: '#stories', label: 'Stories' },
]

const itemClass = 'rounded-full px-3 py-2 text-sm font-semibold text-green-900 hover:bg-green-100'
const pillClass = 'rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-green-900'

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
  const { user, loading } = useProfile()

  const authLink = loading ? null : user ? (
    <Link to="/dashboard" className={itemClass}>
      Dashboard
    </Link>
  ) : (
    <Link to="/login" className={itemClass}>
      Log in
    </Link>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-green-100 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#top" className="font-heading text-xl font-bold text-green-700">
          Second Helping
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authLink}
          <Link to="/post" className={pillClass}>
            Post Food
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-green-900 hover:bg-green-100 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-green-100 bg-bg px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2" aria-label="Mobile">
            {links.map((item) => (
              <NavItem key={item.label} item={item} onClick={() => setOpen(false)} />
            ))}
            {authLink}
            <Link to="/post" className={`${pillClass} mt-2 text-center`}>
              Post Food
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}