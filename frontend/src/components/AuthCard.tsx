import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = { title: string; subtitle?: string; children: ReactNode }

export default function AuthCard({ title, subtitle, children }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-green-100">
        <Link to="/" className="font-heading text-lg font-bold text-green-700">
          Second Helping
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-green-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}