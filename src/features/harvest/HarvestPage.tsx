import { useMemo, useState } from 'react'
import type { HarvestEntry } from '@/types/harvest'
import type { TandonId } from '@/types/tandon'
import { TANDON_IDS } from '@/constants/tandonConfig'
import { useHarvestStore } from '@/store/useHarvestStore'
import { useSaleStore } from '@/store/useSaleStore'
import { toast } from '@/store/useToastStore'
import { HarvestForm } from './HarvestForm'
import { HarvestHistoryTable } from './HarvestHistoryTable'
import { HarvestDetailModal } from './HarvestDetailModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'

type HarvestTab = 'form' | 'riwayat'

export function HarvestPage() {
  const harvests = useHarvestStore((s) => s.harvests)
  const addHarvest = useHarvestStore((s) => s.addHarvest)
  const updateHarvest = useHarvestStore((s) => s.updateHarvest)
  const deleteHarvest = useHarvestStore((s) => s.deleteHarvest)
  const sales = useSaleStore((s) => s.sales)

  const [tab, setTab] = useState<HarvestTab>('form')
  const [editEntry, setEditEntry] = useState<HarvestEntry | null>(null)
  const [viewEntry, setViewEntry] = useState<HarvestEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HarvestEntry | null>(null)
  const [filterTandon, setFilterTandon] = useState<string>('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const filteredHarvests = useMemo(() => {
    return harvests.filter((h) => {
      if (filterTandon && h.tandonId !== filterTandon) return false
      if (filterFrom && h.date < filterFrom) return false
      if (filterTo && h.date > filterTo) return false
      return true
    })
  }, [harvests, filterTandon, filterFrom, filterTo])

  function handleSubmit(draft: Parameters<typeof addHarvest>[0]) {
    if (editEntry) {
      updateHarvest(editEntry.id, draft)
      toast.success('Data panen diperbarui')
      setEditEntry(null)
    } else {
      addHarvest(draft)
      toast.success(
        'Data panen tersimpan',
        'Status tandon otomatis diubah menjadi Sanitasi',
      )
    }
    setTab('riwayat')
  }

  function handleDelete() {
    if (!deleteTarget) return
    const relatedSales = sales.filter((s) => s.harvestId === deleteTarget.id).length
    deleteHarvest(deleteTarget.id)
    toast.success(
      'Data panen dihapus',
      relatedSales > 0
        ? `${relatedSales} entri penjualan terkait tetap tersimpan (batch menjadi tidak valid)`
        : undefined,
    )
    setDeleteTarget(null)
    setViewEntry(null)
  }

  return (
    <div className="space-y-6">
      <div
        className="flex gap-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1"
        role="tablist"
        aria-label="Tab panen"
      >
        {(
          [
            { key: 'form', label: 'Form Input' },
            { key: 'riwayat', label: `Riwayat Panen (${harvests.length})` },
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
        <div role="tabpanel" aria-label="Form input panen">
          <HarvestForm
            key={editEntry?.id ?? 'new'}
            editEntry={editEntry}
            onSubmit={handleSubmit}
          />
        </div>
      ) : (
        <div role="tabpanel" aria-label="Riwayat panen" className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:grid-cols-3">
            <Select
              label="Filter Tandon"
              value={filterTandon}
              placeholder="Semua tandon"
              onChange={(e) => setFilterTandon(e.target.value)}
              options={[
                { value: '', label: 'Semua tandon' },
                ...TANDON_IDS.map((id: TandonId) => ({ value: id, label: id })),
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

          <HarvestHistoryTable
            harvests={filteredHarvests}
            onView={setViewEntry}
            onEdit={(entry) => {
              setEditEntry(entry)
              setTab('form')
            }}
            onDelete={setDeleteTarget}
          />
        </div>
      )}

      <HarvestDetailModal
        entry={viewEntry}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Data Panen"
        body={`Data panen ini akan dihapus permanensi dan tidak bisa dikembalikan. Lanjutkan?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
