import { useEffect, useMemo, useState } from 'react'
import type {
  BatchCostSummary,
  CostEntryView,
  CycleBatch,
  UnassignedCostItem,
} from '@/types/cost'
import { COST_CATEGORIES, COST_TARGETS, COST_TYPES } from '@/constants/costConfig'
import { useCostStore } from '@/store/useCostStore'
import type { CostDraft } from '@/store/useCostStore'
import { toast } from '@/store/useToastStore'
import { getApiErrorMessage, USE_API } from '@/api/client'
import { seladaApi } from '@/api/seladaOpsApi'
import { CostForm } from './CostForm'
import { CostHistoryTable } from './CostHistoryTable'
import { CostDetailModal } from './CostDetailModal'
import { CostingOverviewPanel } from './CostingOverviewPanel'
import { CostingBatchModal } from './CostingBatchModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { formatCurrencyRp } from '@/lib/formatters'

type CostTab = 'form' | 'riwayat' | 'rekap'

export function CostPage() {
  const costs = useCostStore((s) => s.costs)
  const addCost = useCostStore((s) => s.addCost)
  const updateCost = useCostStore((s) => s.updateCost)
  const deleteCost = useCostStore((s) => s.deleteCost)

  const [tab, setTab] = useState<CostTab>('form')
  const [editEntry, setEditEntry] = useState<CostEntryView | null>(null)
  const [viewEntry, setViewEntry] = useState<CostEntryView | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CostEntryView | null>(null)
  const [viewBatch, setViewBatch] = useState<BatchCostSummary | null>(null)
  const [filterTarget, setFilterTarget] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const [cycles, setCycles] = useState<CycleBatch[]>([])

  useEffect(() => {
    if (!USE_API) return
    seladaApi
      .listCycles()
      .then(setCycles)
      .catch(() => setCycles([]))
  }, [costs.length])

  const batchCodes = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of cycles) map[c.id] = c.batchCode
    return map
  }, [cycles])

  const filteredCosts = useMemo(() => {
    return costs.filter((c) => {
      if (filterTarget && c.target !== filterTarget) return false
      if (filterType && c.type !== filterType) return false
      if (filterCategory && c.category !== filterCategory) return false
      if (filterFrom && c.date < filterFrom) return false
      if (filterTo && c.date > filterTo) return false
      return true
    })
  }, [costs, filterTarget, filterType, filterCategory, filterFrom, filterTo])

  const totalFiltered = useMemo(
    () => ({
      total: filteredCosts.reduce((sum, c) => sum + c.amount, 0),
      ops: filteredCosts
        .filter((c) => c.type === 'operasional')
        .reduce((sum, c) => sum + c.amount, 0),
      modal: filteredCosts
        .filter((c) => c.type === 'modal')
        .reduce((sum, c) => sum + c.amount, 0),
    }),
    [filteredCosts],
  )

  async function handleSubmit(draft: CostDraft) {
    try {
      if (editEntry) {
        await updateCost(editEntry.id, draft)
        toast.success('Data biaya diperbarui')
        setEditEntry(null)
      } else {
        await addCost(draft)
        toast.success('Data biaya tersimpan')
      }
      setTab('riwayat')
    } catch (error) {
      toast.error('Gagal menyimpan biaya', getApiErrorMessage(error))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCost(deleteTarget.id)
      toast.success('Data biaya dihapus')
      setDeleteTarget(null)
      setViewEntry(null)
    } catch (error) {
      toast.error('Gagal menghapus biaya', getApiErrorMessage(error))
    }
  }

  function handleMoveUnassigned(item: UnassignedCostItem) {
    const entry = costs.find((c) => c.id === item.costId)
    if (!entry) {
      toast.error('Entri biaya tidak ditemukan', 'Data mungkin sudah dihapus.')
      return
    }
    setEditEntry(entry)
    setTab('form')
    toast.info(
      'Pindahkan ke batch tertentu',
      'Pilih batch panen di kolom "Batch Panen (Pindah Manual)".',
    )
  }

  return (
    <div className="space-y-6">
      <div
        className="flex gap-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1"
        role="tablist"
        aria-label="Tab biaya"
      >
        {(
          [
            { key: 'form', label: 'Form Input' },
            { key: 'riwayat', label: `Riwayat Biaya (${costs.length})` },
            { key: 'rekap', label: 'Rekap per Batch' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => {
              setTab(t.key)
              if (t.key === 'form') setEditEntry(null)
            }}
            className={[
              'h-11 flex-1 rounded px-4 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'form' ? (
        <div role="tabpanel" aria-label="Form input biaya">
          <CostForm
            key={editEntry?.id ?? 'new'}
            editEntry={editEntry}
            cycles={cycles}
            onSubmit={handleSubmit}
          />
        </div>
      ) : tab === 'riwayat' ? (
        <div role="tabpanel" aria-label="Riwayat biaya" className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:grid-cols-2 xl:grid-cols-5">
            <Select
              label="Untuk"
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value)}
              options={[
                { value: '', label: 'Semua target' },
                ...COST_TARGETS.map((t) => ({ value: t.key, label: t.shortLabel })),
              ]}
            />
            <Select
              label="Tipe"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'Semua tipe' },
                ...COST_TYPES.map((t) => ({ value: t.key, label: t.label })),
              ]}
            />
            <Select
              label="Kategori"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: '', label: 'Semua kategori' },
                ...COST_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
              ]}
            />
            <DatePicker
              label="Dari Tanggal"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
            <DatePicker
              label="Sampai Tanggal"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>

          {filteredCosts.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3"
              style={{
                borderColor: 'var(--status-neutral)',
                backgroundColor: 'color-mix(in srgb, var(--status-neutral) 8%, transparent)',
              }}
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Total biaya ({filteredCosts.length} entri terfilter)
              </p>
              <p className="font-mono text-sm tabular-nums text-[var(--text-secondary)]">
                Ops {formatCurrencyRp(totalFiltered.ops)} · Modal{' '}
                {formatCurrencyRp(totalFiltered.modal)}
              </p>
              <p className="font-mono text-lg font-bold tabular-nums text-[var(--text-primary)]">
                {formatCurrencyRp(totalFiltered.total)}
              </p>
            </div>
          )}

          <CostHistoryTable
            costs={filteredCosts}
            batchCodes={batchCodes}
            onView={setViewEntry}
            onEdit={(entry) => {
              setEditEntry(entry)
              setTab('form')
            }}
            onDelete={setDeleteTarget}
          />
        </div>
      ) : (
        <div role="tabpanel" aria-label="Rekap biaya per batch">
          <CostingOverviewPanel onViewBatch={setViewBatch} onMoveUnassigned={handleMoveUnassigned} />
        </div>
      )}

      <CostDetailModal
        entry={viewEntry}
        batchCode={viewEntry ? (batchCodes[viewEntry.assignedCycleId ?? ''] ?? undefined) : undefined}
        onClose={() => setViewEntry(null)}
        onEdit={(entry) => {
          setViewEntry(null)
          setEditEntry(entry)
          setTab('form')
        }}
        onDelete={(entry) => {
          setViewEntry(null)
          setDeleteTarget(entry)
        }}
      />

      <CostingBatchModal batch={viewBatch} onClose={() => setViewBatch(null)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Data Biaya"
        body="Data biaya ini akan dihapus permanen dan tidak bisa dikembalikan. Lanjutkan?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
