import { Eye, Pencil, Trash2, AlertTriangle, Wallet } from 'lucide-react'
import type { CostEntryView } from '@/types/cost'
import { costCategoryMeta, costTypeMeta } from '@/constants/costConfig'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TableRowActions } from '@/components/ui/TableRowActions'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import { formatDateID } from '@/lib/dateUtils'
import { formatCurrencyRp } from '@/lib/formatters'

export interface CostHistoryTableProps {
  costs: CostEntryView[]
  batchCodes: Record<string, string>
  onView: (entry: CostEntryView) => void
  onEdit: (entry: CostEntryView) => void
  onDelete: (entry: CostEntryView) => void
  /** Mode lihat-saja: tombol edit/hapus disembunyikan. */
  readOnly?: boolean
}

export function CostHistoryTable({
  costs,
  batchCodes,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
}: CostHistoryTableProps) {
  const columns: Array<DataTableColumn<CostEntryView>> = [
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
      key: 'target',
      header: 'Untuk',
      sortValue: (row) => row.target,
      render: (row) =>
        row.target === 'UMUM' ? (
          <Badge variant="info" qualitative="Umum" size="sm" />
        ) : (
          <span className="flex items-center gap-2">
            <TandonColorDot tandonId={row.target} />
            <span className="font-mono text-sm">{row.target}</span>
          </span>
        ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortValue: (row) => row.category,
      render: (row) => {
        const meta = costCategoryMeta(row.category)
        return (
          <span className="text-sm">
            {meta?.icon} {meta?.shortLabel ?? row.category}
          </span>
        )
      },
    },
    {
      key: 'description',
      header: 'Deskripsi',
      sortValue: (row) => row.description,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-[var(--text-primary)]">{row.description}</span>
          {row.supplier && (
            <span className="text-xs text-[var(--text-muted)]">via {row.supplier}</span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipe',
      sortValue: (row) => row.type,
      render: (row) => {
        const meta = costTypeMeta(row.type)
        return (
          <Badge
            variant={meta?.tone ?? 'neutral'}
            qualitative={meta?.shortLabel ?? row.type}
            size="sm"
          />
        )
      },
    },
    {
      key: 'amount',
      header: 'Nominal',
      align: 'right',
      sortValue: (row) => row.amount,
      render: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrencyRp(row.amount)}
          </span>
          {row.quantity != null && row.unitPrice != null && (
            <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
              {row.quantity} × {formatCurrencyRp(row.unitPrice)}
            </span>
          )}
          {row.type === 'modal' && row.spreadCycles > 1 && (
            <span className="text-xs text-[var(--text-muted)]">sebar {row.spreadCycles} siklus</span>
          )}
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      sortValue: (row) => batchCodes[row.assignedCycleId ?? ''] ?? '',
      render: (row) => {
        if (row.target === 'UMUM') {
          return <span className="text-xs text-[var(--text-muted)]">dibagi 3 tandon</span>
        }
        if (!row.assignedCycleId) {
          return (
            <Badge
              variant="warning"
              icon={AlertTriangle}
              qualitative="Tak terkelompok"
              size="sm"
            />
          )
        }
        return (
          <span className="font-mono text-xs tabular-nums">
            {batchCodes[row.assignedCycleId] ?? row.assignedCycleId.slice(0, 8)}
            {row.cycleId ? ' (manual)' : ''}
          </span>
        )
      },
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
            aria-label={`Lihat detail biaya ${row.description}`}
            onClick={() => onView(row)}
          >
            <Eye className="h-4 w-4" aria-hidden />
          </Button>
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Edit biaya ${row.description}`}
                onClick={() => onEdit(row)}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Hapus biaya ${row.description}`}
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
      data={costs}
      columns={columns}
      getRowKey={(row) => row.id}
      initialSortKey="date"
      initialSortDirection="desc"
      emptyIcon={Wallet}
      emptyTitle="Belum ada data biaya"
      emptySubtitle="Klik tombol Input Data Biaya untuk mencatat pengeluaran pertama."
      ariaLabel="Tabel riwayat biaya"
    />
  )
}
