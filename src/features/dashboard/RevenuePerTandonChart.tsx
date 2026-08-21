import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardAggregates } from './dashboardData'
import { useUIStore } from '@/store/useUIStore'
import { formatCurrencyRp } from '@/lib/formatters'

const TANDON_HEX: Record<string, string> = {
  T1: '#4C8DC4',
  T2: '#4FA772',
  T3: '#9B7FD1',
}

export interface RevenuePerTandonChartProps {
  aggregates: DashboardAggregates
}

export function RevenuePerTandonChart({ aggregates }: RevenuePerTandonChartProps) {
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === 'dark'

  const textColor = isDark ? '#CBD5E1' : '#475569'
  const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.2)'
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF'
  const tooltipBorder = isDark ? '#334155' : '#E2E8F0'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={aggregates.revenuePerTandon} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="4 4" />
        <XAxis
          dataKey="tandon"
          tick={{ fill: textColor, fontSize: 12, fontWeight: 600 }}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}Jt`}
        />
        <Tooltip
          cursor={{ fill: gridColor }}
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 8,
            fontSize: 13,
          }}
          labelStyle={{ color: textColor, fontWeight: 600 }}
          formatter={(value: number | string) => [
            <span key="rev" className="font-mono tabular-nums">
              {formatCurrencyRp(Number(value))}
            </span>,
            'Revenue',
          ]}
        />

        <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {aggregates.revenuePerTandon.map((entry) => (
            <Cell key={entry.tandon} fill={TANDON_HEX[entry.tandon]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
