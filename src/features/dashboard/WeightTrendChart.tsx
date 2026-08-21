import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardAggregates } from './dashboardData'
import { useUIStore } from '@/store/useUIStore'
import { TANDON_IDS } from '@/constants/tandonConfig'
import { TARGET_AVG_WEIGHT_G } from '@/constants/harvestConfig'
import { formatDateID } from '@/lib/dateUtils'

const TANDON_HEX: Record<string, string> = {
  T1: '#4C8DC4',
  T2: '#4FA772',
  T3: '#9B7FD1',
}

export interface WeightTrendChartProps {
  aggregates: DashboardAggregates
}

export function WeightTrendChart({ aggregates }: WeightTrendChartProps) {
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === 'dark'

  const textColor = isDark ? '#CBD5E1' : '#475569'
  const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.2)'
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF'
  const tooltipBorder = isDark ? '#334155' : '#E2E8F0'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={aggregates.weightTrend} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="4 4" />
        <XAxis
          dataKey="label"
          tick={{ fill: textColor, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={[0, 260]}
          unit="g"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 8,
            fontSize: 13,
          }}
          labelStyle={{ color: textColor, fontWeight: 600 }}
          formatter={(value: number | string, name: string) => [
            <span key={name} className="font-mono tabular-nums">
              {value} g
            </span>,
            name,
          ]}
          labelFormatter={(label) => {
            const point = aggregates.weightTrend.find((p) => p.label === label)
            return point ? formatDateID(point.date) : String(label)
          }}
        />
        <Legend
          formatter={(value) => <span style={{ color: textColor, fontSize: 13 }}>{value}</span>}
        />

        <ReferenceLine
          y={TARGET_AVG_WEIGHT_G}
          stroke="var(--status-success)"
          strokeDasharray="6 4"
          label={{
            value: `Target ${TARGET_AVG_WEIGHT_G}g`,
            position: 'insideTopRight',
            fill: 'var(--status-success)',
            fontSize: 11,
          }}
        />

        {TANDON_IDS.map((id) => (
          <Line
            key={id}
            type="monotone"
            dataKey={id}
            name={id}
            stroke={TANDON_HEX[id]}
            strokeWidth={2}
            connectNulls
            dot={(props) => {
              const { cx, cy, payload } = props
              if (cx === undefined || cy === undefined) return <g key={`${cx}-${cy}`} />
              const value = payload[id]
              if (typeof value !== 'number') return <g key={`${cx}-${cy}`} />
              const belowTarget = value < TARGET_AVG_WEIGHT_G
              return (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={belowTarget ? 6 : 3}
                  fill={belowTarget ? '#DC2626' : TANDON_HEX[id]}
                  stroke={belowTarget ? '#DC2626' : TANDON_HEX[id]}
                  strokeWidth={2}
                />
              )
            }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
