import { Check } from 'lucide-react'

type StepperProps = { steps: string[]; current: number; label: string }

// A row of numbered steps. Steps before `current` are ticked, `current` is highlighted.
export function Stepper({ steps, current, label }: StepperProps) {
  return (
    <ol className="mt-3 flex items-center gap-2" aria-label={label}>
      {steps.map((step, i) => (
        <li
          key={step}
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
            {step}
          </span>
        </li>
      ))}
    </ol>
  )
}

const listingSteps = ['Posted', 'Requested', 'Confirmed', 'Picked up']
const position: Record<string, number> = { available: 0, requested: 1, confirmed: 2, picked_up: 3 }

// Progress of a listing, as the donor sees it
export default function StatusStepper({ status }: { status: string }) {
  const current = position[status]
  if (current === undefined) return null
  return <Stepper steps={listingSteps} current={current} label="Listing progress" />
}
