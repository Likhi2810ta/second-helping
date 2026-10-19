import { useProfile } from '../hooks/useProfile'

export default function Onboarding() {
  const { profile, signOut } = useProfile()

  return (
    <main className="mx-auto max-w-lg p-10">
      <h1 className="text-3xl font-bold text-green-900">Set up your organisation</h1>
      <p className="mt-2 text-muted">
        Welcome, {profile?.full_name}. The form arrives in the next step.
      </p>
      <button
        onClick={signOut}
        className="mt-6 rounded-full border border-green-600 px-5 py-2 font-semibold text-green-700"
      >
        Log out
      </button>
    </main>
  )
}