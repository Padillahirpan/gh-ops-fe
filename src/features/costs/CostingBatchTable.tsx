import { Eye, Wallet } from 'lucide-react'
import type { BatchCostSummary } from '@/types/cost'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import { formatDateID } from '@/lib/dateUtils'
import { formatCurrencyRp, formatPercent, formatWeightKg } from '@/lib/formatters'

export interface CostingBatchTableProps {
  batches: BatchCostSummary[]
  onViewDetail: (batch: BatchCostSummary) => void
}

export function CostingBatchTable({ batches, onViewDetail }: CostingBatchTableProps) {
  const columns: Array<DataTableColumn<BatchCostSummary>> = [
    {
      key: 'batch',
      header: 'Batch',
      sticky: true,
      sortValue: (row) => row.sowingDate,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
            <TandonColorDot tandonId={row.tandonId} />
            <span className="font-mono text-sm">{row.batchCode}</span>
          </span>
          <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
            semai {formatDateID(row.sowingDate)} → {formatDateID(row.cycleEndDate)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      render: (row) => (
        <div className="flex flex-col items-start gap-1">
          <Badge
            variant={row.status === 'Berjalan' ? 'info' : 'neutral'}
            qualitative={row.status}
            size="sm"
          />
          {row.implicit && (
            <span className="text-xs text-[var(--text-muted)]">(otomatis)</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalCost',
      header: 'Total Biaya',
      align: 'right',
      sortValue: (row) => row.totalCost,
      render: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrencyRp(row.totalCost)}
          </span>
          <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
            Ops {formatCurrencyRp(row.operationalCost)} · Modal {formatCurrencyRp(row.modalCost)}
          </span>
        </div>
      ),
    },
    {
      key: 'totalHarvestKg',
      header: 'Panen',
      align: 'right',
      sortValue: (row) => row.totalHarvestKg,
      render: (row) => (
        <span className="font-mono tabular-nums">
          {row.hasHarvest ? formatWeightKg(row.totalHarvestKg) : '—'}
        </span>
      ),
    },
    {
      key: 'costPerKg',
      header: 'Biaya/kg',
      align: 'right',
      sortValue: (row) => row.costPerKg,
      render: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-mono tabular-nums">
            {row.hasHarvest ? formatCurrencyRp(Math.round(row.costPerKg)) : '—'}
          </span>
          <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
            {formatCurrencyRp(Math.round(row.costPerHole))}/lubang
          </span>
        </div>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      sortValue: (row) => row.revenue,
      render: (row) => (
        <span className="font-mono tabular-nums">{formatCurrencyRp(row.revenue)}</span>
      ),
    },
    {
      key: 'grossProfit',
      header: 'Laba (Margin)',
      align: 'right',
      sortValue: (row) => row.grossProfit,
      render: (row) => (
        <div className="flex flex-col items-end">
          <span
            className="font-mono font-semibold tabular-nums"
            style={{
              color:
                row.grossProfit >= 0 ? 'var(--status-success)' : 'var(--status-danger)',
            }}
          >
            {formatCurrencyRp(row.grossProfit)}
          </span>
          <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
            {formatPercent(row.marginPercent)}
          </span>
        </div>
      ),
    },
    {
      key: 'breakEven',
      header: 'Impas vs Jual',
      align: 'right',
      sortValue: (row) => row.breakEvenPricePerKg,
      render: (row) => (
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono tabular-nums">
            {row.hasHarvest ? `${formatCurrencyRp(Math.round(row.breakEvenPricePerKg))}/kg` : '—'}
          </span>
          {row.belowBreakEven ? (
            <Badge variant="danger" qualitative="Di Bawah Impas" size="sm" />
          ) : row.avgSellingPricePerKg !== null ? (
            <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
              jual {formatCurrencyRp(Math.round(row.avgSellingPricePerKg))}/kg
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">belum ada penjualan</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Lihat rincian biaya batch ${row.batchCode}`}
          onClick={() => onViewDetail(row)}
        >
          <Eye className="h-4 w-4" aria-hidden />
        </Button>
      ),
    },
  ]

  return (
    <DataTable
      data={batches}
      columns={columns}
      getRowKey={(row) => row.cycleId}
      initialSortKey="sowingDate"
      initialSortDirection="desc"
      emptyIcon={Wallet}
      emptyTitle="Belum ada batch panen"
      emptySubtitle="Batch muncul otomatis saat tanggal semai tandon diisi."
      ariaLabel="Tabel rekap biaya per batch"
    />
  )
}
