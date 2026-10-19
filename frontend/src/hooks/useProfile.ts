import { useContext } from 'react'
import { AuthContext } from '../context/auth-context'

export function useProfile() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useProfile must be used inside <AuthProvider>')
  return ctx
}