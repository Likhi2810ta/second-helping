type Props = { fraction: number; center: string; label: string }

const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function FreshnessRing({ fraction, center, label }: Props) {
  const color = fraction > 0.5 ? 'stroke-green-600' : fraction > 0.2 ? 'stroke-warn' : 'stroke-danger'

  return (
    <div className="relative h-16 w-16 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={RADIUS} fill="none" strokeWidth="5" className="stroke-green-100" />
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          className={color}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-900">
        {center}
      </span>
    </div>
  )
}
