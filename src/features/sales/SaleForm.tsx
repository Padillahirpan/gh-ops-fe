import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import type {
  BuyerCategory,
  PaymentStatus,
  SaleEntry,
  UnsoldAction,
} from '@/types/sale'
import { TANDON_CONFIG } from '@/constants/tandonConfig'
import {
  BUYER_CATEGORIES,
  PAYMENT_STATUS,
  UNSOLD_ACTIONS,
} from '@/constants/salesConfig'
import {
  calculateHarvestToCashRatio,
  calculateRevenuePerHole,
  calculateTotalValue,
} from '@/lib/salesCalculations'
import { todayISO, formatDateID } from '@/lib/dateUtils'
import {
  formatCurrencyRp,
  formatPercent,
  formatWeightG,
  formatWeightKg,
} from '@/lib/formatters'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import { useHarvestStore } from '@/store/useHarvestStore'
import { useSaleStore } from '@/store/useSaleStore'
import type { SaleDraft } from '@/store/useSaleStore'
import type { HarvestEntry } from '@/types/harvest'

export interface SaleFormProps {
  onSubmit: (draft: SaleDraft) => void
  editEntry?: SaleEntry | null
}

interface FormErrors {
  harvestId?: string
  date?: string
  buyerCategory?: string
  buyerName?: string
  soldVolumeKg?: string
  pricePerKg?: string
  paymentStatus?: string
}

