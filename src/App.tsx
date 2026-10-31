import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import type { PageKey } from '@/types/ui'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ToastContainer } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { HarvestPage } from '@/features/harvest/HarvestPage'
import { SalesPage } from '@/features/sales/SalesPage'
import { CostPage } from '@/features/costs/CostPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { useAuthSession } from '@/features/auth/useAuth'
import { maybeAutoSeedDemoData } from '@/data/useSeedDemoData'
import { runMigrations } from '@/storage/storageMigration'
import { USE_API } from '@/api/client'
import { useDataSyncStore } from '@/store/useDataSyncStore'

const PAGE_TITLES: Record<PageKey, string> = {
  dashboard: 'Dashboard',
  calendar: 'Kalender Siklus',
  harvest: 'Panen',
  sales: 'Penjualan',
  costs: 'Biaya & Modal',
  settings: 'Pengaturan',
}

function renderPage(page: PageKey) {
  switch (page) {
    case 'dashboard':
      return <DashboardPage />
    case 'calendar':
      return <CalendarPage />
    case 'harvest':
      return <HarvestPage />
    case 'sales':
      return <SalesPage />
    case 'costs':
      return <CostPage />
    case 'settings':
      return <SettingsPage />
  }
}

function FullScreenMessage({
  label,
  error,
  onRetry,
}: {
  label: string
  error?: string | null
  onRetry?: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] p-6">
      {error ? (
        <div
          role="alert"
          className="w-full max-w-md space-y-4 rounded-lg border-2 border-[var(--status-danger)] bg-[var(--bg-surface)] p-6 text-center"
        >
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Gagal Memuat Data
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          <Button
            variant="primary"
            leftIcon={<RefreshCw className="h-4 w-4" aria-hidden />}
            onClick={onRetry}
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <p
          role="status"
          className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          {label}
        </p>
      )}
    </div>
  )
}

function MainApp() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')

  return (
    <AppLayout activePage={activePage} pageTitle={PAGE_TITLES[activePage]} onNavigate={setActivePage}>
      {renderPage(activePage)}
    </AppLayout>
  )
}

/** Mode API: login gate → tunggu data server siap → render aplikasi. */
function ApiApp() {
  const { user, isPending } = useAuthSession()
  const syncStatus = useDataSyncStore((s) => s.status)
  const syncError = useDataSyncStore((s) => s.error)
  const hydrate = useDataSyncStore((s) => s.hydrate)

  // Better Auth men-set isPending kembali ke true pada setiap refetch session
  // (mis. saat browser minimize lalu fokus lagi) selama user belum login.
  // Latch "pernah selesai dicek" agar LoginPage tidak di-unmount dan isi
  // form email/password tidak hilang. (set state saat render = pola resmi React)
  const [sessionCheckedOnce, setSessionCheckedOnce] = useState(false)
  if (!isPending && !sessionCheckedOnce) {
    setSessionCheckedOnce(true)
  }

  useEffect(() => {
    // Tarik data bisnis hanya setelah sesi valid (endpoint bisnis butuh login).
    if (user) void hydrate()
  }, [user, hydrate])

  if (!user) {
    return (
      <ErrorBoundary>
        {isPending && !sessionCheckedOnce ? (
          <FullScreenMessage label="Memeriksa sesi login…" />
        ) : (
          <LoginPage />
        )}
        <ToastContainer />
      </ErrorBoundary>
    )
  }

  if (syncStatus !== 'ready') {
    return (
      <ErrorBoundary>
        <FullScreenMessage
          label="Memuat data dari server…"
          error={syncStatus === 'error' ? syncError : null}
          onRetry={() => void hydrate()}
        />
        <ToastContainer />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <MainApp />
      <ToastContainer />
    </ErrorBoundary>
  )
}

/** Mode localStorage (demo tanpa server): perilaku lama tanpa login. */
function LocalApp() {
  useEffect(() => {
    runMigrations()
    maybeAutoSeedDemoData()
  }, [])

  return (
    <ErrorBoundary>
      <MainApp />
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default function App() {
  return USE_API ? <ApiApp /> : <LocalApp />
}
