import { Pencil, Trash2, Eye } from 'lucide-react'
import type { HarvestEntry } from '@/types/harvest'
import type { TandonId } from '@/types/tandon'
import { TANDON_CONFIG } from '@/constants/tandonConfig'
import { HARVEST_REJECTION_REASONS } from '@/constants/harvestConfig'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TableRowActions } from '@/components/ui/TableRowActions'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import { getWeightBadge } from '@/lib/harvestCalculations'
import { formatDateID } from '@/lib/dateUtils'
import {
  formatNumber,
  formatPercent,
  formatWeightG,
  formatWeightKg,
} from '@/lib/formatters'
import { Wheat } from 'lucide-react'

export interface HarvestHistoryTableProps {
  harvests: HarvestEntry[]
  onView: (entry: HarvestEntry) => void
  onEdit: (entry: HarvestEntry) => void
  onDelete: (entry: HarvestEntry) => void
  /** Mode lihat-saja: tombol edit/hapus disembunyikan. */
  readOnly?: boolean
}

export function HarvestHistoryTable({
  harvests,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
}: HarvestHistoryTableProps) {
  const columns: Array<DataTableColumn<HarvestEntry>> = [
    {
      key: 'date',
      header: 'Tanggal',
      sticky: true,
      sortValue: (row) => row.date,
      render: (row) => (
        <span className="font-mono text-sm tabular-nums">{formatDateID(row.date)}</span>
      ),
    },
    {
      key: 'tandon',
      header: 'Tandon',
      sortValue: (row) => row.tandonId,
      render: (row) => (
        <span className="flex items-center gap-2">
          <TandonColorDot tandonId={row.tandonId} />
          <span>{TANDON_CONFIG[row.tandonId as TandonId].name}</span>
        </span>
      ),
    },
    {
      key: 'totalWeightKg',
      header: 'Berat',
      align: 'right',
      sortValue: (row) => row.totalWeightKg,
      render: (row) => (
        <span className="font-mono tabular-nums">{formatWeightKg(row.totalWeightKg)}</span>
      ),
    },
    {
      key: 'totalPlants',
      header: 'Tanaman',
      align: 'right',
      sortValue: (row) => row.totalPlants,
      render: (row) => (
        <span className="font-mono tabular-nums">{formatNumber(row.totalPlants)}</span>
      ),
    },
    {
      key: 'rejected',
      header: 'Afkir',
      align: 'right',
      sortValue: (row) => row.rejected,
      render: (row) => (
        <span className="font-mono tabular-nums">{formatNumber(row.rejected)}</span>
      ),
    },
    {
      key: 'avgWeightG',
      header: 'Rata-rata',
      align: 'right',
      sortValue: (row) => row.avgWeightG,
      render: (row) => {
        const badge = getWeightBadge(row.avgWeightG)
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="font-mono tabular-nums">{formatWeightG(row.avgWeightG)}</span>
            <Badge variant={badge.tone} qualitative={badge.label} size="sm" />
          </div>
        )
      },
    },
    {
      key: 'successRate',
      header: 'Success Rate',
      align: 'right',
      sortValue: (row) => row.successRate,
      render: (row) => (
        <span className="font-mono tabular-nums">{formatPercent(row.successRate)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <TableRowActions>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Lihat detail panen ${formatDateID(row.date)}`}
            onClick={() => onView(row)}
          >
            <Eye className="h-4 w-4" aria-hidden />
          </Button>
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Edit panen ${formatDateID(row.date)}`}
                onClick={() => onEdit(row)}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Hapus panen ${formatDateID(row.date)}`}
                onClick={() => onDelete(row)}
              >
                <Trash2 className="h-4 w-4 text-[var(--status-danger)]" aria-hidden />
              </Button>
            </>
          )}
        </TableRowActions>
      ),
    },
  ]

  return (
    <DataTable
      data={harvests}
      columns={columns}
      getRowKey={(row) => row.id}
      initialSortKey="date"
      initialSortDirection="desc"
      emptyIcon={Wheat}
      emptyTitle="Belum ada data panen"
      emptySubtitle="Klik tombol Input Data Panen untuk mencatat hasil panen pertama."
      ariaLabel="Tabel riwayat panen"
    />
  )
}

export function renderRejectionSummary(entry: HarvestEntry): string {
  const parts = HARVEST_REJECTION_REASONS.filter(
    (r) => entry.reasons[r.key] > 0,
  ).map((r) => `${r.label}: ${entry.reasons[r.key]}`)
  return parts.length > 0 ? parts.join(', ') : 'Tidak ada afkir'
}
