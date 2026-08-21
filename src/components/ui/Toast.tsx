import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { ToastTone } from '@/types/ui'
import { useToastStore } from '@/store/useToastStore'

const TONE_CONFIG: Record<
  ToastTone,
  { icon: LucideIcon; color: string; label: string }
> = {
  success: { icon: CheckCircle2, color: 'var(--status-success)', label: 'Sukses' },
  error: { icon: AlertCircle, color: 'var(--status-danger)', label: 'Error' },
  warning: { icon: AlertTriangle, color: 'var(--status-warning)', label: 'Peringatan' },
  info: { icon: Info, color: 'var(--status-info)', label: 'Info' },
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismissToast = useToastStore((s) => s.dismissToast)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notifikasi"
    >
      <div aria-live="polite" aria-atomic="false" className="flex flex-col gap-2">
        {toasts.map((t) => {
          const config = TONE_CONFIG[t.tone]
          const Icon = config.icon
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-lg border bg-[var(--bg-surface)] p-4 shadow-lg"
              style={{ borderColor: config.color }}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: config.color }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Tutup notifikasi"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}
