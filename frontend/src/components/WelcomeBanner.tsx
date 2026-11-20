import type { ReactNode } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'

type Props = { name?: string; subtitle: ReactNode; image: string; action?: ReactNode }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Friendly header for every dashboard: greeting, a line about the account, one main action
export default function WelcomeBanner({ name, subtitle, image, action }: Props) {
  usePageTitle('Dashboard')
  const first = name?.split(' ')[0]

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-100 via-green-50 to-white ring-1 ring-green-100">
      <img
        src={image}
        alt=""
        className="absolute inset-y-0 right-0 hidden h-full w-2/5 object-cover sm:block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-2/5 bg-gradient-to-r from-green-50 via-green-50/40 to-transparent sm:block"
      />
      <div className="relative max-w-xl p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">{greeting()}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
          Hello, <span className="text-green-600">{first ?? 'there'}</span> 👋
        </h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        {action && <div className="mt-6 flex flex-wrap gap-3">{action}</div>}
      </div>
    </section>
  )
}
