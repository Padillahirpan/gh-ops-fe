import type { BuyerCategory, PaymentStatus, UnsoldAction } from '@/types/sale'

export const BUYER_CATEGORIES: Array<{
  key: BuyerCategory
  label: string
  shortLabel: string
  icon: string
}> = [
  {
    key: 'supermarket',
    label: 'Supermarket / B2B',
    shortLabel: 'Supermarket',
    icon: '🏬',
  },
  {
    key: 'restaurant',
    label: 'Restaurant / Horeca',
    shortLabel: 'Horeca',
    icon: '🍽️',
  },
  {
    key: 'wholesaler',
    label: 'Wholesaler / Tengkulak',
    shortLabel: 'Tengkulak',
    icon: '🚚',
  },
  {
    key: 'retail',
    label: 'Direct Retail',
    shortLabel: 'Retail',
    icon: '🛒',
  },
]

export const PAYMENT_STATUS: Array<{
  key: PaymentStatus
  label: string
  shortLabel: string
  tone: 'success' | 'warning' | 'info'
}> = [
  { key: 'paid', label: 'Paid (Lunas)', shortLabel: 'Paid', tone: 'success' },
  { key: 'dp', label: 'DP (Uang Muka)', shortLabel: 'DP', tone: 'warning' },
  { key: 'tempo', label: 'Tempo (Hutang)', shortLabel: 'Tempo', tone: 'info' },
]

export const UNSOLD_ACTIONS: Array<{
  key: Exclude<UnsoldAction, null>
  label: string
  description: string
}> = [
  {
    key: 'coldStorage',
    label: 'Cold Storage',
    description: 'Simpan di chiller untuk dijual kemudian',
  },
  {
    key: 'clearance',
    label: 'Clearance Sale',
    description: 'Jual murah / promosi',
  },
  {
    key: 'spoilage',
    label: 'Spoilage / Rusak',
    description: 'Terbuang / tidak layak jual',
  },
]

export const DEFAULT_REVENUE_PER_HOLE_HOLES = 1000
