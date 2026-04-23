'use client'

import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, id, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-fg">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(
          'h-11 w-full rounded-2xl px-3 text-sm outline-none transition',
          'bg-surface/40 border border-border/60 placeholder:text-muted/70',
          'focus:border-accent/70 focus:ring-2 focus:ring-accent/25',
          error ? 'border-red-400/70 focus:border-red-400/70 focus:ring-red-500/20' : '',
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  )
})

