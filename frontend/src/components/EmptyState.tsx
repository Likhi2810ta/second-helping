import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Props = { icon: LucideIcon; title: string; text?: string; action?: ReactNode }

export default function EmptyState({ icon: Icon, title, text, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-green-200 bg-white/60 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 ring-1 ring-green-100">
        <Icon size={26} aria-hidden="true" />
      </span>
      <p className="mt-4 text-lg font-bold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
