import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section
      className={[
        'rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}

export interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <header
      className={[
        'flex items-start justify-between gap-3 border-b border-[var(--border-default)] px-4 py-3',
        className,
      ].join(' ')}
    >
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

export interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <footer
      className={[
        'border-t border-[var(--border-default)] px-4 py-3',
        className,
      ].join(' ')}
    >
      {children}
    </footer>
  )
}
