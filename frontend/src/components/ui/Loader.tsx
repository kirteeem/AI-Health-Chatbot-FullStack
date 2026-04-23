'use client'

import { cn } from '../../lib/cn'

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-sm text-muted', className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border/70 border-t-accent/90" />
      <span>Loading…</span>
    </div>
  )
}

