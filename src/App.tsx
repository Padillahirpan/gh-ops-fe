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

function ApiBootScreen() {
  const status = useDataSyncStore((s) => s.status)
  const error = useDataSyncStore((s) => s.error)
  const hydrate = useDataSyncStore((s) => s.hydrate)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] p-6">
      {status === 'error' ? (
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
            onClick={() => void hydrate()}
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
          Memuat data dari server…
        </p>
      )}
    </div>
  )
}

function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const syncStatus = useDataSyncStore((s) => s.status)
  const hydrate = useDataSyncStore((s) => s.hydrate)

  useEffect(() => {
    if (USE_API) {
      void hydrate()
      return
    }
    runMigrations()
    maybeAutoSeedDemoData()
  }, [hydrate])

  // Mode API: jangan render halaman sebelum data dari server siap
  if (USE_API && syncStatus !== 'ready') {
    return (
      <ErrorBoundary>
        <ApiBootScreen />
        <ToastContainer />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <AppLayout
        activePage={activePage}
        pageTitle={PAGE_TITLES[activePage]}
        onNavigate={setActivePage}
      >
        {renderPage(activePage)}
      </AppLayout>
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App
