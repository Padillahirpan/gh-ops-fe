import type { ReactNode } from 'react'

export interface TableRowActionsProps {
  children: ReactNode
}

export function TableRowActions({ children }: TableRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">{children}</div>
  )
}
