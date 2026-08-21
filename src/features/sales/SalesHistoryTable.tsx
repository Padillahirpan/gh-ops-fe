import { Eye, Pencil, Trash2, ShoppingCart } from 'lucide-react'
import type { SaleEntry } from '@/types/sale'
import {
  BUYER_CATEGORIES,
  PAYMENT_STATUS,
} from '@/constants/salesConfig'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TableRowActions } from '@/components/ui/TableRowActions'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import { formatDateID } from '@/lib/dateUtils'
import { formatCurrencyRp, formatWeightKg } from '@/lib/formatters'

export interface SalesHistoryTableProps {
  sales: SaleEntry[]
  harvestDates: Record<string, string>
  onView: (entry: SaleEntry) => void
  onEdit: (entry: SaleEntry) => void
  onDelete: (entry: SaleEntry) => void
}

export function SalesHistoryTable({
  sales,
  harvestDates,
  onView,
  onEdit,
  onDelete,
}: SalesHistoryTableProps) {
  const columns: Array<DataTableColumn<SaleEntry>> = [
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
      key: 'batch',
      header: 'Batch Panen',
      sortValue: (row) => harvestDates[row.harvestId] ?? '',
      render: (row) => (
        <span className="flex items-center gap-2">
          <TandonColorDot tandonId={row.tandonId} />
          <span className="font-mono text-sm tabular-nums">
            {row.tandonId} · {formatDateID(harvestDates[row.harvestId] ?? row.date)}
          </span>
        </span>
      ),
    },
    {
      key: 'buyer',
      header: 'Pembeli',
      sortValue: (row) => row.buyerName,
      render: (row) => {
        const category = BUYER_CATEGORIES.find((c) => c.key === row.buyerCategory)
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-[var(--text-primary)]">{row.buyerName}</span>
            <span className="text-xs text-[var(--text-muted)]">
              {category?.icon} {category?.shortLabel}
            </span>
          </div>
        )
      },
    },
    {
      key: 'soldVolumeKg',
      header: 'Volume',
      align: 'right',
      sortValue: (row) => row.soldVolumeKg,
      render: (row) => (
        <span className="font-mono tabular-nums">{formatWeightKg(row.soldVolumeKg)}</span>
      ),
    },
    {
      key: 'pricePerKg',
      header: 'Harga/kg',
      align: 'right',
      sortValue: (row) => row.pricePerKg,
      render: (row) => (
        <span className="font-mono tabular-nums">{formatCurrencyRp(row.pricePerKg)}</span>
      ),
    },
    {
      key: 'totalValue',
      header: 'Total',
      align: 'right',
      sortValue: (row) => row.totalValue,
      render: (row) => (
        <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
          {formatCurrencyRp(row.totalValue)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Status Bayar',
      sortValue: (row) => row.paymentStatus,
      render: (row) => {
        const status = PAYMENT_STATUS.find((p) => p.key === row.paymentStatus)
        return (
          <Badge variant={status?.tone ?? 'neutral'} qualitative={status?.label ?? row.paymentStatus} size="sm" />
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
            aria-label={`Lihat detail penjualan ke ${row.buyerName}`}
            onClick={() => onView(row)}
          >
            <Eye className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit penjualan ke ${row.buyerName}`}
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Hapus penjualan ke ${row.buyerName}`}
            onClick={() => onDelete(row)}
          >
            <Trash2 className="h-4 w-4 text-[var(--status-danger)]" aria-hidden />
          </Button>
        </TableRowActions>
      ),
    },
  ]

  return (
    <DataTable
      data={sales}
      columns={columns}
      getRowKey={(row) => row.id}
      initialSortKey="date"
      initialSortDirection="desc"
      emptyIcon={ShoppingCart}
      emptyTitle="Belum ada data penjualan"
      emptySubtitle="Catat transaksi pertama Anda lewat tab Form Input."
      ariaLabel="Tabel riwayat penjualan"
    />
  )
}
