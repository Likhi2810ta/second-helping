import { useProfile } from '../hooks/useProfile'

export default function Dashboard() {
  const { profile, organization } = useProfile()

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-900">Hello, {profile?.full_name}</h1>
      <p className="mt-2 text-muted">
        Role: {profile?.role}
        {organization ? ` · ${organization.name} (${organization.status})` : ''}
      </p>
    </div>
  )
}