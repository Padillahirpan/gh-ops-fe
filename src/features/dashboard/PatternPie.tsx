import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useUIStore } from '@/store/useUIStore'
import { formatNumber, formatPercent } from '@/lib/formatters'

export interface PatternPieSlice {
  key: string
  label: string
  value: number
  color: string
  pattern: 'solid' | 'stripes' | 'dots' | 'cross'
}

export interface PatternPieProps {
  data: PatternPieSlice[]
  valueFormatter?: (v: number, percent: number) => string
}

function buildPatternDef(slice: PatternPieSlice, isDark: boolean): string {
  const light = isDark
    ? 'rgba(255,255,255,0.22)'
    : 'rgba(255,255,255,0.45)'
  const dark = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)'
  const id = `pie-pattern-${slice.key}`

  switch (slice.pattern) {
    case 'stripes':
      return `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="${slice.color}" />
        <rect width="4" height="8" fill="${light}" />
      </pattern>`
    case 'dots':
      return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="${slice.color}" />
        <circle cx="5" cy="5" r="2.5" fill="${dark}" />
      </pattern>`
    case 'cross':
      return `<pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="${slice.color}" />
        <path d="M0,6 L12,6 M6,0 L6,12" stroke="${dark}" strokeWidth="2" />
      </pattern>`
    default:
      return ''
  }
}

export function PatternPie({ data, valueFormatter }: PatternPieProps) {
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === 'dark'

  const defs = useMemo(
    () =>
      data
        .filter((d) => d.pattern !== 'solid' && d.value > 0)
        .map((d) => buildPatternDef(d, isDark))
        .join(''),
    [data, isDark],
  )

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF'
  const tooltipBorder = isDark ? '#334155' : '#E2E8F0'
  const textColor = isDark ? '#CBD5E1' : '#475569'

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <defs dangerouslySetInnerHTML={{ __html: defs }} />
        <Pie
          data={data.filter((d) => d.value > 0)}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
          strokeWidth={1.5}
          stroke={isDark ? '#0B1220' : '#FFFFFF'}
          labelLine={false}
        >
          {data
            .filter((d) => d.value > 0)
            .map((slice) => (
              <Cell
                key={slice.key}
                fill={
                  slice.pattern === 'solid'
                    ? slice.color
                    : `url(#pie-pattern-${slice.key})`
                }
              />
            ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 8,
            fontSize: 13,
          }}
          formatter={(value: number | string, name: string) => {
            const v = Number(value)
            const percent = total > 0 ? (v / total) * 100 : 0
            return [
              valueFormatter
                ? valueFormatter(v, percent)
                : `${formatNumber(v)} (${formatPercent(percent)})`,
              <span key={name} style={{ color: textColor }}>
                {name}
              </span>,
            ]
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function PieLegend({ data }: { data: PatternPieSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  return (
    <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {data
        .filter((d) => d.value > 0)
        .map((d) => {
          const percent = total > 0 ? (d.value / total) * 100 : 0
          return (
            <li key={d.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-sm"
                  style={{
                    backgroundColor: d.color,
                    backgroundImage:
                      d.pattern === 'stripes'
                        ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 3px, transparent 3px 6px)'
                        : d.pattern === 'dots'
                          ? 'radial-gradient(circle, rgba(0,0,0,0.45) 1.5px, transparent 1.5px)'
                          : d.pattern === 'cross'
                            ? 'linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)'
                            : undefined,
                    backgroundSize:
                      d.pattern === 'dots' ? '6px 6px' : d.pattern === 'cross' ? '6px 6px' : undefined,
                  }}
                  aria-hidden
                />
                <span className="truncate text-[var(--text-secondary)]">{d.label}</span>
              </span>
              <span className="font-mono tabular-nums font-medium text-[var(--text-primary)]">
                {formatNumber(d.value)} ({formatPercent(percent, 0)})
              </span>
            </li>
          )
        })}
    </ul>
  )
}
