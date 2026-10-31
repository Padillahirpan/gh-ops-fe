import { useMemo, useState, useId } from 'react'
import { Plus } from 'lucide-react'
import type { SaleEntry } from '@/types/sale'
import type { TandonId } from '@/types/tandon'
import { TANDON_IDS } from '@/constants/tandonConfig'
import { BUYER_CATEGORIES, PAYMENT_STATUS } from '@/constants/salesConfig'
import { useSaleStore } from '@/store/useSaleStore'
import { useHarvestStore } from '@/store/useHarvestStore'
import { toast } from '@/store/useToastStore'
import { getApiErrorMessage } from '@/api/client'
import { useAuthSession } from '@/features/auth/useAuth'
import { ReadOnlyBanner } from '@/features/auth/ReadOnlyBanner'
import { SaleForm } from './SaleForm'
import { SalesHistoryTable } from './SalesHistoryTable'
import { SaleDetailModal } from './SaleDetailModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { formatCurrencyRp } from '@/lib/formatters'

export function SalesPage() {
  const sales = useSaleStore((s) => s.sales)
  const addSale = useSaleStore((s) => s.addSale)
  const updateSale = useSaleStore((s) => s.updateSale)
  const deleteSale = useSaleStore((s) => s.deleteSale)
  const harvests = useHarvestStore((s) => s.harvests)
  const canEdit = useAuthSession().canEdit

  const formId = useId()
  const [formOpen, setFormOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<SaleEntry | null>(null)
  const [viewEntry, setViewEntry] = useState<SaleEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SaleEntry | null>(null)
  const [filterTandon, setFilterTandon] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const harvestDates = useMemo(() => {
    const map: Record<string, string> = {}
    for (const h of harvests) map[h.id] = h.date
    return map
  }, [harvests])

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (filterTandon && s.tandonId !== filterTandon) return false
      if (filterCategory && s.buyerCategory !== filterCategory) return false
      if (filterStatus && s.paymentStatus !== filterStatus) return false
      if (filterFrom && s.date < filterFrom) return false
      if (filterTo && s.date > filterTo) return false
      return true
    })
  }, [sales, filterTandon, filterCategory, filterStatus, filterFrom, filterTo])

  const totalPageValue = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.totalValue, 0),
    [filteredSales],
  )

  function closeForm() {
    setFormOpen(false)
    setEditEntry(null)
  }

  function openCreateForm() {
    setEditEntry(null)
    setFormOpen(true)
  }

  function openEditForm(entry: SaleEntry) {
    setEditEntry(entry)
    setFormOpen(true)
  }

  async function handleSubmit(draft: Parameters<typeof addSale>[0]) {
    try {
      if (editEntry) {
        await updateSale(editEntry.id, draft)
        toast.success('Data penjualan diperbarui')
      } else {
        await addSale(draft)
        toast.success('Data penjualan tersimpan')
      }
      closeForm()
    } catch (error) {
      toast.error('Gagal menyimpan penjualan', getApiErrorMessage(error))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteSale(deleteTarget.id)
      toast.success('Data penjualan dihapus')
      setDeleteTarget(null)
      setViewEntry(null)
    } catch (error) {
      toast.error('Gagal menghapus penjualan', getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      {!canEdit && <ReadOnlyBanner />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
          Riwayat Penjualan · <span className="font-mono tabular-nums">{sales.length}</span> transaksi
        </h2>
        {canEdit && (
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" aria-hidden />}
            onClick={openCreateForm}
          >
            Input Data Penjualan
          </Button>
        )}
      </div>

      <div className="grid gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:grid-cols-2 xl:grid-cols-5">
        <Select
          label="Tandon"
          value={filterTandon}
          onChange={(e) => setFilterTandon(e.target.value)}
          options={[
            { value: '', label: 'Semua tandon' },
            ...TANDON_IDS.map((id: TandonId) => ({ value: id, label: id })),
          ]}
        />
        <Select
          label="Kategori Pembeli"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={[
            { value: '', label: 'Semua kategori' },
            ...BUYER_CATEGORIES.map((c) => ({ value: c.key, label: c.shortLabel })),
          ]}
        />
        <Select
          label="Status Bayar"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: '', label: 'Semua status' },
            ...PAYMENT_STATUS.map((p) => ({ value: p.key, label: p.shortLabel ?? p.label })),
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

      {filteredSales.length > 0 && (
        <div
          className="flex items-center justify-between rounded-lg border px-4 py-3"
          style={{
            borderColor: 'var(--status-success)',
            backgroundColor: 'color-mix(in srgb, var(--status-success) 8%, transparent)',
          }}
        >
          <p className="text-sm text-[var(--text-secondary)]">
            Total omzet ({filteredSales.length} transaksi terfilter)
          </p>
          <p className="font-mono text-lg font-bold tabular-nums text-[var(--status-success)]">
            {formatCurrencyRp(totalPageValue)}
          </p>
        </div>
      )}

      <SalesHistoryTable
        sales={filteredSales}
        harvestDates={harvestDates}
        readOnly={!canEdit}
        onView={setViewEntry}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
      />

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editEntry ? 'Edit Data Penjualan' : 'Input Data Penjualan'}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Batal
            </Button>
            <Button type="submit" form={formId} variant="primary">
              {editEntry ? 'Perbarui Data Penjualan' : 'Simpan Data Penjualan'}
            </Button>
          </>
        }
      >
        <SaleForm
          key={editEntry?.id ?? 'new'}
          formId={formId}
          editEntry={editEntry}
          onSubmit={handleSubmit}
        />
      </Modal>

      <SaleDetailModal
        entry={viewEntry}
        readOnly={!canEdit}
        harvestDate={viewEntry ? harvestDates[viewEntry.harvestId] : undefined}
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
        title="Hapus Data Penjualan"
        body="Data penjualan ini akan dihapus permanen dan tidak bisa dikembalikan. Lanjutkan?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
