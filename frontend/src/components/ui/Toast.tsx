'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

type ToastType = 'success' | 'error' | 'info'

type ToastItem = {
  id: string
  type: ToastType
  title: string
  description?: string
}

type ToastApi = {
  toast: (t: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastApi | null>(null)

function toastStyles(type: ToastType) {
  switch (type) {
    case 'success':
      return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
    case 'error':
      return 'border-red-400/40 bg-red-500/10 text-red-100'
    default:
      return 'border-sky-400/40 bg-sky-500/10 text-sky-100'
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const item: ToastItem = { id, ...t }
    setItems((prev) => [item, ...prev].slice(0, 4))
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id))
    }, 3800)
  }, [])

  const api = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto glass rounded-2xl p-4 shadow-soft',
              'animate-fadeUp',
              toastStyles(t.type),
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-fg">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                className="rounded-xl p-1 text-muted transition hover:bg-surface/40"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

