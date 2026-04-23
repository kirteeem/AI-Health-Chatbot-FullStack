'use client'

import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-slate-950 hover:brightness-110 shadow-softSm shadow-black/30 focus-visible:ring-2 focus-visible:ring-accent/70',
  secondary:
    'glass text-fg hover:bg-surface/60 focus-visible:ring-2 focus-visible:ring-accent/50',
  ghost:
    'text-fg hover:bg-surface/40 focus-visible:ring-2 focus-visible:ring-accent/40',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-11 px-4 text-sm rounded-2xl',
  lg: 'h-12 px-5 text-base rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition will-change-transform',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/20 border-t-slate-950/80"
        />
      )}
      {children}
    </button>
  )
})

