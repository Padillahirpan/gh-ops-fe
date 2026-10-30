import { apiFetch } from './client'
import type { Tandon, TandonId, TandonStatus } from '@/types/tandon'
import type { HarvestEntry, HarvestRejectionBreakdown } from '@/types/harvest'
import type {
  BuyerCategory,
  PaymentStatus,
  SaleEntry,
  UnsoldAction,
} from '@/types/sale'
import type {
  BatchCostDetail,
  CostCategory,
  CostEntryView,
  CostTarget,
  CostType,
  CostingOverview,
  CycleBatch,
} from '@/types/cost'

/**
 * Payload create/update panen — 1:1 dengan Zod schema backend.
 * Field turunan (id, avgWeightG, successRate, createdAt) dihitung server.
 */
export interface HarvestPayload {
  tandonId: TandonId
  date: string
  totalWeightKg: number
  totalPlants: number
  rejected: number
  reasons: HarvestRejectionBreakdown
  notes: string | null
}

/**
 * Payload create/update penjualan — `tandonId` & `totalValue` diturunkan server
 * dari batch panen, jangan dikirim.
 */
export interface SalePayload {
  harvestId: string
  date: string
  buyerCategory: BuyerCategory
  buyerName: string
  soldVolumeKg: number
  pricePerKg: number
  paymentStatus: PaymentStatus
  unsoldAction: UnsoldAction
  notes: string | null
}

export interface TandonPatch {
  sowingDate?: string | null
  status?: TandonStatus
}

/**
 * Payload create/update biaya — 1:1 dengan Zod schema backend.
 * `amount` opsional bila `quantity` + `unitPrice` terisi (dihitung server).
 * Field opsional undefined = tidak diubah (PATCH), null = dikosongkan.
 */
export interface CostPayload {
  date?: string | undefined
  type?: CostType | undefined
  category?: CostCategory | undefined
  description?: string | undefined
  amount?: number | undefined
  target?: CostTarget | undefined
  supplier?: string | null | undefined
  notes?: string | null | undefined
  quantity?: number | null | undefined
  unitPrice?: number | null | undefined
  spreadCycles?: number | undefined
  cycleId?: string | null | undefined
}

function tandonsToRecord(list: Tandon[]): Record<TandonId, Tandon> {
  const record = {} as Record<TandonId, Tandon>
  for (const t of list) record[t.id] = t
  return record
}

export const seladaApi = {
  // Tandons
  listTandons: () => apiFetch<Tandon[]>('/tandons'),
  patchTandon: (id: TandonId, body: TandonPatch) =>
    apiFetch<Tandon>(`/tandons/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  resetTandon: (id: TandonId) =>
    apiFetch<Tandon>(`/tandons/${id}/reset`, { method: 'POST' }),

  // Harvests
  listHarvests: () => apiFetch<HarvestEntry[]>('/harvests'),
  createHarvest: (payload: HarvestPayload) =>
    apiFetch<HarvestEntry>('/harvests', { method: 'POST', body: JSON.stringify(payload) }),
  updateHarvest: (id: string, payload: HarvestPayload) =>
    apiFetch<HarvestEntry>(`/harvests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteHarvest: (id: string) =>
    apiFetch<void>(`/harvests/${id}`, { method: 'DELETE' }),

  // Sales
  listSales: () => apiFetch<SaleEntry[]>('/sales'),
  createSale: (payload: SalePayload) =>
    apiFetch<SaleEntry>('/sales', { method: 'POST', body: JSON.stringify(payload) }),
  updateSale: (id: string, payload: SalePayload) =>
    apiFetch<SaleEntry>(`/sales/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteSale: (id: string) => apiFetch<void>(`/sales/${id}`, { method: 'DELETE' }),

  // Costs (Biaya & Modal)
  listCosts: () => apiFetch<CostEntryView[]>('/costs'),
  createCost: (payload: CostPayload) =>
    apiFetch<CostEntryView>('/costs', { method: 'POST', body: JSON.stringify(payload) }),
  updateCost: (id: string, payload: CostPayload) =>
    apiFetch<CostEntryView>(`/costs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteCost: (id: string) => apiFetch<void>(`/costs/${id}`, { method: 'DELETE' }),

  // Cycles (batch panen) & costing
  listCycles: (tandonId?: TandonId) =>
    apiFetch<CycleBatch[]>(tandonId ? `/cycles?tandonId=${tandonId}` : '/cycles'),
  getCostingOverview: (tandonId: 'all' | TandonId = 'all') =>
    apiFetch<CostingOverview>(`/costing/overview?tandonId=${tandonId}`),
  getBatchCosting: (cycleId: string) =>
    apiFetch<BatchCostDetail>(`/costing/batches/${cycleId}`),
}

export { tandonsToRecord }
