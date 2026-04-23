'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div className="absolute left-1/2 top-1/2 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2">
        <div className={cn('glass rounded-2xl p-5 shadow-soft', className)}>
          <div className="flex items-start justify-between gap-3">
            {title ? <h3 className="text-lg font-semibold">{title}</h3> : <div />}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1 text-muted transition hover:bg-surface/40"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  )
}

