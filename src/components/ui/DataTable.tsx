import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SortDirection } from '@/types/ui'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  align?: 'left' | 'right' | 'center'
  width?: string
  sticky?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Array<DataTableColumn<T>>
  getRowKey: (row: T) => string
  initialSortKey?: string
  initialSortDirection?: Exclude<SortDirection, null>
  emptyIcon: LucideIcon
  emptyTitle: string
  emptySubtitle?: string
  emptyAction?: ReactNode
  pageSizeOptions?: number[]
  ariaLabel: string
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  initialSortKey,
  initialSortDirection = 'desc',
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptySubtitle,
  emptyAction,
  pageSizeOptions = [25, 50, 100],
  ariaLabel,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey ?? null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialSortKey ? initialSortDirection : null,
  )
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  const [pageIndex, setPageIndex] = useState(0)

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return data

    return [...data].sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'id')
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDirection, columns])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const pagedData = sortedData.slice(
    safePageIndex * pageSize,
    (safePageIndex + 1) * pageSize,
  )

  function handleSort(col: DataTableColumn<T>) {
    if (!col.sortValue) return
    setPageIndex(0)
    if (sortKey !== col.key) {
      setSortKey(col.key)
      setSortDirection('asc')
      return
    }
    if (sortDirection === 'asc') setSortDirection('desc')
    else if (sortDirection === 'desc') {
      setSortKey(null)
      setSortDirection(null)
    } else {
      setSortDirection('asc')
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <EmptyIcon className="h-10 w-10 text-[var(--text-muted)]" strokeWidth={1.5} aria-hidden />
        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
          {emptyTitle}
        </h3>
        {emptySubtitle && (
          <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">{emptySubtitle}</p>
        )}
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-[var(--border-default)]">
        <table className="w-full min-w-max border-collapse text-sm" aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      isSorted
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    style={col.width ? { width: col.width } : undefined}
                    className={[
                      'sticky top-0 z-10 border-b border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-3 py-2.5',
                      'text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]',
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                      col.sticky ? 'sticky left-0 z-20 bg-[var(--bg-surface-hover)]' : '',
                    ].join(' ')}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col)}
                        className={[
                          'inline-flex items-center gap-1 hover:text-[var(--text-primary)]',
                          col.align === 'right' ? 'flex-row-reverse' : '',
                        ].join(' ')}
                      >
                        {col.header}
                        {isSorted ? (
                          <span aria-hidden className="text-[var(--color-tandon-t1)]">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" aria-hidden />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row, rowIndex) => (
              <tr
                key={getRowKey(row)}
                className={
                  rowIndex % 2 === 1 ? 'bg-[var(--bg-surface-hover)]/50' : ''
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      'min-h-[52px] border-b border-[var(--border-default)] px-3 py-3 text-[var(--text-primary)]',
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                      col.sticky ? 'sticky left-0 bg-inherit' : '',
                    ].join(' ')}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <label htmlFor={`${ariaLabel}-pagesize`} className="whitespace-nowrap">
            Rows per page
          </label>
          <select
            id={`${ariaLabel}-pagesize`}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPageIndex(0)
            }}
            className="h-9 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="font-mono tabular-nums">
            {safePageIndex * pageSize + 1}–
            {Math.min((safePageIndex + 1) * pageSize, sortedData.length)} dari{' '}
            {sortedData.length}
          </span>
        </div>

        <nav aria-label="Paginasi tabel" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={safePageIndex === 0}
            aria-label="Halaman sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-strong)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--bg-surface-hover)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i)
            .filter(
              (p) =>
                p === 0 ||
                p === totalPages - 1 ||
                Math.abs(p - safePageIndex) <= 1,
            )
            .map((page, idx, arr) => (
              <span key={page} className="flex items-center">
                {idx > 0 && page - arr[idx - 1] > 1 && (
                  <span className="px-1 text-[var(--text-muted)]">…</span>
                )}
                <button
                  type="button"
                  onClick={() => setPageIndex(page)}
                  aria-current={page === safePageIndex ? 'page' : undefined}
                  className={[
                    'h-9 min-w-9 rounded-md border px-2 font-mono text-sm tabular-nums',
                    page === safePageIndex
                      ? 'border-[var(--color-tandon-t1)] bg-[var(--color-tandon-t1)] text-white'
                      : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]',
                  ].join(' ')}
                >
                  {page + 1}
                </button>
              </span>
            ))}

          <button
            type="button"
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePageIndex >= totalPages - 1}
            aria-label="Halaman berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-strong)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--bg-surface-hover)]"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </nav>
      </div>
    </div>
  )
}
