import { useMemo, useState } from 'react'
import { subDays } from 'date-fns'
import { ChartLine, BarChart3, PieChart, PackageOpen } from 'lucide-react'
import { useHarvestStore } from '@/store/useHarvestStore'
import { useSaleStore } from '@/store/useSaleStore'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { DashboardFiltersBar } from './DashboardFilters'
import { DashboardKpiCards } from './DashboardKpiCards'
import { WeightTrendChart } from './WeightTrendChart'
import { HarvestVsSoldChart } from './HarvestVsSoldChart'
import { RevenuePerTandonChart } from './RevenuePerTandonChart'
import { PatternPie, PieLegend } from './PatternPie'
import type { PatternPieSlice } from './PatternPie'
import {
  computeDashboardAggregates,
  filterByRange,
} from './dashboardData'
import type { DashboardFilters as Filters } from './dashboardData'
import { formatISO } from '@/lib/dateUtils'
import { HARVEST_REJECTION_REASONS } from '@/constants/harvestConfig'
import { BUYER_CATEGORIES } from '@/constants/salesConfig'
import { formatCurrencyRpCompact } from '@/lib/formatters'

const REJECTION_COLORS: Record<string, string> = {
  tipBurn: '#DC2626',
  rootRot: '#92400E',
  pests: '#CA8A04',
  undersized: '#0284C7',
  other: '#64748B',
}

const REJECTION_PATTERNS: Record<string, PatternPieSlice['pattern']> = {
  tipBurn: 'solid',
  rootRot: 'stripes',
  pests: 'dots',
  undersized: 'cross',
  other: 'solid',
}

const BUYER_COLORS: Record<string, string> = {
  supermarket: '#0284C7',
  restaurant: '#16A34A',
  wholesaler: '#7C3AED',
  retail: '#EA580C',
}

const BUYER_PATTERNS: Record<string, PatternPieSlice['pattern']> = {
  supermarket: 'solid',
  restaurant: 'stripes',
  wholesaler: 'dots',
  retail: 'cross',
}

export function DashboardPage() {
  const harvests = useHarvestStore((s) => s.harvests)
  const sales = useSaleStore((s) => s.sales)
  const [filters, setFilters] = useState<Filters>({ range: '90', tandonId: 'all' })

  const aggregates = useMemo(
    () => computeDashboardAggregates(harvests, sales, filters),
    [harvests, sales, filters],
  )

  const previousPeriod = useMemo(() => {
    if (filters.range === 'all') return { totalHarvestKg: 0, totalRevenue: 0 }
    const days = Number(filters.range)
    const today = new Date()
    const from = formatISO(subDays(today, days * 2))
    const to = formatISO(subDays(today, days))

    const prevHarvests = harvests.filter((h) => h.date >= from && h.date < to)
    const harvestIds = new Set(prevHarvests.map((h) => h.id))
    const prevSales = sales.filter(
      (s) => harvestIds.has(s.harvestId) && s.date >= from && s.date < to,
    )
    return {
      totalHarvestKg: prevHarvests.reduce((sum, h) => sum + h.totalWeightKg, 0),
      totalRevenue: prevSales
        .filter((s) => s.paymentStatus !== 'tempo')
        .reduce((sum, s) => sum + s.totalValue, 0),
    }
  }, [harvests, sales, filters])

  const rejectionSlices: PatternPieSlice[] = useMemo(
    () =>
      HARVEST_REJECTION_REASONS.map((r) => ({
        key: r.key,
        label: r.label,
        value: aggregates.rejectionTotals[r.key as keyof typeof aggregates.rejectionTotals],
        color: REJECTION_COLORS[r.key],
        pattern: REJECTION_PATTERNS[r.key],
      })),
    [aggregates.rejectionTotals],
  )

  const buyerSlices: PatternPieSlice[] = useMemo(
    () =>
      BUYER_CATEGORIES.map((c) => ({
        key: c.key,
        label: c.shortLabel,
        value: aggregates.buyerTotals[c.key] ?? 0,
        color: BUYER_COLORS[c.key],
        pattern: BUYER_PATTERNS[c.key],
      })),
    [aggregates.buyerTotals],
  )

  const hasRejections = rejectionSlices.some((s) => s.value > 0)
  const hasBuyers = buyerSlices.some((s) => s.value > 0)

  const tandonFilteredHarvests = filterByRange(harvests, filters)

  return (
    <div className="space-y-6">
      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      {!aggregates.hasData ? (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PackageOpen
                className="h-10 w-10 text-[var(--text-muted)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <h2 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                Belum ada data untuk periode ini
              </h2>
              <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                Catat panen & penjualan lewat menu Panen dan Penjualan, atau muat
                data demo dari Pengaturan.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <DashboardKpiCards aggregates={aggregates} previous={previousPeriod} />

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader
                title="Tren Rata-rata Berat"
                subtitle={`${tandonFilteredHarvests.length} entri panen · target 200g/tanaman`}
              />
              <CardBody>
                {tandonFilteredHarvests.length > 0 ? (
                  <WeightTrendChart aggregates={aggregates} />
                ) : (
                  <p className="py-16 text-center text-sm text-[var(--text-muted)]">
                    Tidak ada data panen di rentang ini.
                  </p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Panen vs Terjual per Tandon"
                subtitle="Deteksi spoilage & sisa stok"
              />
              <CardBody>
                <HarvestVsSoldChart aggregates={aggregates} />
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader title="Revenue per Tandon" subtitle="Total nilai transaksi" />
              <CardBody>
                <RevenuePerTandonChart aggregates={aggregates} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Alasan Afkir" subtitle="Distribusi tanaman dibuang" />
              <CardBody>
                {hasRejections ? (
                  <>
                    <PatternPie data={rejectionSlices} />
                    <PieLegend data={rejectionSlices} />
                  </>
                ) : (
                  <p className="py-16 text-center text-sm text-[var(--text-muted)]">
                    Tidak ada afkir di periode ini. 🎉
                  </p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Kanal Pembeli"
                subtitle="Distribusi revenue per kanal"
              />
              <CardBody>
                {hasBuyers ? (
                  <>
                    <PatternPie
                      data={buyerSlices}
                      valueFormatter={(v, p) => `${formatCurrencyRpCompact(v)} (${p.toFixed(0)}%)`}
                    />
                    <PieLegend data={buyerSlices} />
                  </>
                ) : (
                  <p className="py-16 text-center text-sm text-[var(--text-muted)]">
                    Belum ada penjualan di periode ini.
                  </p>
                )}
              </CardBody>
            </Card>
          </div>

          <p className="flex items-center justify-center gap-4 pb-2 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <ChartLine className="h-3.5 w-3.5" aria-hidden /> Tren berat
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden /> Panen vs terjual
            </span>
            <span className="flex items-center gap-1">
              <PieChart className="h-3.5 w-3.5" aria-hidden /> Distribusi (pattern
              untuk buta warna)
            </span>
          </p>
        </>
      )}
    </div>
  )
}
