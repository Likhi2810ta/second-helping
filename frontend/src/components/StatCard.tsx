import { Link } from 'react-router-dom'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

type Props = {
  label: string
  value: number | string
  icon?: LucideIcon
  to?: string
  highlight?: boolean
  hint?: string
}

export default function StatCard({ label, value, icon: Icon, to, highlight = false, hint }: Props) {
  const box = `group relative rounded-3xl p-5 ring-1 transition ${
    highlight ? 'bg-warn/10 ring-warn/40' : 'bg-white ring-green-100 shadow-sm'
  }`

  const content = (
    <>
      <div className="flex items-start justify-between">
        {Icon && (
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              highlight ? 'bg-warn/20 text-ink' : 'bg-green-50 text-green-600'
            }`}
          >
            <Icon size={20} aria-hidden="true" />
          </span>
        )}
        {to && (
          <ArrowUpRight
            size={18}
            className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-green-700"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-4 font-heading text-3xl font-extrabold text-ink sm:text-4xl">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      <p className="mt-1 text-sm font-medium text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted/80">{hint}</p>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={`${box} block hover:-translate-y-0.5 hover:shadow-md`}>
        {content}
      </Link>
    )
  }
  return <div className={box}>{content}</div>
}
