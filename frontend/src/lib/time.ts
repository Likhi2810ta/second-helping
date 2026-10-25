function msLeft(expiresAt: string, now: number) {
  return new Date(expiresAt).getTime() - now
}

export function isLive(expiresAt: string, now: number) {
  return msLeft(expiresAt, now) > 0
}

export function timeLeftLabel(expiresAt: string, now: number) {
  const ms = msLeft(expiresAt, now)
  if (ms <= 0) return 'Expired'
  const mins = Math.floor(ms / 60_000)
  if (mins < 60) return `${mins}m left`
  const hours = Math.floor(mins / 60)
  const rest = mins % 60
  return rest ? `${hours}h ${rest}m left` : `${hours}h left`
}

export function shortTimeLabel(expiresAt: string, now: number) {
  const ms = msLeft(expiresAt, now)
  if (ms <= 0) return '0m'
  const mins = Math.floor(ms / 60_000)
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h`
}

// 1 = just prepared, 0 = expired
export function freshness(preparedAt: string, expiresAt: string, now: number) {
  const total = new Date(expiresAt).getTime() - new Date(preparedAt).getTime()
  if (total <= 0) return 0
  return Math.max(0, Math.min(1, msLeft(expiresAt, now) / total))
}
