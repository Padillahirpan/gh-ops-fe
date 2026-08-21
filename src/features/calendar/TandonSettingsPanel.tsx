import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Tandon, TandonId, TandonStatus } from '@/types/tandon'
import {
  TANDON_CONFIG,
  TANDON_STATUS_LABEL,
} from '@/constants/tandonConfig'
import { useTandonStore } from '@/store/useTandonStore'
import { DatePicker } from '@/components/ui/DatePicker'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDateID, todayISO } from '@/lib/dateUtils'
import { getHssFromSowingDate } from '@/lib/cycleCalculator'

export interface TandonSettingsPanelProps {
  focusTandonId?: TandonId | null
}

export function TandonSettingsPanel({ focusTandonId }: TandonSettingsPanelProps) {
  const tandons = useTandonStore((s) => s.tandons)
  const setSowingDate = useTandonStore((s) => s.setSowingDate)
  const setStatus = useTandonStore((s) => s.setStatus)
  const resetTandon = useTandonStore((s) => s.resetTandon)

  const [resetTarget, setResetTarget] = useState<TandonId | null>(null)
  const [dateError, setDateError] = useState<Partial<Record<TandonId, string>>>({})

  function handleDateChange(id: TandonId, value: string) {
    if (value && value > todayISO()) {
      setDateError((prev) => ({
        ...prev,
        [id]: 'Tanggal semai tidak boleh di masa depan',
      }))
      return
    }
    setDateError((prev) => ({ ...prev, [id]: undefined }))
    setSowingDate(id, value || null)
  }

  return (
    <div className="space-y-4">
      {(Object.keys(tandons) as TandonId[]).map((id) => {
        const tandon: Tandon = tandons[id]
        const cfg = TANDON_CONFIG[id]
        const hss = getHssFromSowingDate(tandon.sowingDate)
        const isHighlighted = focusTandonId === id

        return (
          <section
            key={id}
            className={[
              'overflow-hidden rounded-lg border bg-[var(--bg-surface)] transition-shadow',
              isHighlighted
                ? 'border-2 shadow-md'
                : 'border-[var(--border-default)]',
            ].join(' ')}
            style={isHighlighted ? { borderColor: cfg.color } : undefined}
            aria-label={`Pengaturan ${tandon.name}`}
          >
            <header
              className="flex items-center justify-between px-4 py-3"
              style={{
                backgroundColor: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                  aria-hidden
                />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {tandon.name}
                </h3>
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {cfg.batchCode} · {cfg.greenhouse} ·{' '}
                <span className="font-mono tabular-nums">
                  {cfg.holes.toLocaleString('id-ID')}
                </span>{' '}
                lubang
              </span>
            </header>

            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <DatePicker
                label="Tanggal Semai (HSS 0)"
                value={tandon.sowingDate ?? ''}
                max={todayISO()}
                onChange={(e) => handleDateChange(id, e.target.value)}
                errorText={dateError[id]}
                helperText={
                  tandon.sowingDate
                    ? hss !== null
                      ? `Sekarang HSS ${hss} (semai ${formatDateID(tandon.sowingDate)})`
                      : 'Semai belum dimulai (tanggal di masa depan)'
                    : 'Belum ada tanggal semai'
                }
              />

              <Select
                label="Status Tandon"
                value={tandon.status}
                onChange={(e) =>
                  setStatus(id, e.target.value as TandonStatus)
                }
                options={(Object.keys(TANDON_STATUS_LABEL) as TandonStatus[]).map(
                  (status) => ({
                    value: status,
                    label: TANDON_STATUS_LABEL[status],
                  }),
                )}
              />

              <div className="sm:col-span-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
                  onClick={() => setResetTarget(id)}
                >
                  Reset Siklus Ini
                </Button>
              </div>
            </div>
          </section>
        )
      })}

      <ConfirmDialog
        open={resetTarget !== null}
        title="Reset Siklus Tandon"
        body={`Semua jadwal event untuk tandon ini akan dihapus (tanggal semai dikosongkan, status kembali ke Kosong). Data panen & penjualan TIDAK terhapus. Lanjutkan?`}
        confirmLabel="Reset Siklus"
        onConfirm={() => {
          if (resetTarget) resetTandon(resetTarget)
          setResetTarget(null)
        }}
        onCancel={() => setResetTarget(null)}
      />
    </div>
  )
}
