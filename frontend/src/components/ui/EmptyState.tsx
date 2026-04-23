import { cn } from '../../lib/cn'

export function EmptyState({
  title,
  description,
  icon,
  className,
  actions,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('glass rounded-2xl p-6 text-center shadow-softSm shadow-black/30', className)}>
      {icon && <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-surface/60">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {actions && <div className="mt-4 flex items-center justify-center gap-2">{actions}</div>}
    </div>
  )
}

