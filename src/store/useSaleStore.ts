import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BuyerCategory,
  PaymentStatus,
  SaleEntry,
  UnsoldAction,
} from '@/types/sale'
import type { TandonId } from '@/types/tandon'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { calculateTotalValue } from '@/lib/salesCalculations'

export interface SaleDraft {
  harvestId: string
  tandonId: TandonId
  date: string
  buyerCategory: BuyerCategory
  buyerName: string
  soldVolumeKg: number
  pricePerKg: number
  paymentStatus: PaymentStatus
  unsoldAction: UnsoldAction
  notes: string | null
}

interface SaleState {
  sales: SaleEntry[]
  addSale: (draft: SaleDraft) => SaleEntry
  updateSale: (id: string, patch: Partial<SaleDraft>) => void
  deleteSale: (id: string) => void
  getSalesByHarvest: (harvestId: string) => SaleEntry[]
  getSalesByTandon: (tandonId: TandonId) => SaleEntry[]
  replaceAll: (sales: SaleEntry[]) => void
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildEntry(draft: SaleDraft, existing?: SaleEntry): SaleEntry {
  return {
    id: existing?.id ?? generateId(),
    harvestId: draft.harvestId,
    tandonId: draft.tandonId,
    date: draft.date,
    buyerCategory: draft.buyerCategory,
    buyerName: draft.buyerName,
    soldVolumeKg: draft.soldVolumeKg,
    pricePerKg: draft.pricePerKg,
    totalValue: calculateTotalValue(draft.soldVolumeKg, draft.pricePerKg),
    paymentStatus: draft.paymentStatus,
    unsoldAction: draft.unsoldAction,
    notes: draft.notes,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }
}

export const useSaleStore = create<SaleState>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: (draft) => {
        const entry = buildEntry(draft)
        set((state) => ({ sales: [...state.sales, entry] }))
        return entry
      },

      updateSale: (id, patch) =>
        set((state) => ({
          sales: state.sales.map((s) => {
            if (s.id !== id) return s
            const merged: SaleDraft = {
              harvestId: patch.harvestId ?? s.harvestId,
              tandonId: patch.tandonId ?? s.tandonId,
              date: patch.date ?? s.date,
              buyerCategory: patch.buyerCategory ?? s.buyerCategory,
              buyerName: patch.buyerName ?? s.buyerName,
              soldVolumeKg: patch.soldVolumeKg ?? s.soldVolumeKg,
              pricePerKg: patch.pricePerKg ?? s.pricePerKg,
              paymentStatus: patch.paymentStatus ?? s.paymentStatus,
              unsoldAction: patch.unsoldAction !== undefined ? patch.unsoldAction : s.unsoldAction,
              notes: patch.notes !== undefined ? patch.notes : s.notes,
            }
            return buildEntry(merged, s)
          }),
        })),

      deleteSale: (id) =>
        set((state) => ({ sales: state.sales.filter((s) => s.id !== id) })),

      getSalesByHarvest: (harvestId) =>
        get()
          .sales.filter((s) => s.harvestId === harvestId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      getSalesByTandon: (tandonId) =>
        get()
          .sales.filter((s) => s.tandonId === tandonId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      replaceAll: (sales) => set({ sales }),
    }),
    { name: STORAGE_KEYS.sales },
  ),
)
