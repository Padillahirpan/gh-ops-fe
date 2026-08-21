import { subDays } from 'date-fns'
import type { HarvestEntry, HarvestRejectionBreakdown } from '@/types/harvest'
import type { SaleEntry } from '@/types/sale'
import type { Tandon, TandonId, TandonStatus } from '@/types/tandon'
import { createDefaultTandons } from '@/constants/tandonConfig'
import { formatISO } from '@/lib/dateUtils'
import {
  calculateAvgWeightG,
  calculateSuccessRate,
} from '@/lib/harvestCalculations'
import { calculateTotalValue } from '@/lib/salesCalculations'

function daysAgoISO(days: number): string {
  return formatISO(subDays(new Date(), days))
}

export interface DemoSeedPayload {
  tandons: Record<TandonId, Tandon>
  harvests: HarvestEntry[]
  sales: SaleEntry[]
}

function buildHarvest(
  id: string,
  tandonId: TandonId,
  daysAgo: number,
  totalWeightKg: number,
  totalPlants: number,
  rejected: number,
  reasons: HarvestRejectionBreakdown,
  notes: string | null,
): HarvestEntry {
  const date = daysAgoISO(daysAgo)
  return {
    id,
    tandonId,
    date,
    totalWeightKg,
    totalPlants,
    rejected,
    reasons,
    notes,
    avgWeightG: calculateAvgWeightG(totalWeightKg, totalPlants),
    successRate: calculateSuccessRate(totalPlants, rejected),
    createdAt: `${date}T08:00:00.000Z`,
  }
}

function buildSale(
  id: string,
  harvest: HarvestEntry,
  daysAgo: number,
  buyerCategory: SaleEntry['buyerCategory'],
  buyerName: string,
  soldVolumeKg: number,
  pricePerKg: number,
  paymentStatus: SaleEntry['paymentStatus'],
  unsoldAction: SaleEntry['unsoldAction'],
  notes: string | null = null,
): SaleEntry {
  const date = daysAgoISO(daysAgo)
  return {
    id,
    harvestId: harvest.id,
    tandonId: harvest.tandonId,
    date,
    buyerCategory,
    buyerName,
    soldVolumeKg,
    pricePerKg,
    totalValue: calculateTotalValue(soldVolumeKg, pricePerKg),
    paymentStatus,
    unsoldAction,
    notes,
    createdAt: `${date}T10:00:00.000Z`,
  }
}

export function createDemoSeedData(): DemoSeedPayload {
  const tandons = createDefaultTandons()

  // Staggered sowing: T1 @ HSS 40, T2 @ HSS 25, T3 @ HSS 10
  const sowing: Array<{ id: TandonId; daysAgo: number; status: TandonStatus }> = [
    { id: 'T1', daysAgo: 40, status: 'Growing' },
    { id: 'T2', daysAgo: 25, status: 'Growing' },
    { id: 'T3', daysAgo: 10, status: 'Growing' },
  ]
  for (const s of sowing) {
    tandons[s.id] = {
      ...tandons[s.id],
      sowingDate: daysAgoISO(s.daysAgo),
      status: s.status,
    }
  }

  const h1 = buildHarvest(
    'demo-h1', 'T1', 92, 218.4, 1050, 48,
    { tipBurn: 22, rootRot: 8, pests: 6, undersized: 9, other: 3 },
    'Siklus stabil, EC dijaga 1.6',
  )
  const h2 = buildHarvest(
    'demo-h2', 'T2', 78, 186.2, 1020, 95,
    { tipBurn: 41, rootRot: 22, pests: 12, undersized: 15, other: 5 },
    'Tip burn naik, cek kipas & kelembapan',
  )
  const h3 = buildHarvest(
    'demo-h3', 'T3', 64, 205.7, 1040, 36,
    { tipBurn: 12, rootRot: 7, pests: 9, undersized: 5, other: 3 },
    null,
  )
  const h4 = buildHarvest(
    'demo-h4', 'T1', 50, 198.1, 1035, 62,
    { tipBurn: 25, rootRot: 14, pests: 10, undersized: 8, other: 5 },
    'Hampir target, naikkan EC sedikit',
  )
  const h5 = buildHarvest(
    'demo-h5', 'T2', 36, 162.5, 1010, 118,
    { tipBurn: 52, rootRot: 31, pests: 18, undersized: 12, other: 5 },
    'Cuaca panas, root rot meningkat',
  )
  const h6 = buildHarvest(
    'demo-h6', 'T3', 22, 212.9, 1045, 29,
    { tipBurn: 9, rootRot: 6, pests: 7, undersized: 4, other: 3 },
    'Batch terbaik season ini',
  )

  const sales: SaleEntry[] = [
    buildSale('demo-s1', h1, 90, 'supermarket', 'FreshMarket Kemang', 120, 45000, 'paid', null),
    buildSale('demo-s2', h1, 88, 'restaurant', 'Bistro Selada', 48.5, 50000, 'paid', null),
    buildSale('demo-s3', h1, 85, 'wholesaler', 'Pak Darto', 40, 32000, 'dp', 'coldStorage', 'Sisa masuk chiller'),
    buildSale('demo-s4', h2, 76, 'supermarket', 'Ranch Market BSD', 95, 44000, 'paid', null),
    buildSale('demo-s5', h2, 73, 'wholesaler', 'Tengkulak Pasar Minggu', 60, 30000, 'tempo', 'clearance', 'Tempo 7 hari'),
    buildSale('demo-s6', h3, 62, 'supermarket', 'FreshMarket Kemang', 130, 46000, 'paid', null),
    buildSale('demo-s7', h3, 59, 'restaurant', 'Warung Hijau', 35.2, 52000, 'paid', null),
    buildSale('demo-s8', h4, 48, 'supermarket', 'Grand Lucky', 110, 45000, 'paid', null),
    buildSale('demo-s9', h4, 45, 'retail', 'Direct Customer (WhatsApp)', 22.3, 55000, 'paid', null),
    buildSale('demo-s10', h5, 34, 'wholesaler', 'Pak Darto', 80, 28000, 'dp', 'spoilage', 'Sebagian rusak, dibuang 8kg'),
    buildSale('demo-s11', h5, 31, 'restaurant', 'Cafe Daun', 30, 38000, 'tempo', null, 'Tempo 14 hari'),
    buildSale('demo-s12', h6, 20, 'supermarket', 'Ranch Market BSD', 140, 47000, 'paid', null),
    buildSale('demo-s13', h6, 17, 'retail', 'Direct Customer (WhatsApp)', 18.6, 58000, 'paid', null),
  ]

  return { tandons, harvests: [h1, h2, h3, h4, h5, h6], sales }
}
