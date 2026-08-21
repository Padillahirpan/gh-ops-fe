import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import type { HarvestEntry } from '@/types/harvest'
import { TANDON_CONFIG } from '@/constants/tandonConfig'
import { HARVEST_REJECTION_REASONS } from '@/constants/harvestConfig'
import { getWeightBadge } from '@/lib/harvestCalculations'
import { formatDateFullID } from '@/lib/dateUtils'
import {
  formatNumber,
  formatPercent,
  formatWeightG,
  formatWeightKg,
  formatCurrencyRp,
} from '@/lib/formatters'
import { Pencil, Trash2 } from 'lucide-react'

export interface HarvestDetailModalProps {
  entry: HarvestEntry | null
  onClose: () => void
  onEdit: (entry: HarvestEntry) => void
  onDelete: (entry: HarvestEntry) => void
}

export function HarvestDetailModal({
  entry,
  onClose,
  onEdit,
  onDelete,
}: HarvestDetailModalProps) {
  if (!entry) return null
  const badge = getWeightBadge(entry.avgWeightG)
  const cfg = TANDON_CONFIG[entry.tandonId]
  const activeReasons = HARVEST_REJECTION_REASONS.filter(
    (r) => entry.reasons[r.key] > 0,
  )

  return (
    <Modal
      open
      onClose={onClose}
      title={`Detail Panen · ${cfg.name}`}
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
          <dt className="text-[var(--text-muted)]">Tanggal</dt>
          <dd className="font-medium text-[var(--text-primary)]">
            {formatDateFullID(entry.date)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Tandon</dt>
          <dd className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
            <TandonColorDot tandonId={entry.tandonId} />
            {cfg.name} · {cfg.greenhouse}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Total Berat</dt>
          <dd className="font-mono tabular-nums font-semibold text-[var(--text-primary)]">
            {formatWeightKg(entry.totalWeightKg)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Tanaman Dipanen</dt>
          <dd className="font-mono tabular-nums text-[var(--text-primary)]">
            {formatNumber(entry.totalPlants)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Jumlah Afkir</dt>
          <dd className="font-mono tabular-nums text-[var(--text-primary)]">
            {formatNumber(entry.rejected)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Rata-rata Berat</dt>
          <dd className="flex items-center gap-2">
            <span className="font-mono tabular-nums font-semibold text-[var(--text-primary)]">
              {formatWeightG(entry.avgWeightG)}
            </span>
            <Badge
              variant={badge.tone}
              quantitative={badge.thresholdText}
              qualitative={badge.label}
              size="sm"
            />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Success Rate</dt>
          <dd className="font-mono tabular-nums font-semibold text-[var(--text-success)]">
            {formatPercent(entry.successRate)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--text-muted)]">Estimasi Nilai @ Rp25.000/kg</dt>
          <dd className="font-mono tabular-nums text-[var(--text-secondary)]">
            {formatCurrencyRp(Math.round(entry.totalWeightKg * 25000))}
          </dd>
        </div>
      </dl>

      {activeReasons.length > 0 && (
        <div className="mt-4 rounded-md border border-[var(--border-default)] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Rincian Alasan Afkir
          </p>
          <ul className="space-y-1 text-sm">
            {activeReasons.map((r) => (
              <li key={r.key} className="flex justify-between">
                <span className="text-[var(--text-secondary)]">{r.label}</span>
                <span className="font-mono tabular-nums font-medium text-[var(--text-primary)]">
                  {entry.reasons[r.key]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
    </Modal>
  )
}
