import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type KpiDeltaTone = 'success' | 'danger' | 'neutral'

export interface KpiCardProps {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  iconColor?: string | undefined
  delta?: {
    direction: 'up' | 'down' | 'flat'
    percent: number
    tone: KpiDeltaTone
    label?: string | undefined
  } | undefined
  footer?: ReactNode
}

const DELTONES: Record<KpiDeltaTone, string> = {
  success: 'var(--status-success)',
  danger: 'var(--status-danger)',
  neutral: 'var(--status-neutral)',
}

export function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  iconColor = 'var(--color-tandon-t1)',
  delta,
  footer,
}: KpiCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
        <Icon className="h-4 w-4" style={{ color: iconColor }} aria-hidden />
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-bold tabular-nums leading-none text-[var(--text-primary)]">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-[var(--text-secondary)]">{unit}</span>
        )}
      </div>

      {delta && (
        <div className="mt-2 flex items-center gap-1 text-sm" style={{ color: DELTONES[delta.tone] }}>
          {delta.direction === 'up' && <ArrowUp className="h-3.5 w-3.5" aria-hidden />}
          {delta.direction === 'down' && <ArrowDown className="h-3.5 w-3.5" aria-hidden />}
          {delta.direction === 'flat' && <Minus className="h-3.5 w-3.5" aria-hidden />}
          <span className="font-mono tabular-nums">
            {Math.abs(delta.percent).toFixed(1)}%
          </span>
          {delta.label && <span className="text-[var(--text-muted)]">{delta.label}</span>}
        </div>
      )}

      {footer && <div className="mt-2">{footer}</div>}
    </div>
  )
}
