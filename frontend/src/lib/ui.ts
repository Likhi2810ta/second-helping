export const primaryBtn =
  'w-full rounded-full bg-green-600 px-5 py-3 font-semibold text-white shadow-sm shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60'

// Inline (not full width) buttons
export const solidPill =
  'inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60'
export const outlinePill =
  'inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-green-200 transition hover:text-green-700 hover:ring-green-600 disabled:cursor-not-allowed disabled:opacity-60'
export const dangerPill =
  'inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-danger ring-1 ring-danger/30 transition hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-60'

export const card = 'rounded-3xl bg-white shadow-sm ring-1 ring-green-100'

export const errorBox = 'rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger'

export const noticeBox = 'rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900 ring-1 ring-green-100'

export const linkText = 'font-semibold text-green-700 underline-offset-4 hover:underline'

export const inputClass =
  'mt-1 w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 outline-none transition placeholder:text-muted/60 focus:border-green-600 focus:ring-4 focus:ring-green-600/10'

export const labelClass = 'block text-sm font-semibold text-ink'

// Pill-shaped tab buttons
export function tabClass(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active ? 'bg-green-600 text-white shadow-sm shadow-green-600/20' : 'bg-white text-ink ring-1 ring-green-100 hover:bg-green-50'
  }`
}