export function SaleForm({ onSubmit, editEntry }: SaleFormProps) {
  const harvests = useHarvestStore((s) => s.harvests)
  const sales = useSaleStore((s) => s.sales)

  const [harvestId, setHarvestId] = useState(editEntry?.harvestId ?? '')
  const [date, setDate] = useState(editEntry?.date ?? todayISO())
  const [buyerCategory, setBuyerCategory] = useState<BuyerCategory | ''>(
    editEntry?.buyerCategory ?? '',
  )
  const [buyerName, setBuyerName] = useState(editEntry?.buyerName ?? '')
  const [soldVolumeKg, setSoldVolumeKg] = useState(
    editEntry ? String(editEntry.soldVolumeKg) : '',
  )
  const [pricePerKg, setPricePerKg] = useState(
    editEntry ? String(editEntry.pricePerKg) : '',
  )
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>(
    editEntry?.paymentStatus ?? '',
  )
  const [unsoldAction, setUnsoldAction] = useState<string>(
    editEntry?.unsoldAction ?? '',
  )
  const [notes, setNotes] = useState(editEntry?.notes ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const selectedHarvest: HarvestEntry | undefined = useMemo(
    () => harvests.find((h) => h.id === harvestId),
    [harvests, harvestId],
  )

  const remainingStock = useMemo(() => {
    if (!selectedHarvest) return 0
    const otherSales = sales.filter(
      (s) => s.harvestId === harvestId && s.id !== editEntry?.id,
    )
    const sold = otherSales.reduce((sum, s) => sum + s.soldVolumeKg, 0)
    return Math.max(0, selectedHarvest.totalWeightKg - sold)
  }, [selectedHarvest, sales, harvestId, editEntry])

  const preview = useMemo(() => {
    const volume = Number(soldVolumeKg) || 0
    const price = Number(pricePerKg) || 0
    if (volume <= 0 || price <= 0 || !selectedHarvest) return null
    const totalValue = calculateTotalValue(volume, price)
    return {
      totalValue,
      revenuePerHole: calculateRevenuePerHole(totalValue),
      cashRatio: calculateHarvestToCashRatio(volume, selectedHarvest.totalWeightKg),
    }
  }, [soldVolumeKg, pricePerKg, selectedHarvest])

  function validate(): boolean {
    const next: FormErrors = {}
    if (!harvestId) next.harvestId = 'Pilih batch panen dulu'
    if (!date) next.date = 'Tanggal wajib diisi'
    if (!buyerCategory) next.buyerCategory = 'Pilih kategori pembeli'
    if (!buyerName.trim()) next.buyerName = 'Nama pembeli wajib diisi'
    const volume = Number(soldVolumeKg)
    if (!soldVolumeKg || Number.isNaN(volume) || volume <= 0)
      next.soldVolumeKg = 'Volume terjual harus lebih dari 0'
    else if (selectedHarvest && volume > remainingStock)
      next.soldVolumeKg = `Melebihi sisa stok (${formatWeightKg(remainingStock)})`
    const price = Number(pricePerKg)
    if (!pricePerKg || Number.isNaN(price) || price <= 0)
      next.pricePerKg = 'Harga per kg harus lebih dari 0'
    if (!paymentStatus) next.paymentStatus = 'Pilih status pembayaran'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      harvestId,
      tandonId: selectedHarvest!.tandonId,
      date,
      buyerCategory: buyerCategory as BuyerCategory,
      buyerName: buyerName.trim(),
      soldVolumeKg: Number(soldVolumeKg),
      pricePerKg: Number(pricePerKg),
      paymentStatus: paymentStatus as PaymentStatus,
      unsoldAction: (unsoldAction || null) as UnsoldAction,
      notes: notes.trim() || null,
    })
    setSoldVolumeKg('')
    setPricePerKg('')
    setBuyerName('')
    setUnsoldAction('')
    setNotes('')
    setErrors({})
  }

  const harvestOptions = useMemo(
    () =>
      harvests
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((h) => ({
          value: h.id,
          label: `[${h.tandonId}] ${formatDateID(h.date)} • ${h.totalWeightKg.toFixed(1)} kg • ${Math.round(h.avgWeightG)}g avg`,
        })),
    [harvests],
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader
          title={editEntry ? 'Edit Data Penjualan' : 'Input Data Penjualan'}
          subtitle={editEntry ? 'Perbarui transaksi yang sudah tersimpan' : 'Catat transaksi penjualan per batch panen'}
        />
        <CardBody className="space-y-4">
          <Select
            label="Batch Panen"
            required
            placeholder={harvests.length === 0 ? 'Belum ada data panen' : 'Pilih batch panen'}
            value={harvestId}
            errorText={errors.harvestId}
            disabled={harvests.length === 0}
            helperText={
              selectedHarvest
                ? `Sisa stok batch ini: ${formatWeightKg(remainingStock)}`
                : undefined
            }
            onChange={(e) => setHarvestId(e.target.value)}
            options={harvestOptions}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <DatePicker
              label="Tanggal Transaksi"
              required
              value={date}
              max={todayISO()}
              errorText={errors.date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Select
              label="Kategori Pembeli"
              required
              placeholder="Pilih kategori"
              value={buyerCategory}
              errorText={errors.buyerCategory}
              onChange={(e) => setBuyerCategory(e.target.value as BuyerCategory)}
              options={BUYER_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nama Pembeli"
              type="text"
              required
              value={buyerName}
              errorText={errors.buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
            <Input
              label="Harga per Kg"
              type="number"
              required
              min={0}
              step={1}
              prefix="Rp"
              value={pricePerKg}
              errorText={errors.pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Volume Terjual"
              type="number"
              required
              min={0}
              step={0.01}
              suffix="kg"
              value={soldVolumeKg}
              errorText={errors.soldVolumeKg}
              helperText={
                selectedHarvest
                  ? `Maks ${formatWeightKg(remainingStock)} (sisa stok batch)`
                  : 'Pilih batch panen dulu'
              }
              onChange={(e) => setSoldVolumeKg(e.target.value)}
            />
            <Select
              label="Status Pembayaran"
              required
              placeholder="Pilih status"
              value={paymentStatus}
              errorText={errors.paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              options={PAYMENT_STATUS.map((p) => ({ value: p.key, label: p.label }))}
            />
          </div>

          <Select
            label="Aksi Sisa Stok (Opsional)"
            placeholder="Tidak ada / belum ditentukan"
            value={unsoldAction}
            helperText="Isi jika ada sisa panen yang tidak terjual di batch ini"
            onChange={(e) => setUnsoldAction(e.target.value)}
            options={UNSOLD_ACTIONS.map((a) => ({
              value: a.key,
              label: `${a.label} — ${a.description}`,
            }))}
          />

          <Textarea
            label="Catatan (Opsional)"
            value={notes}
            placeholder="Syarat pembayaran, kontak, dll…"
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button type="submit" size="lg" leftIcon={<Save className="h-4 w-4" aria-hidden />}>
            {editEntry ? 'Perbarui Data Penjualan' : 'Simpan Data Penjualan'}
          </Button>
        </CardBody>
      </Card>

      <Card className="h-fit xl:sticky xl:top-24">
        <CardHeader title="Live Preview" subtitle="Perhitungan realtime" />
        <CardBody className="space-y-4">
          {selectedHarvest ? (
            <div className="rounded-md border border-[var(--border-default)] p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                <TandonColorDot tandonId={selectedHarvest.tandonId} />
                {TANDON_CONFIG[selectedHarvest.tandonId].name}
              </div>
              <p className="mt-1 font-mono text-xs tabular-nums text-[var(--text-muted)]">
                {formatDateID(selectedHarvest.date)} •{' '}
                {formatWeightKg(selectedHarvest.totalWeightKg)} •{' '}
                {formatWeightG(selectedHarvest.avgWeightG)} avg
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Sisa stok:{' '}
                <span className="font-mono tabular-nums font-semibold text-[var(--text-primary)]">
                  {formatWeightKg(remainingStock)}
                </span>
              </p>
            </div>
          ) : (
            <p className="py-2 text-center text-sm text-[var(--text-muted)]">
              Pilih batch panen untuk melihat preview.
            </p>
          )}

          {preview && (
            <>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total Nilai Transaksi</p>
                <p className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                  {formatCurrencyRp(preview.totalValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Revenue per Lubang</p>
                <p className="font-mono text-xl font-bold tabular-nums text-[var(--text-primary)]">
                  {formatCurrencyRp(preview.revenuePerHole)}
                  <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">/lubang</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Harvest-to-Cash Ratio</p>
                <p className="font-mono text-xl font-bold tabular-nums text-[var(--text-primary)]">
                  {formatPercent(preview.cashRatio)}
                </p>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </form>
  )
}
