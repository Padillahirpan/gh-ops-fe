import { Eye } from 'lucide-react'

/** Banner di halaman yang menampilkan data dalam mode lihat-saja (role User). */
export function ReadOnlyBanner() {
  return (
    <div
      role="note"
      className="flex items-center gap-3 rounded-md border border-[var(--status-info)]/40 bg-[var(--status-info)]/10 px-4 py-3 text-sm text-[var(--text-secondary)]"
    >
      <Eye className="h-4 w-4 shrink-0 text-[var(--status-info)]" aria-hidden />
      <span>
        <span className="font-semibold text-[var(--text-primary)]">Mode lihat-saja.</span>{' '}
        Anda login sebagai User — hanya Admin yang dapat menambah atau mengubah data.
      </span>
    </div>
  )
}
