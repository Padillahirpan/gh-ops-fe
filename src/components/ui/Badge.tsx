import type { LucideIcon } from 'lucide-react'

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  variant: BadgeVariant
  icon?: LucideIcon
  quantitative?: string
  qualitative: string
  size?: BadgeSize
}

const VARIANT_VARS: Record<BadgeVariant, { color: string; bgPercent: number }> = {
  success: { color: 'var(--status-success)', bgPercent: 15 },
  warning: { color: 'var(--status-warning)', bgPercent: 15 },
  danger: { color: 'var(--status-danger)', bgPercent: 15 },
  info: { color: 'var(--status-info)', bgPercent: 15 },
  neutral: { color: 'var(--status-neutral)', bgPercent: 15 },
}

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-xs gap-1',
  md: 'h-6 px-2.5 text-sm gap-1.5',
}

export function Badge({
  variant,
  icon: Icon,
  quantitative,
  qualitative,
  size = 'md',
}: BadgeProps) {
  const { color, bgPercent } = VARIANT_VARS[variant]
  return (
    <span
      className={[
        'inline-flex items-center rounded-sm border font-medium whitespace-nowrap',
        SIZE_STYLES[size],
      ].join(' ')}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} ${bgPercent}%, transparent)`,
        borderColor: color,
        color,
      }}
    >
      {Icon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />}
      {quantitative && (
        <span className="font-mono font-semibold tabular-nums">{quantitative}</span>
      )}
      {quantitative && qualitative && <span aria-hidden>—</span>}
      <span>{qualitative}</span>
    </span>
  )
}
