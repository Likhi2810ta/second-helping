import type { InputHTMLAttributes } from 'react'
import { inputClass, labelClass } from '../lib/ui'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }

export default function Field({ label, hint, id, ...props }: Props) {
  const inputId = id ?? props.name
  const hintId = hint && inputId ? `${inputId}-hint` : undefined
  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <input id={inputId} aria-describedby={hintId} {...props} className={inputClass} />
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
