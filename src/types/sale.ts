import type { TandonId } from './tandon'

export type BuyerCategory =
  | 'supermarket'
  | 'restaurant'
  | 'wholesaler'
  | 'retail'

export type PaymentStatus = 'paid' | 'dp' | 'tempo'

export type UnsoldAction = 'coldStorage' | 'clearance' | 'spoilage' | null

export interface SaleEntry {
  id: string
  harvestId: string
  tandonId: TandonId
  date: string
  buyerCategory: BuyerCategory
  buyerName: string
  soldVolumeKg: number
  pricePerKg: number
  totalValue: number
  paymentStatus: PaymentStatus
  unsoldAction: UnsoldAction
  notes: string | null
  createdAt: string
}
