import { ThemeToggle } from './ThemeToggle'

export interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 bg-[var(--bg-surface)]/5 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <h1 className="truncate font-serif text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
