import { useMemo, useState } from 'react'
import type {
  HarvestEntry,
  HarvestRejectionBreakdown,
  HarvestRejectionReason,
} from '@/types/harvest'
import type { TandonId } from '@/types/tandon'
import { TANDON_IDS, TANDON_CONFIG } from '@/constants/tandonConfig'
import {
  HARVEST_REJECTION_REASONS,
  createEmptyRejectionBreakdown,
  sumRejectionBreakdown,
} from '@/constants/harvestConfig'
import {
  calculateAvgWeightG,
  calculateSuccessRate,
  getWeightBadge,
} from '@/lib/harvestCalculations'
import { todayISO } from '@/lib/dateUtils'
import { formatPercent, formatWeightG, formatWeightKg } from '@/lib/formatters'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { DatePicker } from '@/components/ui/DatePicker'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import type { HarvestDraft } from '@/store/useHarvestStore'

export interface HarvestFormProps {
  onSubmit: (draft: HarvestDraft) => void
  editEntry?: HarvestEntry | null
  /** Id elemen <form> — tombol submit ditempatkan parent (footer modal). */
  formId: string
}

interface FormErrors {
  tandonId?: string
  date?: string
  totalWeightKg?: string
  totalPlants?: string
  rejected?: string
  reasons?: string
}

