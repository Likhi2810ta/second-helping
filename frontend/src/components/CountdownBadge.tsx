import { freshness, timeLeftLabel } from '../lib/time'

type Props = { preparedAt: string; expiresAt: string; now: number }

export default function CountdownBadge({ preparedAt, expiresAt, now }: Props) {
  const fraction = freshness(preparedAt, expiresAt, now)
  // The text stays dark; the background shows how urgent it is.
  const tone =
    fraction > 0.5 ? 'bg-green-100' : fraction > 0.2 ? 'bg-warn/25' : 'bg-danger/15'

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-green-900 ${tone}`}>
      {timeLeftLabel(expiresAt, now)}
    </span>
  )
}