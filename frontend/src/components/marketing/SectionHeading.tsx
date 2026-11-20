import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: ReactNode
  text?: string
  action?: ReactNode
}

// Small green label, a heading and an optional link on the right
export default function SectionHeading({ eyebrow, title, text, action }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
        {text && <p className="mt-2 max-w-xl text-muted">{text}</p>}
      </div>
      {action}
    </div>
  )
}

export const outlinePill =
  'inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-green-600 hover:text-green-700'
