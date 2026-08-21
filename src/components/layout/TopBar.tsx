import { UserRound } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { FontSizeToggle } from './FontSizeToggle'

export interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <h1 className="truncate font-serif text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>

        <div className="flex items-center gap-2">
          <FontSizeToggle />
          <ThemeToggle />
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
            title="Operator"
          >
            <UserRound className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </div>
    </header>
  )
}
