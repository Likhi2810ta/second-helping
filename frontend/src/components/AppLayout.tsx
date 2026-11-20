import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  History,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPinned,
  PlusCircle,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import type { Profile } from '../types'
import Logo from './marketing/Logo'
import NotificationBell from './NotificationBell'
import VerificationBanner from './VerificationBanner'

type Role = Profile['role']
type Item = { to: string; label: string; icon: LucideIcon }

const links: Record<Role, Item[]> = {
  donor: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/post', label: 'Post food', icon: PlusCircle },
    { to: '/my-listings', label: 'My listings', icon: ClipboardList },
    { to: '/history', label: 'History', icon: History },
  ],
  receiver: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/find', label: 'Find food', icon: MapPinned },
    { to: '/pickups', label: 'My pickups', icon: Truck },
    { to: '/history', label: 'History', icon: History },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/verify', label: 'Verify', icon: ShieldCheck },
    { to: '/admin/listings', label: 'Listings', icon: ListChecks },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ],
}

const roleLabel: Record<Role, string> = { donor: 'Donor', receiver: 'Receiver', admin: 'Admin' }

function initials(name: string | undefined) {
  return (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

function UserMenu() {
  const { profile, organization, signOut } = useProfile()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function logOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full bg-white p-1 pr-3 ring-1 ring-green-100 transition hover:ring-green-200"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-700 text-xs font-bold text-white">
          {initials(profile?.full_name)}
        </span>
        <span className="hidden max-w-36 truncate text-sm font-semibold text-ink sm:inline">{profile?.full_name}</span>
        <ChevronDown size={16} className="text-muted" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white shadow-xl shadow-green-900/10 ring-1 ring-green-100"
        >
          <div className="border-b border-green-100 bg-green-50/60 px-4 py-3">
            <p className="truncate font-semibold text-ink">{profile?.full_name}</p>
            <p className="truncate text-xs text-muted">
              {profile ? roleLabel[profile.role] : ''}
              {organization ? ` · ${organization.name}` : ''}
            </p>
          </div>
          <Link role="menuitem" to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-green-50">
            <Home size={16} aria-hidden="true" /> Back to website
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={logOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/5"
          >
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default function AppLayout() {
  const { profile } = useProfile()
  const items = profile ? links[profile.role] : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/70 via-bg to-bg">
      <header className="sticky top-0 z-40 border-b border-green-100/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" aria-label="Dashboard">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="App">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-green-600 text-white shadow-sm shadow-green-600/20' : 'text-ink/75 hover:bg-green-50 hover:text-green-700'
                  }`
                }
              >
                <Icon size={16} aria-hidden="true" /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pt-8 md:pb-12">
        <VerificationBanner />
        <Outlet />
      </main>

      {/* Bottom tab bar on phones */}
      <nav
        aria-label="App"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-green-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                  isActive ? 'text-green-700' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-12 items-center justify-center rounded-full ${isActive ? 'bg-green-100' : ''}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
