import { useCallback, useRef, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { ToastContext, type ShowToast, type ToastKind } from './toast-context'

type Toast = { id: number; message: string; kind: ToastKind }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const show = useCallback<ShowToast>((message, kind = 'success') => {
    const id = nextId.current++
    setToasts((list) => [...list, { id, message, kind }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4500)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg ${
              t.kind === 'success' ? 'bg-green-700' : 'bg-danger'
            }`}
          >
            {t.kind === 'success' ? (
              <CircleCheck size={18} aria-hidden="true" />
            ) : (
              <CircleAlert size={18} aria-hidden="true" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}