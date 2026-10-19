import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Organization, Profile } from '../types'
import { AuthContext, type AuthState } from './auth-context'

type Account = {
  userId: string
  profile: Profile | null
  organization: Organization | null
}

async function fetchAccount(userId: string): Promise<Account> {
  const [p, o] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('organizations').select('*').eq('owner_id', userId).maybeSingle(),
  ])
  return { userId, profile: p.data, organization: o.data }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)

  // 1. Keep the session in sync with Supabase (login, logout, token refresh)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id

  // 2. Load the profile and organisation whenever the logged-in user changes
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    fetchAccount(userId).then((a) => {
      if (!cancelled) setAccount(a)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (userId) setAccount(await fetchAccount(userId))
  }, [userId])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthState>(() => {
    const accountReady = !!userId && account?.userId === userId
    return {
      session,
      user: session?.user ?? null,
      profile: accountReady ? (account?.profile ?? null) : null,
      organization: accountReady ? (account?.organization ?? null) : null,
      loading: !sessionReady || (!!userId && !accountReady),
      refresh,
      signOut,
    }
  }, [session, sessionReady, userId, account, refresh, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}