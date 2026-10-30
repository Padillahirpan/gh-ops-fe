import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import type {
  CostCategory,
  CostEntryView,
  CostTarget,
  CostType,
  CycleBatch,
} from '@/types/cost'
import type { TandonId } from '@/types/tandon'
import { TANDON_CONFIG } from '@/constants/tandonConfig'
import {
  COST_CATEGORIES,
  COST_TARGETS,
  COST_TYPES,
  MODAL_SPREAD_MAX,
  MODAL_SPREAD_PRESETS,
} from '@/constants/costConfig'
import { todayISO, formatDateID } from '@/lib/dateUtils'
import { formatCurrencyRp } from '@/lib/formatters'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import type { CostDraft } from '@/store/useCostStore'

export interface CostFormProps {
  onSubmit: (draft: CostDraft) => void
  editEntry?: CostEntryView | null
  /** Daftar batch panen dari server (API mode) — untuk deteksi & pindah manual. */
  cycles: CycleBatch[]
}

interface FormErrors {
  date?: string
  type?: string
  category?: string
  description?: string
  target?: string
  amount?: string
  quantity?: string
  unitPrice?: string
  spreadCycles?: string
}

/** Siklus tandon yang jendelanya (HSS 0–47) memuat tanggal biaya. */
function detectCycle(cycles: CycleBatch[], tandonId: TandonId, date: string): CycleBatch | null {
  return (
    [...cycles]
      .filter((c) => c.tandonId === tandonId && date >= c.sowingDate && date <= c.cycleEndDate)
      .sort((a, b) => b.sowingDate.localeCompare(a.sowingDate))[0] ?? null
  )
}

