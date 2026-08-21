import {
  LayoutDashboard,
  CalendarDays,
  Wheat,
  ShoppingCart,
  Settings,
  Sprout,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PageKey } from '@/types/ui'

export interface NavItem {
  key: PageKey
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'calendar', label: 'Kalender', icon: CalendarDays },
  { key: 'harvest', label: 'Panen', icon: Wheat },
  { key: 'sales', label: 'Penjualan', icon: ShoppingCart },
  { key: 'settings', label: 'Pengaturan', icon: Settings },
]

export function AppBrand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lettuce/15 text-brand-lettuce ring-1 ring-brand-lettuce/30">
        <Sprout className="h-5 w-5" strokeWidth={2.2} aria-hidden />
      </span>
      {!collapsed && (
        <div className="leading-tight">
          <p className="font-serif text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Selada Ops
          </p>
          <p className="text-xs text-[var(--text-muted)]">Hydroponic Management</p>
        </div>
      )}
    </div>
  )
}
