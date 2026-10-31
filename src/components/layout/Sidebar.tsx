import { UserRound } from 'lucide-react'
import type { PageKey } from '@/types/ui'
import { USE_API } from '@/api/client'
import { useAuthSession } from '@/features/auth/useAuth'
import { AppBrand, NAV_ITEMS } from './navItems'

export interface SidebarProps {
  activePage: PageKey
  onNavigate: (page: PageKey) => void
}

/** Info user login di kaki sidebar (icon-only saat collapse < xl). */
function SidebarUser() {
  const { user } = useAuthSession()

  if (!USE_API || !user) return null

  return (
    <div
      className="mx-2 mb-2 flex items-center gap-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-3 py-2.5"
      title={`${user.name} — ${user.role === 'admin' ? 'Admin' : 'User (lihat-saja)'}`}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
        aria-hidden
      >
        <UserRound className="h-4 w-4" />
      </span>
      <span className="hidden min-w-0 flex-col leading-tight xl:flex">
        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {user.name}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {user.role === 'admin' ? 'Admin' : 'User · lihat-saja'}
        </span>
      </span>
      <span className="sr-only">
        Login sebagai {user.name}, {user.email}, role{' '}
        {user.role === 'admin' ? 'Admin' : 'User'}
      </span>
    </div>
  )
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="hidden shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] lg:flex"
      aria-label="Navigasi utama"
    >
      <AppBrand collapsed={false} />

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-2">
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

      <SidebarUser />

      <p className="px-4 pb-4 text-xs text-[var(--text-muted)]">
        <span className="hidden xl:inline">v1.0.0 · Frontend</span>
        <span className="xl:hidden">v1</span>
      </p>
    </aside>
  )
}
