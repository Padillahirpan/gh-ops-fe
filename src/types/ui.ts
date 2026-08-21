export type Theme = 'light' | 'dark'

export type FontSizePreset = 'small' | 'medium' | 'large'

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export interface ToastNotification {
  id: string
  title: string
  description?: string | undefined
  tone: ToastTone
  duration: number
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortState<TKey extends string = string> {
  key: TKey | null
  direction: SortDirection
}

export type PageKey =
  | 'dashboard'
  | 'calendar'
  | 'harvest'
  | 'sales'
  | 'settings'
