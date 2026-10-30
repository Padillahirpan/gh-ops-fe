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
import { USE_API } from '@/api/client'
import { seladaApi } from '@/api/seladaOpsApi'
import type { SalePayload } from '@/api/seladaOpsApi'
import { calculateTotalValue } from '@/lib/salesCalculations'
import { appPersistStorage } from './persistStorage'

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
  addSale: (draft: SaleDraft) => Promise<SaleEntry>
  updateSale: (id: string, patch: Partial<SaleDraft>) => Promise<void>
  deleteSale: (id: string) => Promise<void>
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

function mergeDraft(existing: SaleEntry, patch: Partial<SaleDraft>): SaleDraft {
  return {
    harvestId: patch.harvestId ?? existing.harvestId,
    tandonId: patch.tandonId ?? existing.tandonId,
    date: patch.date ?? existing.date,
    buyerCategory: patch.buyerCategory ?? existing.buyerCategory,
    buyerName: patch.buyerName ?? existing.buyerName,
    soldVolumeKg: patch.soldVolumeKg ?? existing.soldVolumeKg,
    pricePerKg: patch.pricePerKg ?? existing.pricePerKg,
    paymentStatus: patch.paymentStatus ?? existing.paymentStatus,
    unsoldAction: patch.unsoldAction !== undefined ? patch.unsoldAction : existing.unsoldAction,
    notes: patch.notes !== undefined ? patch.notes : existing.notes,
  }
}

/** tandonId & totalValue tidak dikirim — keduanya diturunkan server dari batch panen. */
function toPayload(draft: SaleDraft): SalePayload {
  return {
    harvestId: draft.harvestId,
    date: draft.date,
    buyerCategory: draft.buyerCategory,
    buyerName: draft.buyerName,
    soldVolumeKg: draft.soldVolumeKg,
    pricePerKg: draft.pricePerKg,
    paymentStatus: draft.paymentStatus,
    unsoldAction: draft.unsoldAction,
    notes: draft.notes,
  }
}

export const useSaleStore = create<SaleState>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: async (draft) => {
        if (USE_API) {
          const entry = await seladaApi.createSale(toPayload(draft))
          set((state) => ({ sales: [...state.sales, entry] }))
          return entry
        }
        const entry = buildEntry(draft)
        set((state) => ({ sales: [...state.sales, entry] }))
        return entry
      },

      updateSale: async (id, patch) => {
        const existing = get().sales.find((s) => s.id === id)
        if (!existing) return
        const merged = mergeDraft(existing, patch)

        if (USE_API) {
          const updated = await seladaApi.updateSale(id, toPayload(merged))
          set((state) => ({
            sales: state.sales.map((s) => (s.id === id ? updated : s)),
          }))
          return
        }
        set((state) => ({
          sales: state.sales.map((s) =>
            s.id === id ? buildEntry(merged, existing) : s,
          ),
        }))
      },

      deleteSale: async (id) => {
        if (USE_API) {
          await seladaApi.deleteSale(id)
        }
        set((state) => ({ sales: state.sales.filter((s) => s.id !== id) }))
      },

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
    { name: STORAGE_KEYS.sales, storage: appPersistStorage },
  ),
)
