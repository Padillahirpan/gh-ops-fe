import type { TandonId } from '@/types/tandon'
import { TANDON_CONFIG } from '@/constants/tandonConfig'

export interface TandonColorDotProps {
  tandonId: TandonId
  size?: number
  withRing?: boolean
  className?: string
  label?: string
}

export function TandonColorDot({
  tandonId,
  size = 10,
  withRing = false,
  className = '',
  label,
}: TandonColorDotProps) {
  const color = TANDON_CONFIG[tandonId].color
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: withRing ? `0 0 0 3px color-mix(in srgb, ${color} 25%, transparent)` : undefined,
      }}
      role="img"
      aria-label={label ?? `Warna ${TANDON_CONFIG[tandonId].name}`}
    />
  )
}
