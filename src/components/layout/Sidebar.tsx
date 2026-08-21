import type { PageKey } from '@/types/ui'
import { AppBrand, NAV_ITEMS } from './navItems'

export interface SidebarProps {
  activePage: PageKey
  onNavigate: (page: PageKey) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="hidden shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] lg:flex"
      aria-label="Navigasi utama"
    >
      <AppBrand collapsed={false} />

      <nav className="mt-2 flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'flex h-11 w-full items-center gap-3 rounded-md border-l-[3px] px-3 text-sm font-medium transition-colors',
                'xl:w-auto',
                isActive
                  ? 'border-[var(--color-tandon-t1)] bg-[var(--bg-surface-hover)] text-[var(--color-tandon-t1)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="hidden xl:inline">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <p className="px-4 pb-4 text-xs text-[var(--text-muted)]">
        <span className="hidden xl:inline">v1.0.0 · Frontend</span>
        <span className="xl:hidden">v1</span>
      </p>
    </aside>
  )
}
