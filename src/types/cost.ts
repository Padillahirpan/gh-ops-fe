import type { TandonId } from './tandon'

export type CostType = 'operasional' | 'modal'

export type CostTarget = TandonId | 'UMUM'

export type CostCategory =
  | 'benihRockwool'
  | 'nutrisi'
  | 'pestisida'
  | 'listrikAir'
  | 'tenagaKerja'
  | 'kemasanTransportasi'
  | 'peralatanMesin'
  | 'perbaikan'
  | 'lainLain'

export interface CostEntry {
  id: string
  date: string
  type: CostType
  category: CostCategory
  description: string
  /** Nominal rupiah final (qty × harga satuan bila keduanya diisi — dihitung server). */
  amount: number
  target: CostTarget
  supplier: string | null
  notes: string | null
  quantity: number | null
  unitPrice: number | null
  /** Modal & Aset: 1 = dibebankan penuh ke siklus anchor, N > 1 = disebar ke N siklus. */
  spreadCycles: number
  /** Penempatan manual ke batch panen; null = otomatis dari tandon + tanggal. */
  cycleId: string | null
  createdAt: string
  updatedAt: string
}

/** Respon `GET /costs` — ditambah hasil pengelompokan batch dari server. */
export type CostEntryView = CostEntry & { assignedCycleId: string | null }

/** Batch panen = satu siklus tanam tandon (HSS 0 s.d. sanitasi selesai HSS 47). */
export interface CycleBatch {
  id: string
  tandonId: TandonId
  sowingDate: string
  cycleEndDate: string
  batchCode: string
  status: 'Berjalan' | 'Selesai'
  /** true bila batch disintesis server dari panen lama tanpa record siklus. */
  implicit: boolean
  createdAt: string | null
}

export interface CostShareItem {
  costId: string
  date: string
  type: CostType
  category: CostCategory
  description: string
  supplier: string | null
  /** Target asli pada entri biaya (T1/T2/T3/UMUM). */
  sourceTarget: CostTarget
  /** Tandon penerima porsi (untuk pembagian biaya Umum). */
  shareTandonId: TandonId | null
  isUmumShare: boolean
  /** Porsi rupiah yang dibebankan ke batch ini. */
  chargedAmount: number
  originalAmount: number
  spreadIndex: number | null
  spreadTotal: number
}

export interface UnassignedCostItem extends CostShareItem {
  reason: string
}

export interface BatchCostSummary {
  cycleId: string
  tandonId: TandonId
  batchCode: string
  sowingDate: string
  cycleEndDate: string
  status: 'Berjalan' | 'Selesai'
  implicit: boolean
  operationalCost: number
  modalCost: number
  totalCost: number
  harvestCount: number
  totalHarvestKg: number
  hasHarvest: boolean
  costPerKg: number
  costPerHole: number
  revenue: number
  grossProfit: number
  marginPercent: number
  breakEvenPricePerKg: number
  avgSellingPricePerKg: number | null
  belowBreakEven: boolean
  costItemCount: number
  categoryTotals: Record<CostCategory, number>
}

export interface BatchCostDetail extends BatchCostSummary {
  items: CostShareItem[]
  harvestIds: string[]
}

export interface CostingTotals {
  batchCount: number
  operationalCost: number
  modalCost: number
  totalCost: number
  totalHarvestKg: number
  costPerKg: number
  costPerHole: number
  revenue: number
  grossProfit: number
  marginPercent: number
  breakEvenPricePerKg: number
  avgSellingPricePerKg: number | null
  belowBreakEvenBatchCount: number
  unassignedCost: number
  unassignedCount: number
}

export interface CostingOverview {
  filters: { tandonId: 'all' | TandonId }
  totals: CostingTotals
  batches: BatchCostSummary[]
  unassignedItems: UnassignedCostItem[]
}