export function HarvestForm({ onSubmit, editEntry, formId }: HarvestFormProps) {
  const [tandonId, setTandonId] = useState<TandonId | ''>(editEntry?.tandonId ?? '')
  const [date, setDate] = useState(editEntry?.date ?? todayISO())
  const [totalWeightKg, setTotalWeightKg] = useState(
    editEntry ? String(editEntry.totalWeightKg) : '',
  )
  const [totalPlants, setTotalPlants] = useState(
    editEntry ? String(editEntry.totalPlants) : '',
  )
  const [rejected, setRejected] = useState(
    editEntry ? String(editEntry.rejected) : '',
  )
  const [reasons, setReasons] = useState<HarvestRejectionBreakdown>(
    editEntry?.reasons ?? createEmptyRejectionBreakdown(),
  )
  const [notes, setNotes] = useState(editEntry?.notes ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const rejectedCount = Number(rejected) || 0
  const reasonsTotal = useMemo(() => sumRejectionBreakdown(reasons), [reasons])

  const preview = useMemo(() => {
    const weight = Number(totalWeightKg) || 0
    const plants = Number(totalPlants) || 0
    if (weight <= 0 || plants <= 0) return null
    const avg = calculateAvgWeightG(weight, plants)
    const rate = calculateSuccessRate(plants, rejectedCount)
    return { avg, rate, badge: getWeightBadge(avg) }
  }, [totalWeightKg, totalPlants, rejectedCount])

  function toggleReason(key: HarvestRejectionReason, checked: boolean) {
    setReasons((prev) => ({ ...prev, [key]: checked ? prev[key] || 1 : 0 }))
  }

  function setReasonCount(key: HarvestRejectionReason, value: string) {
    const count = Math.max(0, Math.floor(Number(value) || 0))
    setReasons((prev) => ({ ...prev, [key]: count }))
  }

  function validate(): boolean {
    const next: FormErrors = {}
    if (!tandonId) next.tandonId = 'Pilih tandon dulu'
    if (!date) next.date = 'Tanggal wajib diisi'
    const weight = Number(totalWeightKg)
    if (!totalWeightKg || Number.isNaN(weight) || weight <= 0)
      next.totalWeightKg = 'Total berat harus lebih dari 0'
    const plants = Number(totalPlants)
    if (!totalPlants || Number.isNaN(plants) || plants < 1)
      next.totalPlants = 'Jumlah tanaman minimal 1'
    if (rejectedCount < 0) next.rejected = 'Tidak boleh negatif'
    if (rejectedCount > plants) next.rejected = 'Afkir tidak boleh melebihi total tanaman'
    if (rejectedCount > 0 && reasonsTotal === 0)
      next.reasons = 'Pilih minimal 1 alasan afkir (jika ada afkir)'
    if (reasonsTotal > rejectedCount)
      next.reasons = `Total per alasan (${reasonsTotal}) melebihi jumlah afkir (${rejectedCount})`
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !tandonId) return
    onSubmit({
      tandonId: tandonId as TandonId,
      date,
      totalWeightKg: Number(totalWeightKg),
      totalPlants: Number(totalPlants),
      rejected: rejectedCount,
      reasons,
      notes: notes.trim() || null,
    })
    setTotalWeightKg('')
    setTotalPlants('')
    setRejected('')
    setReasons(createEmptyRejectionBreakdown())
    setNotes('')
    setErrors({})
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <Card>
        <CardHeader
          title={editEntry ? `Edit Data Panen` : 'Input Data Panen'}
          subtitle={
            editEntry ? 'Perbarui data panen yang sudah tersimpan' : 'Catat hasil panen per tandon'
          }
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Tandon"
              required
              placeholder="Pilih tandon"
              value={tandonId}
              errorText={errors.tandonId}
              onChange={(e) => setTandonId(e.target.value as TandonId | '')}
              options={TANDON_IDS.map((id) => ({
                value: id,
                label: `${TANDON_CONFIG[id].name} · ${TANDON_CONFIG[id].greenhouse}`,
              }))}
            />
            <DatePicker
              label="Tanggal Panen"
              required
              value={date}
              max={todayISO()}
              errorText={errors.date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Total Berat"
              type="number"
              required
              min={0}
              step={0.01}
              suffix="kg"
              value={totalWeightKg}
              errorText={errors.totalWeightKg}
              onChange={(e) => setTotalWeightKg(e.target.value)}
            />
            <Input
              label="Tanaman Dipanen"
              type="number"
              required
              min={0}
              step={1}
              value={totalPlants}
              errorText={errors.totalPlants}
              onChange={(e) => setTotalPlants(e.target.value)}
            />
            <Input
              label="Jumlah Afkir"
              type="number"
              min={0}
              step={1}
              helperText="Tanaman dibuang / tidak layak jual"
              value={rejected}
              errorText={errors.rejected}
              onChange={(e) => setRejected(e.target.value)}
            />
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-[var(--text-primary)]">
              Alasan Afkir
              {rejectedCount > 0 && <span className="text-[var(--status-danger)]"> *</span>}
            </legend>
            <p className="mb-2 text-xs text-[var(--text-muted)]">
              Centang alasan yang terjadi, lalu isi jumlah per alasan. Total:{' '}
              <span className="font-mono tabular-nums font-semibold">{reasonsTotal}</span>
              {rejectedCount > 0 && (
                <span className={reasonsTotal === rejectedCount ? 'text-[var(--status-success)]' : 'text-[var(--status-warning)]'}>
                  {' '}dari {rejectedCount} afkir
                </span>
              )}
            </p>
            <div className="space-y-2">
              {HARVEST_REJECTION_REASONS.map((reason) => (
                <div
                  key={reason.key}
                  className="flex items-center justify-between gap-3 rounded-md border border-[var(--border-default)] px-3 py-2"
                >
                  <label className="flex min-w-0 cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={reasons[reason.key] > 0}
                      onChange={(e) => toggleReason(reason.key, e.target.checked)}
                      className="h-4 w-4 accent-[var(--color-tandon-t1)]"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[var(--text-primary)]">
                        {reason.label}
                      </span>
                      <span className="block text-xs text-[var(--text-muted)]">
                        {reason.description}
                      </span>
                    </span>
                  </label>
                  {reasons[reason.key] > 0 && (
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={reasons[reason.key]}
                      aria-label={`Jumlah ${reason.label}`}
                      onChange={(e) => setReasonCount(reason.key, e.target.value)}
                      className="h-9 w-20 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 text-right font-mono text-sm tabular-nums"
                    />
                  )}
                </div>
              ))}
            </div>
            {errors.reasons && (
              <p role="alert" className="mt-1.5 text-xs text-[var(--status-danger)]">
                {errors.reasons}
              </p>
            )}
          </fieldset>

          <Textarea
            label="Catatan (Opsional)"
            value={notes}
            placeholder="Kondisi panen, cuaca, observasi lain…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardBody>
      </Card>

      <Card className="h-fit">
        <CardHeader title="Live Preview" subtitle="Perhitungan realtime" />
        <CardBody className="space-y-4">
          {tandonId && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <TandonColorDot tandonId={tandonId} />
              {TANDON_CONFIG[tandonId].name}
            </div>
          )}

          {preview ? (
            <>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Rata-rata Berat</p>
                <p className="font-mono text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                  {formatWeightG(preview.avg)}
                </p>
              </div>
              <Badge
                variant={preview.badge.tone}
                quantitative={preview.badge.thresholdText}
                qualitative={preview.badge.label}
              />
              <div>
                <p className="text-sm text-[var(--text-muted)]">Success Rate</p>
                <p className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                  {formatPercent(preview.rate)}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {formatWeightKg(Number(totalWeightKg) || 0)} total dari{' '}
                  <span className="font-mono tabular-nums">{Number(totalPlants) || 0}</span>{' '}
                  tanaman
                </p>
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">
              Isi total berat & jumlah tanaman untuk melihat preview.
            </p>
          )}
        </CardBody>
      </Card>
    </form>
  )
}
