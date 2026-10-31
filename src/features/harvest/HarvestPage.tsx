import { useMemo, useState, useId } from 'react'
import { Plus } from 'lucide-react'
import type { HarvestEntry } from '@/types/harvest'
import type { TandonId } from '@/types/tandon'
import { TANDON_IDS } from '@/constants/tandonConfig'
import { useHarvestStore } from '@/store/useHarvestStore'
import { useSaleStore } from '@/store/useSaleStore'
import { toast } from '@/store/useToastStore'
import { USE_API, getApiErrorMessage } from '@/api/client'
import { useAuthSession } from '@/features/auth/useAuth'
import { ReadOnlyBanner } from '@/features/auth/ReadOnlyBanner'
import { HarvestForm } from './HarvestForm'
import { HarvestHistoryTable } from './HarvestHistoryTable'
import { HarvestDetailModal } from './HarvestDetailModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'

export function HarvestPage() {
  const harvests = useHarvestStore((s) => s.harvests)
  const addHarvest = useHarvestStore((s) => s.addHarvest)
  const updateHarvest = useHarvestStore((s) => s.updateHarvest)
  const deleteHarvest = useHarvestStore((s) => s.deleteHarvest)
  const sales = useSaleStore((s) => s.sales)
  const canEdit = useAuthSession().canEdit

  const formId = useId()
  const [formOpen, setFormOpen] = useState(false)
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

  function openCreateForm() {
    setEditEntry(null)
    setFormOpen(true)
  }

  function openEditForm(entry: HarvestEntry) {
    setEditEntry(entry)
    setFormOpen(true)
  }

  async function handleSubmit(draft: Parameters<typeof addHarvest>[0]) {
    try {
      if (editEntry) {
        await updateHarvest(editEntry.id, draft)
        toast.success('Data panen diperbarui')
      } else {
        await addHarvest(draft)
        toast.success(
          'Data panen tersimpan',
          'Status tandon otomatis diubah menjadi Sanitasi',
        )
      }
      setFormOpen(false)
      setEditEntry(null)
    } catch (error) {
      toast.error('Gagal menyimpan panen', getApiErrorMessage(error))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const relatedSalesCount = sales.filter((s) => s.harvestId === deleteTarget.id).length
    try {
      await deleteHarvest(deleteTarget.id)
      toast.success(
        'Data panen dihapus',
        USE_API && relatedSalesCount > 0
          ? `${relatedSalesCount} entri penjualan terkait ikut terhapus`
          : relatedSalesCount > 0
            ? `${relatedSalesCount} entri penjualan terkait tetap tersimpan (batch menjadi tidak valid)`
            : undefined,
      )
      setDeleteTarget(null)
      setViewEntry(null)
    } catch (error) {
      toast.error('Gagal menghapus panen', getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      {!canEdit && <ReadOnlyBanner />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
          Riwayat Panen · <span className="font-mono tabular-nums">{harvests.length}</span> entri
        </h2>
        {canEdit && (
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" aria-hidden />}
            onClick={openCreateForm}
          >
            Input Data Panen
          </Button>
        )}
      </div>

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
        readOnly={!canEdit}
        onView={setViewEntry}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
      />

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditEntry(null)
        }}
        title={editEntry ? 'Edit Data Panen' : 'Input Data Panen'}
        size="xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFormOpen(false)
                setEditEntry(null)
              }}
            >
              Batal
            </Button>
            <Button type="submit" form={formId} variant="primary">
              {editEntry ? 'Perbarui Data Panen' : 'Simpan Data Panen'}
            </Button>
          </>
        }
      >
        <HarvestForm
          key={editEntry?.id ?? 'new'}
          formId={formId}
          editEntry={editEntry}
          onSubmit={handleSubmit}
        />
      </Modal>

      <HarvestDetailModal
        entry={viewEntry}
        readOnly={!canEdit}
        onClose={() => setViewEntry(null)}
        onEdit={(entry) => {
          setViewEntry(null)
          openEditForm(entry)
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
