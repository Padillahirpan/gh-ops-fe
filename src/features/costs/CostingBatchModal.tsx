import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { BatchCostDetail, BatchCostSummary, CostCategory } from '@/types/cost'
import { costCategoryMeta } from '@/constants/costConfig'
import { seladaApi } from '@/api/seladaOpsApi'
import { getApiErrorMessage } from '@/api/client'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { TandonColorDot } from '@/components/ui/TandonColorDot'
import { formatDateID } from '@/lib/dateUtils'
import { formatCurrencyRp, formatPercent, formatWeightKg } from '@/lib/formatters'

export interface CostingBatchModalProps {
  batch: BatchCostSummary | null
  onClose: () => void
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: string | undefined
}) {
  return (
    <div className="rounded-md border border-[var(--border-default)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p
        className="mt-1 font-mono text-lg font-bold tabular-nums text-[var(--text-primary)]"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </p>
    </div>
  )
}

/**
 * Loader item batch — di-key per cycleId sehingga state reset alami saat ganti
 * batch / modal ditutup (tanpa setState sinkron di dalam effect).
 */
function BatchDetailLoader({ cycleId }: { cycleId: string }) {
  const [detail, setDetail] = useState<BatchCostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    seladaApi
      .getBatchCosting(cycleId)
      .then((d) => {
        if (!cancelled) setDetail(d)
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [cycleId])

  const categoryRows = detail
    ? Object.entries(detail.categoryTotals).filter(([, total]) => total > 0)
    : []

  return (
    <div className="space-y-5">
      {loading && (
        <p role="status" className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Memuat rincian item…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-[var(--status-danger)]">
          {error}
        </p>
      )}

      {detail && (
        <>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
              Item Biaya ({detail.items.length})
            </h3>
            <div className="overflow-x-auto rounded-md border border-[var(--border-default)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg-surface-hover)] text-left text-xs text-[var(--text-muted)]">
                  <tr>
                    <th className="px-3 py-2">Tanggal</th>
                    <th className="px-3 py-2">Deskripsi</th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2">Sumber</th>
                    <th className="px-3 py-2 text-right">Porsi</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item, i) => {
                    const cat = costCategoryMeta(item.category)
                    return (
                      <tr
                        key={`${item.costId}-${item.spreadIndex ?? 0}-${i}`}
                        className="border-t border-[var(--border-default)]"
                      >
                        <td className="px-3 py-2 font-mono text-xs tabular-nums">
                          {formatDateID(item.date)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="text-[var(--text-primary)]">
                              {item.description}
                            </span>
                            {item.spreadIndex !== null && (
                              <span className="text-xs text-[var(--text-muted)]">
                                modal · siklus {item.spreadIndex} dari {item.spreadTotal}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {cat?.icon} {cat?.shortLabel}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.isUmumShare ? (
                            <Badge
                              variant="info"
                              qualitative={`Umum → ${item.shareTandonId}`}
                              size="sm"
                            />
                          ) : (
                            <span className="text-xs text-[var(--text-muted)]">
                              {item.sourceTarget}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-[var(--text-primary)]">
                              {formatCurrencyRp(item.chargedAmount)}
                            </span>
                            {item.isUmumShare && (
                              <span className="text-xs text-[var(--text-muted)]">
                                dari {formatCurrencyRp(item.originalAmount)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {detail.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-sm text-[var(--text-muted)]"
                      >
                        Belum ada biaya terkelompok ke batch ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {categoryRows.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                Per Kategori
              </h3>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {categoryRows.map(([key, total]) => {
                  const meta = costCategoryMeta(key as CostCategory)
                  return (
                    <li
                      key={key}
                      className="flex items-center justify-between rounded-md border border-[var(--border-default)] px-3 py-2 text-sm"
                    >
                      <span className="text-[var(--text-secondary)]">
                        {meta?.icon} {meta?.label ?? key}
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                        {formatCurrencyRp(total)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function CostingBatchModal({ batch, onClose }: CostingBatchModalProps) {
  return (
    <Modal
      open={batch !== null}
      onClose={onClose}
      title={batch ? `Rincian Biaya — ${batch.batchCode}` : 'Rincian Biaya'}
      size="lg"
    >
      {batch && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
              <TandonColorDot tandonId={batch.tandonId} />
              {batch.tandonId}
            </span>
            <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
              semai {formatDateID(batch.sowingDate)} → {formatDateID(batch.cycleEndDate)}
            </span>
            <Badge
              variant={batch.status === 'Berjalan' ? 'info' : 'neutral'}
              qualitative={batch.status}
              size="sm"
            />
            {batch.belowBreakEven && (
              <Badge variant="danger" qualitative="Harga jual di bawah impas" size="sm" />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Total Biaya" value={formatCurrencyRp(batch.totalCost)} />
            <Metric
              label="Biaya / kg"
              value={batch.hasHarvest ? `${formatCurrencyRp(Math.round(batch.costPerKg))}/kg` : '—'}
            />
            <Metric
              label="Laba Kotor"
              value={formatCurrencyRp(batch.grossProfit)}
              tone={batch.grossProfit >= 0 ? 'var(--status-success)' : 'var(--status-danger)'}
            />
            <Metric
              label={`Harga Impas (jual rata-rata ${
                batch.avgSellingPricePerKg !== null
                  ? formatCurrencyRp(Math.round(batch.avgSellingPricePerKg))
                  : '—'
              })`}
              value={batch.hasHarvest ? `${formatCurrencyRp(Math.round(batch.breakEvenPricePerKg))}/kg` : '—'}
              tone={batch.belowBreakEven ? 'var(--status-danger)' : undefined}
            />
          </div>

          <p className="text-sm text-[var(--text-secondary)]">
            Panen {batch.hasHarvest ? formatWeightKg(batch.totalHarvestKg) : 'belum ada'} ·{' '}
            {batch.harvestCount} entri panen · margin{' '}
            <span className="font-mono tabular-nums">{formatPercent(batch.marginPercent)}</span> ·{' '}
            {formatCurrencyRp(Math.round(batch.costPerHole))}/lubang
          </p>

          <BatchDetailLoader key={batch.cycleId} cycleId={batch.cycleId} />
        </div>
      )}
    </Modal>
  )
}
