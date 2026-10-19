import { NavLink, Outlet } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import type { Profile } from '../types'
import VerificationBanner from './VerificationBanner'

type Role = Profile['role']

const links: Record<Role, { to: string; label: string }[]> = {
  donor: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/post', label: 'Post food' },
    { to: '/my-listings', label: 'My listings' },
    { to: '/history', label: 'History' },
  ],
  receiver: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/find', label: 'Find food' },
    { to: '/pickups', label: 'My pickups' },
    { to: '/history', label: 'History' },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin/verify', label: 'Verify' },
    { to: '/admin/listings', label: 'Listings' },
    { to: '/admin/reports', label: 'Reports' },
  ],
}

export default function AppLayout() {
  const { profile, signOut } = useProfile()
  const items = profile ? links[profile.role] : []

  return (
    <div className="min-h-screen">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-heading text-lg font-bold text-green-700">Second Helping</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{profile?.full_name}</span>
            <button
              onClick={signOut}
              className="rounded-full border border-green-600 px-4 py-1.5 font-semibold text-green-700 hover:bg-green-100"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ${
                  isActive ? 'bg-green-600 text-white' : 'text-green-900 hover:bg-green-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <VerificationBanner />
        <Outlet />
      </div>
    </div>
  )
}