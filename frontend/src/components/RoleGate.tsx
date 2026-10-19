import type { ReactNode } from 'react'
import { useProfile } from '../hooks/useProfile'
import type { Profile } from '../types'

type Role = Profile['role']

type Props = {
  role: Role | Role[]
  verifiedOnly?: boolean // also require a verified organisation (admins always pass)
  fallback?: ReactNode // shown instead when access is denied
  children: ReactNode
}

export default function RoleGate({ role, verifiedOnly = false, fallback = null, children }: Props) {
  const { profile, organization } = useProfile()

  if (!profile) return <>{fallback}</>

  const allowed = Array.isArray(role) ? role : [role]
  if (!allowed.includes(profile.role)) return <>{fallback}</>

  if (verifiedOnly && profile.role !== 'admin' && organization?.status !== 'verified') {
    return <>{fallback}</>
  }

  return <>{children}</>
}