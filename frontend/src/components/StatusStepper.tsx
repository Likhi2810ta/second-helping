import { Check } from 'lucide-react'

const steps = ['Posted', 'Requested', 'Confirmed', 'Picked up']
const position: Record<string, number> = { available: 0, requested: 1, confirmed: 2, picked_up: 3 }

export default function StatusStepper({ status }: { status: string }) {
  const current = position[status]
  if (current === undefined) return null

  return (
    <ol className="mt-3 flex items-center gap-2" aria-label="Listing progress">
      {steps.map((label, i) => (
        <li
          key={label}
          className="flex flex-1 items-center gap-2"
          aria-current={i === current ? 'step' : undefined}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i <= current ? 'bg-green-600 text-white' : 'bg-green-100 text-green-900'
            }`}
          >
            {i < current ? <Check size={14} aria-hidden="true" /> : i + 1}
          </span>
          <span
            className={`sr-only text-xs sm:not-sr-only ${
              i <= current ? 'font-semibold text-green-900' : 'text-muted'
            }`}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  )
}