export function CostForm({ onSubmit, editEntry, cycles }: CostFormProps) {
  const [date, setDate] = useState(editEntry?.date ?? todayISO())
  const [type, setType] = useState<CostType | ''>(editEntry?.type ?? '')
  const [category, setCategory] = useState<CostCategory | ''>(editEntry?.category ?? '')
  const [description, setDescription] = useState(editEntry?.description ?? '')
  const [target, setTarget] = useState<CostTarget | ''>(editEntry?.target ?? '')
  const [amount, setAmount] = useState(editEntry && !editEntry.quantity ? String(editEntry.amount) : '')
  const [quantity, setQuantity] = useState(editEntry?.quantity ? String(editEntry.quantity) : '')
  const [unitPrice, setUnitPrice] = useState(editEntry?.unitPrice ? String(editEntry.unitPrice) : '')
  const [spreadCycles, setSpreadCycles] = useState(
    editEntry ? String(editEntry.spreadCycles ?? 1) : '1',
  )
  const [supplier, setSupplier] = useState(editEntry?.supplier ?? '')
  const [cycleId, setCycleId] = useState(editEntry?.cycleId ?? '')
  const [notes, setNotes] = useState(editEntry?.notes ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const quantityNum = Number(quantity)
  const unitPriceNum = Number(unitPrice)
  const hasQtyPrice = quantity !== '' && unitPrice !== ''
  const finalAmount = hasQtyPrice
    ? Math.round(quantityNum * unitPriceNum)
    : Number(amount) || 0
  const spread = Number(spreadCycles) || 1
  const isUmum = target === 'UMUM'

  // Ganti target → reset pilihan batch manual yang tidak lagi relevan.
  function handleTargetChange(next: CostTarget | '') {
    setTarget(next)
    setCycleId('')
  }

  const targetCycles = useMemo(
    () =>
      target && target !== 'UMUM'
        ? cycles
            .filter((c) => c.tandonId === target)
            .sort((a, b) => b.sowingDate.localeCompare(a.sowingDate))
        : [],
    [cycles, target],
  )

  const autoCycle = useMemo(
    () =>
      target && target !== 'UMUM' ? detectCycle(cycles, target as TandonId, date) : null,
    [cycles, target, date],
  )
  const manualCycle = cycleId ? (cycles.find((c) => c.id === cycleId) ?? null) : null
  const activeCycle = manualCycle ?? autoCycle

  const cycleOptions = useMemo(
    () => [
      { value: '', label: 'Otomatis (berdasarkan tanggal biaya)' },
      ...targetCycles.map((c) => ({
        value: c.id,
        label: `${c.batchCode} · semai ${formatDateID(c.sowingDate)} (${c.status})`,
      })),
    ],
    [targetCycles],
  )

  function validate(): boolean {
    const next: FormErrors = {}
    if (!date) next.date = 'Tanggal wajib diisi'
    if (!type) next.type = 'Pilih tipe biaya'
    if (!category) next.category = 'Pilih kategori'
    if (!description.trim()) next.description = 'Deskripsi wajib diisi'
    if (!target) next.target = 'Pilih tandon / umum'

    const hasQty = quantity !== ''
    const hasPrice = unitPrice !== ''
    if (hasQty !== hasPrice) {
      next.quantity = 'Jumlah dan harga satuan harus diisi bersamaan'
    } else if (hasQty && hasPrice && (quantityNum <= 0 || unitPriceNum <= 0)) {
      next.quantity = 'Jumlah dan harga satuan harus lebih dari 0'
    } else if (!hasQty && !hasPrice) {
      const amt = Number(amount)
      if (!amount || Number.isNaN(amt) || amt <= 0)
        next.amount = 'Nominal wajib diisi (atau isi jumlah + harga satuan)'
      else if (!Number.isInteger(amt)) next.amount = 'Nominal harus bilangan bulat Rupiah'
    }

    if (type === 'modal' && (spread < 1 || spread > MODAL_SPREAD_MAX || !Number.isInteger(spread))) {
      next.spreadCycles = `Penyebaran antara 1–${MODAL_SPREAD_MAX} siklus`
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      date,
      type: type as CostType,
      category: category as CostCategory,
      description: description.trim(),
      amount: hasQtyPrice ? undefined : Number(amount),
      target: target as CostTarget,
      supplier: supplier.trim() || null,
      notes: notes.trim() || null,
      quantity: hasQtyPrice ? quantityNum : null,
      unitPrice: hasQtyPrice ? unitPriceNum : null,
      spreadCycles: type === 'modal' ? spread : 1,
      cycleId: !isUmum && cycleId ? cycleId : null,
    })
    // Input beruntun: pertahankan tanggal/tipe/kategori/target, bersihkan sisanya.
    setDescription('')
    setAmount('')
    setQuantity('')
    setUnitPrice('')
    setSupplier('')
    setCycleId('')
    setNotes('')
    setErrors({})
  }

  const spreadOptions = useMemo(
    () =>
      MODAL_SPREAD_PRESETS.map((n) => ({
        value: String(n),
        label: n === 1 ? '1 — beban penuh siklus ini' : `${n} siklus`,
      })),
    [],
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader
          title={editEntry ? 'Edit Data Biaya' : 'Input Data Biaya'}
          subtitle={
            editEntry
              ? 'Perbarui pengeluaran yang sudah tersimpan'
              : 'Catat pengeluaran satu per satu — otomatis terkelompok ke batch panen'
          }
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DatePicker
              label="Tanggal Biaya"
              required
              value={date}
              errorText={errors.date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Select
              label="Tipe"
              required
              placeholder="Pilih tipe"
              value={type}
              errorText={errors.type}
              onChange={(e) => setType(e.target.value as CostType)}
              options={COST_TYPES.map((t) => ({ value: t.key, label: t.label }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Kategori"
              required
              placeholder="Pilih kategori"
              value={category}
              errorText={errors.category}
              onChange={(e) => setCategory(e.target.value as CostCategory)}
              options={COST_CATEGORIES.map((c) => ({
                value: c.key,
                label: `${c.icon} ${c.label}`,
              }))}
            />
            <Select
              label="Untuk"
              required
              placeholder="Pilih tandon / umum"
              value={target}
              errorText={errors.target}
              helperText={
                isUmum ? 'Biaya umum dibagi rata ke 3 tandon (listrik, upah bersama, dll.)' : undefined
              }
              onChange={(e) => handleTargetChange(e.target.value as CostTarget)}
              options={COST_TARGETS.map((t) => ({ value: t.key, label: t.label }))}
            />
          </div>

          <Input
            label="Deskripsi"
            type="text"
            required
            value={description}
            errorText={errors.description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Nominal"
              type="number"
              required={!hasQtyPrice}
              min={0}
              step={1}
              prefix="Rp"
              value={amount}
              errorText={errors.amount}
              helperText={hasQtyPrice ? 'Dihitung otomatis' : undefined}
              disabled={hasQtyPrice}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label="Jumlah (Opsional)"
              type="number"
              min={0}
              step={0.01}
              value={quantity}
              errorText={errors.quantity}
              helperText="mis. 8 botol, 1000 plug"
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Input
              label="Harga Satuan (Opsional)"
              type="number"
              min={0}
              step={1}
              prefix="Rp"
              value={unitPrice}
              errorText={errors.unitPrice}
              helperText="Bisa dipantau kenaikannya"
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>

          {type === 'modal' && (
            <Select
              label="Penyebaran Siklus (Modal & Aset)"
              value={spreadCycles}
              errorText={errors.spreadCycles}
              helperText="Beban penuh ke siklus ini, atau disebar rata ke beberapa siklus berikutnya"
              onChange={(e) => setSpreadCycles(e.target.value)}
              options={spreadOptions}
            />
          )}

          <Input
            label="Supplier (Opsional)"
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />

          <Select
            label="Batch Panen (Pindah Manual)"
            value={cycleId}
            placeholder="Otomatis (berdasarkan tanggal biaya)"
            disabled={isUmum || cycles.length === 0}
            helperText={
              isUmum
                ? 'Biaya Umum tidak dapat dipatok ke satu batch — dibagi rata ke tandon'
                : cycles.length > 0
                  ? 'Kosongkan untuk pengelompokan otomatis dari tanggal'
                  : 'Membutuhkan mode API (backend)'
            }
            onChange={(e) => setCycleId(e.target.value)}
            options={cycleOptions}
          />

          <Textarea
            label="Catatan (Opsional)"
            value={notes}
            placeholder="Detail pembelian, nomor invoice, dll…"
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button type="submit" size="lg" leftIcon={<Save className="h-4 w-4" aria-hidden />}>
            {editEntry ? 'Perbarui Data Biaya' : 'Simpan Data Biaya'}
          </Button>
        </CardBody>
      </Card>

      <Card className="h-fit xl:sticky xl:top-24">
        <CardHeader title="Live Preview" subtitle="Perhitungan & pengelompokan realtime" />
        <CardBody className="space-y-4">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Nominal Final</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {formatCurrencyRp(finalAmount || 0)}
            </p>
            {hasQtyPrice && (
              <p className="mt-0.5 font-mono text-xs tabular-nums text-[var(--text-muted)]">
                {quantity} × {formatCurrencyRp(unitPriceNum)}
              </p>
            )}
          </div>

          {target ? (
            isUmum ? (
              <div className="rounded-md border border-[var(--border-default)] p-3 text-sm">
                <Badge variant="info" qualitative="Umum — dibagi rata" size="sm" />
                <p className="mt-2 text-[var(--text-secondary)]">
                  Rp {Math.round((finalAmount || 0) / 3).toLocaleString('id-ID')} per tandon
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Tiap porsi otomatis masuk siklus aktif masing-masing tandon pada tanggal biaya.
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-[var(--border-default)] p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                  <TandonColorDot tandonId={target as TandonId} />
                  {TANDON_CONFIG[target as TandonId].name}
                </div>
                <p className="mt-2 text-[var(--text-secondary)]">Batch tujuan:</p>
                {activeCycle ? (
                  <p className="font-mono text-xs tabular-nums text-[var(--text-primary)]">
                    {activeCycle.batchCode} · {formatDateID(activeCycle.sowingDate)} →{' '}
                    {formatDateID(activeCycle.cycleEndDate)}
                    {manualCycle ? ' (manual)' : ' (otomatis)'}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-[var(--status-warning)]">
                    ⚠ Di luar siklus aktif — biaya tidak terkelompok. Pilih batch manual bila perlu.
                  </p>
                )}
              </div>
            )
          ) : (
            <p className="py-2 text-center text-sm text-[var(--text-muted)]">
              Pilih “Untuk” untuk melihat pengelompokan batch.
            </p>
          )}

          {type === 'modal' && finalAmount > 0 && spread > 1 && (
            <div className="rounded-md border border-[var(--border-default)] p-3 text-sm">
              <Badge variant="warning" qualitative={`Disebar ${spread} siklus`} size="sm" />
              <p className="mt-2 font-mono tabular-nums text-[var(--text-primary)]">
                ± {formatCurrencyRp(Math.round(finalAmount / spread))} / siklus
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Mulai dari batch tujuan di atas + {spread - 1} siklus berikutnya.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </form>
  )
}
