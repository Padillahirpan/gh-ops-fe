import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardAggregates } from './dashboardData'
import { useUIStore } from '@/store/useUIStore'
import { formatWeightKg } from '@/lib/formatters'

export interface HarvestVsSoldChartProps {
  aggregates: DashboardAggregates
}

export function HarvestVsSoldChart({ aggregates }: HarvestVsSoldChartProps) {
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === 'dark'

  const textColor = isDark ? '#CBD5E1' : '#475569'
  const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.2)'
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF'
  const tooltipBorder = isDark ? '#334155' : '#E2E8F0'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={aggregates.harvestVsSold} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
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
          unit=" kg"
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
          formatter={(value: number | string, name: string) => [
            <span key={name} className="font-mono tabular-nums">
              {formatWeightKg(Number(value))}
            </span>,
            name,
          ]}
        />
        <Legend
          formatter={(value) => <span style={{ color: textColor, fontSize: 13 }}>{value}</span>}
        />

        <Bar dataKey="Panen" fill="var(--color-tandon-t1)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="Terjual" fill="var(--color-tandon-t2)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
