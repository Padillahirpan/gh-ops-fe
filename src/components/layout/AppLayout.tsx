import type { ReactNode } from 'react'
import type { PageKey } from '@/types/ui'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

export interface AppLayoutProps {
  activePage: PageKey
  pageTitle: string
  onNavigate: (page: PageKey) => void
  children: ReactNode
}

export function AppLayout({
  activePage,
  pageTitle,
  onNavigate,
  children,
}: AppLayoutProps) {
  return (
    // App shell: tinggi viewport terkunci — sidebar & TopBar tetap di tempat,
    // hanya <main> yang scroll (overflow-y-auto).
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)]">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={pageTitle} />
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6 lg:px-6 lg:pb-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <BottomNav activePage={activePage} onNavigate={onNavigate} />
    </div>
  )
}
