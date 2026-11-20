import type { ReactNode } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'

type Props = { title: string; subtitle?: ReactNode; eyebrow?: string; action?: ReactNode }

// Consistent heading for every screen inside the app (also sets the tab title)
export default function PageHeader({ title, subtitle, eyebrow, action }: Props) {
  usePageTitle(title)
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
