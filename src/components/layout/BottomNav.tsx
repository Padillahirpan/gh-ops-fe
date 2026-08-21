import type { PageKey } from '@/types/ui'
import { NAV_ITEMS } from './navItems'

export interface BottomNavProps {
  activePage: PageKey
  onNavigate: (page: PageKey) => void
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-default)] bg-[var(--bg-surface)] lg:hidden"
      aria-label="Navigasi utama mobile"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.key
          const Icon = item.icon
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onNavigate(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex min-h-[56px] w-full flex-col items-center justify-center gap-1 py-2 text-xs',
                  isActive
                    ? 'text-[var(--color-tandon-t1)]'
                    : 'text-[var(--text-muted)]',
                ].join(' ')}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
