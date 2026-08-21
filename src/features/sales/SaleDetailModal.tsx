import { Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import type { SaleEntry } from '@/types/sale'
import { TANDON_CONFIG } from '@/constants/tandonConfig'
import {
  BUYER_CATEGORIES,
  PAYMENT_STATUS,
  UNSOLD_ACTIONS,
} from '@/constants/salesConfig'
import { formatDateFullID, formatDateID } from '@/lib/dateUtils'
import {
  formatCurrencyRp,
  formatWeightKg,
} from '@/lib/formatters'

export interface SaleDetailModalProps {
  entry: SaleEntry | null
  harvestDate?: string | undefined
  onClose: () => void
  onEdit: (entry: SaleEntry) => void
  onDelete: (entry: SaleEntry) => void
}

export function SaleDetailModal({
  entry,
  harvestDate,
  onClose,
  onEdit,
  onDelete,
}: SaleDetailModalProps) {
  if (!entry) return null

  const category = BUYER_CATEGORIES.find((c) => c.key === entry.buyerCategory)
  const payment = PAYMENT_STATUS.find((p) => p.key === entry.paymentStatus)
  const unsold = UNSOLD_ACTIONS.find((a) => a.key === entry.unsoldAction)
  const cfg = TANDON_CONFIG[entry.tandonId]

  return (
    <Modal
      open
      onClose={onClose}
      title="Detail Penjualan"
      footer={
        <>
          <Button
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
            onClick={() => onDelete(entry)}
          >
            Hapus
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Pencil className="h-4 w-4" aria-hidden />}
            onClick={() => onEdit(entry)}
          >
            Edit
          </Button>
        </>
      }
    >
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Tanggal Transaksi</dt>
          <dd className="font-medium text-[var(--text-primary)]">
            {formatDateFullID(entry.date)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Batch Panen</dt>
          <dd className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
            <TandonColorDot tandonId={entry.tandonId} />
            {cfg.name}
            {harvestDate && (
              <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
                ({formatDateFullID(harvestDate).split(',')[1]?.trim() ?? harvestDate})
              </span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Pembeli</dt>
          <dd className="text-right">
            <span className="block font-medium text-[var(--text-primary)]">
              {entry.buyerName}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {category?.icon} {category?.label}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Volume Terjual</dt>
          <dd className="font-mono tabular-nums text-[var(--text-primary)]">
            {formatWeightKg(entry.soldVolumeKg)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Harga per Kg</dt>
          <dd className="font-mono tabular-nums text-[var(--text-primary)]">
            {formatCurrencyRp(entry.pricePerKg)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Total Nilai</dt>
          <dd className="font-mono text-base font-bold tabular-nums text-[var(--text-primary)]">
            {formatCurrencyRp(entry.totalValue)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Status Pembayaran</dt>
          <dd>
            <Badge
              variant={payment?.tone ?? 'neutral'}
              qualitative={payment?.label ?? entry.paymentStatus}
              size="sm"
            />
          </dd>
        </div>
        {unsold && (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-muted)]">Aksi Sisa</dt>
            <dd className="text-[var(--text-primary)]">{unsold.label}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Revenue per Lubang</dt>
          <dd className="font-mono tabular-nums text-[var(--text-secondary)]">
            {formatCurrencyRp(Math.round(entry.totalValue / 1000))}
            <span className="ml-1 text-xs text-[var(--text-muted)]">/lubang</span>
          </dd>
        </div>
      </dl>

      {entry.notes && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Catatan
          </p>
          <p className="rounded-md bg-[var(--bg-surface-hover)] p-3 text-sm text-[var(--text-secondary)]">
            {entry.notes}
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-[var(--text-muted)]">
        Dibuat: <span className="font-mono">{formatDateID(entry.createdAt)}</span>
      </p>
    </Modal>
  )
}
