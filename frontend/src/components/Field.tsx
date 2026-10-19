import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }

export default function Field({ label, hint, id, ...props }: Props) {
  const inputId = id ?? props.name
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-green-900">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className="mt-1 w-full rounded-lg border border-muted/40 bg-white px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
      />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}