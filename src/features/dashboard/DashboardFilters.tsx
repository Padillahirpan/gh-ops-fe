import type { TandonId } from '@/types/tandon'
import { TANDON_IDS } from '@/constants/tandonConfig'
import type { DashboardFilters as Filters } from './dashboardData'

export interface DashboardFiltersBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const RANGE_OPTIONS: Array<{ key: Filters['range']; label: string }> = [
  { key: '30', label: '30 Hari' },
  { key: '90', label: '90 Hari' },
  { key: 'all', label: 'Semua' },
]

export function DashboardFiltersBar({ filters, onChange }: DashboardFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1"
        role="group"
        aria-label="Rentang tanggal"
      >
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            aria-pressed={filters.range === opt.key}
            onClick={() => onChange({ ...filters, range: opt.key })}
            className={[
              'h-9 rounded px-3 text-sm font-medium transition-colors',
              filters.range === opt.key
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div
        className="flex items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1"
        role="group"
        aria-label="Filter tandon"
      >
        {(['all', ...TANDON_IDS] as Array<TandonId | 'all'>).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={filters.tandonId === id}
            onClick={() => onChange({ ...filters, tandonId: id })}
            className={[
              'h-9 min-w-9 rounded px-3 text-sm font-medium transition-colors',
              filters.tandonId === id
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            {id === 'all' ? 'Semua' : id}
          </button>
        ))}
      </div>
    </div>
  )
}
