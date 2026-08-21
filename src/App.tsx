import { useEffect, useState } from 'react'
import type { PageKey } from '@/types/ui'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ToastContainer } from '@/components/ui/Toast'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { HarvestPage } from '@/features/harvest/HarvestPage'
import { SalesPage } from '@/features/sales/SalesPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { maybeAutoSeedDemoData } from '@/data/useSeedDemoData'
import { runMigrations } from '@/storage/storageMigration'

const PAGE_TITLES: Record<PageKey, string> = {
  dashboard: 'Dashboard',
  calendar: 'Kalender Siklus',
  harvest: 'Panen',
  sales: 'Penjualan',
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
    case 'settings':
      return <SettingsPage />
  }
}

function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')

  useEffect(() => {
    runMigrations()
    maybeAutoSeedDemoData()
  }, [])

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
