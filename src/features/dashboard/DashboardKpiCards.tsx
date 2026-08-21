import { Wheat, Scale, Wallet, Percent } from 'lucide-react'
import type { DashboardAggregates } from './dashboardData'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import {
  formatCurrencyRpCompact,
  formatPercent,
  formatWeightG,
  formatWeightKg,
} from '@/lib/formatters'

export interface DashboardKpiCardsProps {
  aggregates: DashboardAggregates
  previous: {
    totalHarvestKg: number
    totalRevenue: number
  }
}

export function DashboardKpiCards({ aggregates, previous }: DashboardKpiCardsProps) {
  const harvestDelta =
    previous.totalHarvestKg > 0
      ? ((aggregates.totalHarvestKg - previous.totalHarvestKg) /
          previous.totalHarvestKg) *
        100
      : null
  const revenueDelta =
    previous.totalRevenue > 0
      ? ((aggregates.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
      : null

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total Panen"
        value={formatWeightKg(Math.round(aggregates.totalHarvestKg * 10) / 10).replace(' kg', '')}
        unit={`kg · ${aggregates.harvestCount}x`}
        icon={Wheat}
        iconColor="var(--color-tandon-t2)"
        delta={
          harvestDelta !== null
            ? {
                direction: harvestDelta >= 0 ? 'up' : 'down',
                percent: harvestDelta,
                tone: harvestDelta >= 0 ? 'success' : 'danger',
                label: 'vs periode lalu',
              }
            : undefined
        }
      />

      <KpiCard
        label="Rata-rata Berat"
        value={formatWeightG(aggregates.avgWeightG).replace(' g', '')}
        unit="g/tanaman"
        icon={Scale}
        iconColor="var(--color-tandon-t1)"
        footer={
          <Badge
            variant={aggregates.avgWeightBadgeTone}
            qualitative={
              aggregates.avgWeightG >= 200
                ? 'Target tercapai'
                : aggregates.avgWeightG >= 170
                  ? 'Perlu perhatian'
                  : 'Dibawah target'
            }
            size="sm"
          />
        }
      />

      <KpiCard
        label="Total Revenue"
        value={formatCurrencyRpCompact(aggregates.totalRevenue).replace('Rp ', '')}
        unit="(Paid + DP)"
        icon={Wallet}
        iconColor="var(--status-success)"
        delta={
          revenueDelta !== null
            ? {
                direction: revenueDelta >= 0 ? 'up' : 'down',
                percent: revenueDelta,
                tone: revenueDelta >= 0 ? 'success' : 'danger',
                label: 'vs periode lalu',
              }
            : undefined
        }
      />

      <KpiCard
        label="Success Rate"
        value={formatPercent(aggregates.successRate, 1).replace('%', '')}
        unit="% siap jual"
        icon={Percent}
        iconColor="var(--color-tandon-t3)"
        footer={
          <p className="text-xs text-[var(--text-muted)]">
            Stok ready: {formatWeightKg(Math.round(aggregates.readyStockKg * 10) / 10)}
          </p>
        }
      />
    </div>
  )
}
