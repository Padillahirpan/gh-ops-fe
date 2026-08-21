import type { FontSizePreset } from '@/types/ui'
import { useUIStore } from '@/store/useUIStore'

const PRESETS: Array<{ key: FontSizePreset; label: string; scale: string }> = [
  { key: 'small', label: 'Kecil', scale: '0.85em' },
  { key: 'medium', label: 'Sedang', scale: '1em' },
  { key: 'large', label: 'Besar', scale: '1.2em' },
]

export function FontSizeToggle() {
  const fontSize = useUIStore((s) => s.fontSize)
  const setFontSize = useUIStore((s) => s.setFontSize)

  return (
    <div
      className="hidden items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1 md:flex"
      role="group"
      aria-label="Ukuran font"
    >
      {PRESETS.map((preset) => {
        const isActive = fontSize === preset.key
        return (
          <button
            key={preset.key}
            type="button"
            onClick={() => setFontSize(preset.key)}
            aria-pressed={isActive}
            title={`Ukuran font: ${preset.label}`}
            className={[
              'flex h-9 min-w-9 items-center justify-center rounded px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-tandon-t1)]/40',
              isActive
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            <span className="font-serif font-semibold" style={{ fontSize: preset.scale }}>
              A
            </span>
            <span className="sr-only">({preset.label})</span>
          </button>
        )
      })}
    </div>
  )
}
