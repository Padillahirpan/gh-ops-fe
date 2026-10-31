import { Pencil, Trash2 } from 'lucide-react'
import type { CostEntryView } from '@/types/cost'
import { costCategoryMeta, costTypeMeta } from '@/constants/costConfig'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import { formatDateID } from '@/lib/dateUtils'
import { formatCurrencyRp } from '@/lib/formatters'

export interface CostDetailModalProps {
  entry: CostEntryView | null
  batchCode?: string | undefined
  onClose: () => void
  onEdit: (entry: CostEntryView) => void
  onDelete: (entry: CostEntryView) => void
  /** Mode lihat-saja: tombol edit/hapus disembunyikan. */
  readOnly?: boolean
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] py-2.5 last:border-b-0">
      <dt className="shrink-0 text-sm text-[var(--text-muted)]">{label}</dt>
      <dd className="text-right text-sm text-[var(--text-primary)]">{children}</dd>
    </div>
  )
}

export function CostDetailModal({ entry, batchCode, onClose, onEdit, onDelete, readOnly = false }: CostDetailModalProps) {
  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title="Detail Biaya"
      size="md"
      footer={
        entry && !readOnly ? (
          <>
            <Button
              variant="secondary"
              leftIcon={<Pencil className="h-4 w-4" aria-hidden />}
              onClick={() => onEdit(entry)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
              onClick={() => onDelete(entry)}
            >
              Hapus
            </Button>
          </>
        ) : undefined
      }
    >
      {entry && (
        <dl>
          <Row label="Tanggal">{formatDateID(entry.date)}</Row>
          <Row label="Tipe">
            <Badge
              variant={costTypeMeta(entry.type)?.tone ?? 'neutral'}
              qualitative={costTypeMeta(entry.type)?.label ?? entry.type}
              size="sm"
            />
          </Row>
          <Row label="Kategori">
            {costCategoryMeta(entry.category)?.icon}{' '}
            {costCategoryMeta(entry.category)?.label ?? entry.category}
          </Row>
          <Row label="Deskripsi">{entry.description}</Row>
          <Row label="Untuk">
            {entry.target === 'UMUM' ? (
              <Badge variant="info" qualitative="Umum (dibagi rata 3 tandon)" size="sm" />
            ) : (
              <span className="flex items-center justify-end gap-2">
                <TandonColorDot tandonId={entry.target} />
                {entry.target}
              </span>
            )}
          </Row>
          <Row label="Nominal">
            <span className="font-mono font-semibold tabular-nums">
              {formatCurrencyRp(entry.amount)}
            </span>
          </Row>
          {entry.quantity != null && entry.unitPrice != null && (
            <Row label="Jumlah × Harga Satuan">
              <span className="font-mono tabular-nums">
                {entry.quantity} × {formatCurrencyRp(entry.unitPrice)}
              </span>
            </Row>
          )}
          {entry.type === 'modal' && (
            <Row label="Penyebaran Siklus">
              {entry.spreadCycles === 1
                ? 'Beban penuh ke siklus ini'
                : `Disebar ${entry.spreadCycles} siklus (± ${formatCurrencyRp(Math.round(entry.amount / entry.spreadCycles))}/siklus)`}
            </Row>
          )}
          {entry.supplier && <Row label="Supplier">{entry.supplier}</Row>}
          <Row label="Batch">
            {entry.target === 'UMUM' ? (
              <span className="text-[var(--text-muted)]">Dibagi ke 3 tandon otomatis</span>
            ) : entry.assignedCycleId ? (
              <span className="font-mono tabular-nums">
                {batchCode ?? entry.assignedCycleId.slice(0, 8)}
                {entry.cycleId ? ' (manual)' : ' (otomatis)'}
              </span>
            ) : (
              <Badge variant="warning" qualitative="Di luar siklus aktif" size="sm" />
            )}
          </Row>
          {entry.notes && <Row label="Catatan">{entry.notes}</Row>}
        </dl>
      )}
    </Modal>
  )
}
