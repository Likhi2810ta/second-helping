import { Link } from 'react-router-dom'
import RoleGate from '../components/RoleGate'
import { useProfile } from '../hooks/useProfile'

type CardProps = { to: string; title: string; text: string; locked?: boolean }

function ActionCard({ to, title, text, locked = false }: CardProps) {
  const base = 'block rounded-2xl bg-white p-5 ring-1 ring-green-100'

  if (locked) {
    return (
      <div aria-disabled="true" className={`${base} opacity-60`}>
        <h2 className="text-lg font-bold text-green-900">{title}</h2>
        <p className="mt-1 text-sm text-muted">{text}</p>
        <p className="mt-3 text-xs font-semibold text-green-700">Unlocks after admin approval</p>
      </div>
    )
  }

  return (
    <Link to={to} className={`${base} hover:bg-green-100`}>
      <h2 className="text-lg font-bold text-green-900">{title}</h2>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </Link>
  )
}

export default function Dashboard() {
  const { profile, organization } = useProfile()
  const verified = organization?.status === 'verified'

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-900">Hello, {profile?.full_name}</h1>
      <p className="mt-2 text-muted">
        {organization ? `${organization.name} · ${organization.status}` : 'Administrator'}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <RoleGate role="donor">
          <ActionCard to="/post" title="Post surplus food" text="List food that is ready to be collected." locked={!verified} />
          <ActionCard to="/my-listings" title="My listings" text="See, edit and confirm your food listings." />
        </RoleGate>

        <RoleGate role="receiver">
          <ActionCard to="/find" title="Find food nearby" text="See available food on a map and request it." locked={!verified} />
          <ActionCard to="/pickups" title="My pickups" text="Track your requests and collections." />
        </RoleGate>

        <RoleGate role="admin">
          <ActionCard to="/admin/verify" title="Verify organisations" text="Review documents and approve or reject." />
          <ActionCard to="/admin/reports" title="Reports" text="Meals saved, top donors and activity." />
        </RoleGate>
      </div>
    </div>
  )
}