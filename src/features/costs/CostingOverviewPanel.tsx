import { useEffect } from 'react'
import { AlertTriangle, Info, Loader2, RefreshCw, Scale, TrendingUp, Target, Wallet } from 'lucide-react'
import type { BatchCostSummary, UnassignedCostItem } from '@/types/cost'
import type { TandonId } from '@/types/tandon'
import { TANDON_CONFIG } from '@/constants/tandonConfig'
import { useCostingStore } from '@/store/useCostingStore'
import type { CostingFilterTandon } from '@/store/useCostingStore'
import { USE_API } from '@/api/client'
import { formatCurrencyRpCompact } from '@/lib/formatters'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { CostingBatchTable } from './CostingBatchTable'

export interface CostingOverviewPanelProps {
  onViewBatch: (batch: BatchCostSummary) => void
  /** Buka form edit untuk memindahkan biaya tak terkelompok ke batch tertentu. */
  onMoveUnassigned: (item: UnassignedCostItem) => void
}

const FILTER_OPTIONS: Array<{ key: CostingFilterTandon; label: string }> = [
  { key: 'all', label: 'Semua' },
  { key: 'T1', label: 'T1' },
  { key: 'T2', label: 'T2' },
  { key: 'T3', label: 'T3' },
]

export function CostingOverviewPanel({ onViewBatch, onMoveUnassigned }: CostingOverviewPanelProps) {
  const overview = useCostingStore((s) => s.overview)
  const loading = useCostingStore((s) => s.loading)
  const error = useCostingStore((s) => s.error)
  const filterTandon = useCostingStore((s) => s.filterTandon)
  const fetchOverview = useCostingStore((s) => s.fetchOverview)

  useEffect(() => {
    void fetchOverview()
  }, [fetchOverview])

  const totals = overview?.totals
  const belowBreakEven = totals?.belowBreakEvenBatchCount ?? 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex gap-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1"
          role="group"
          aria-label="Filter tandon"
        >
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              aria-pressed={filterTandon === opt.key}
              onClick={() => void fetchOverview(opt.key)}
              className={[
                'h-9 rounded px-3 text-sm font-medium transition-colors',
                filterTandon === opt.key
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              {opt.key === 'all'
                ? opt.label
                : `${TANDON_CONFIG[opt.key as TandonId].name.split(' ')[0]} (${opt.key})`}
            </button>
          ))}
        </div>
        {USE_API && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" aria-hidden />}
            onClick={() => void fetchOverview()}
            disabled={loading}
          >
            Muat Ulang
          </Button>
        )}
      </div>

      {!USE_API && (
        <Card>
          <CardBody className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--status-info)]" aria-hidden />
            <p className="text-sm text-[var(--text-secondary)]">
              Rekap per batch membutuhkan backend (mode API). Jalankan{' '}
              <code className="font-mono text-xs">selada-ops-api</code> lalu set{' '}
              <code className="font-mono text-xs">VITE_USE_API=true</code>. Form input & riwayat
              biaya tetap dapat digunakan.
            </p>
          </CardBody>
        </Card>
      )}

      {USE_API && error && (
        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <p role="alert" className="text-sm text-[var(--status-danger)]">
              {error}
            </p>
            <Button variant="secondary" size="sm" onClick={() => void fetchOverview()}>
              Coba Lagi
            </Button>
          </CardBody>
        </Card>
      )}

      {USE_API && loading && !overview && (
        <p role="status" className="flex items-center gap-2 py-8 text-sm text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Memuat rekap biaya…
        </p>
      )}

      {totals && overview && (
        <>
          {belowBreakEven > 0 && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-lg border px-4 py-3"
              style={{
                borderColor: 'var(--status-danger)',
                backgroundColor: 'color-mix(in srgb, var(--status-danger) 8%, transparent)',
              }}
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--status-danger)]" aria-hidden />
              <p className="text-sm text-[var(--text-secondary)]">
                <strong className="text-[var(--status-danger)]">
                  {belowBreakEven} batch
                </strong>{' '}
                menjual di bawah harga impas — biaya per kg melebihi harga jual rata-rata.
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total Biaya"
              value={formatCurrencyRpCompact(totals.totalCost)}
              icon={Wallet}
              iconColor="var(--text-secondary)"
              footer={
                <p className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
                  Ops {formatCurrencyRpCompact(totals.operationalCost)} · Modal{' '}
                  {formatCurrencyRpCompact(totals.modalCost)}
                </p>
              }
            />
            <KpiCard
              label="Biaya per kg"
              value={formatCurrencyRpCompact(Math.round(totals.costPerKg))}
              unit={totals.totalHarvestKg > 0 ? '/kg' : undefined}
              icon={Scale}
              iconColor="var(--color-tandon-t2)"
              footer={
                <p className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
                  {formatCurrencyRpCompact(Math.round(totals.costPerHole))}/lubang
                </p>
              }
            />
            <KpiCard
              label="Laba Kotor"
              value={formatCurrencyRpCompact(totals.grossProfit)}
              icon={TrendingUp}
              iconColor={totals.grossProfit >= 0 ? 'var(--status-success)' : 'var(--status-danger)'}
              footer={
                <p className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
                  margin {totals.marginPercent.toFixed(1)}% · revenue{' '}
                  {formatCurrencyRpCompact(totals.revenue)}
                </p>
              }
            />
            <KpiCard
              label="Harga Impas"
              value={formatCurrencyRpCompact(Math.round(totals.breakEvenPricePerKg))}
              unit={totals.totalHarvestKg > 0 ? '/kg' : undefined}
              icon={Target}
              iconColor={belowBreakEven > 0 ? 'var(--status-danger)' : 'var(--status-success)'}
              footer={
                <p className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
                  {totals.avgSellingPricePerKg !== null
                    ? `jual rata-rata ${formatCurrencyRpCompact(Math.round(totals.avgSellingPricePerKg))}/kg`
                    : 'belum ada penjualan'}
                </p>
              }
            />
          </div>

          <CostingBatchTable batches={overview.batches} onViewDetail={onViewBatch} />

          {overview.unassignedItems.length > 0 && (
            <Card>
              <CardHeader
                title={`Biaya di Luar Siklus (${overview.unassignedItems.length})`}
                subtitle={`Total ${formatCurrencyRpCompact(totals.unassignedCost)} — pindahkan manual ke batch tertentu agar terhitung`}
              />
              <CardBody className="space-y-2">
                {overview.unassignedItems.map((item, i) => (
                  <div
                    key={`${item.costId}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border-default)] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {item.description}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{item.reason}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                        {formatCurrencyRpCompact(item.chargedAmount)}
                      </span>
                      <Button variant="secondary" size="sm" onClick={() => onMoveUnassigned(item)}>
                        Pindahkan Manual
                      </Button>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
