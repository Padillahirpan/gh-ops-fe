import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, Bug } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReportBug = () => {
    const { error } = this.state
    const message = `Bug report — Selada Ops\n\nError: ${error?.message ?? 'unknown'}\nStack: ${error?.stack?.slice(0, 500) ?? '-'}`
    window.location.href = `mailto:support@seladaops.example?subject=${encodeURIComponent('Selada Ops Bug Report')}&body=${encodeURIComponent(message)}`
  }

  override render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] p-6">
        <div className="w-full max-w-md rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center">
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--status-danger) 15%, transparent)',
              color: 'var(--status-danger)',
            }}
          >
            <AlertTriangle className="h-7 w-7" aria-hidden />
          </span>

          <h1 className="mt-4 font-serif text-2xl font-bold text-[var(--text-primary)]">
            Terjadi Kesalahan
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Aplikasi mengalami error yang tidak terduga. Data Anda aman — tersimpan
            lokal di browser.
          </p>

          {this.state.error && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-md bg-[var(--bg-surface-hover)] p-3 text-left font-mono text-xs text-[var(--status-danger)]">
              {this.state.error.message}
            </pre>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="h-11 rounded-md bg-[var(--color-tandon-t1)] px-6 text-sm font-medium text-white transition-all hover:brightness-110"
            >
              Muat Ulang Aplikasi
            </button>
            <button
              type="button"
              onClick={this.handleReportBug}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] px-6 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-hover)]"
            >
              <Bug className="h-4 w-4" aria-hidden />
              Laporkan Bug
            </button>
          </div>
        </div>
      </div>
    )
  }
}
