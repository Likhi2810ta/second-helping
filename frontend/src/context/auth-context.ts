import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Organization, Profile } from '../types'

export type AuthState = {
  session: Session | null
  user: User | null
  profile: Profile | null
  organization: Organization | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)