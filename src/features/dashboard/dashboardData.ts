import { useMemo } from 'react'
import { subDays } from 'date-fns'
import type { HarvestEntry } from '@/types/harvest'
import type { SaleEntry } from '@/types/sale'
import type { TandonId } from '@/types/tandon'
import { TANDON_IDS } from '@/constants/tandonConfig'
import { formatISO } from '@/lib/dateUtils'

export type DashboardRangeKey = '30' | '90' | 'all'

export interface DashboardFilters {
  range: DashboardRangeKey
  tandonId: TandonId | 'all'
}

export function filterByRange<T extends { date: string; tandonId?: TandonId }>(
  items: T[],
  filters: DashboardFilters,
): T[] {
  const today = formatISO(new Date())
  const from = filters.range === 'all' ? '0000-01-01' : formatISO(subDays(new Date(), Number(filters.range)))
  return items.filter((item) => {
    if (item.date < from || item.date > today) return false
    if (filters.tandonId !== 'all' && item.tandonId && item.tandonId !== filters.tandonId)
      return false
    return true
  })
}

export interface DashboardAggregates {
  totalHarvestKg: number
  avgWeightG: number
  avgWeightBadgeTone: 'success' | 'warning' | 'danger'
  totalRevenue: number
  successRate: number
  readyStockKg: number
  harvestCount: number
  rejectionTotals: {
    tipBurn: number
    rootRot: number
    pests: number
    undersized: number
    other: number
  }
  buyerTotals: Record<string, number>
  weightTrend: Array<{
    date: string
    label: string
    [tandon: string]: string | number
  }>
  harvestVsSold: Array<{
    tandon: string
    Panen: number
    Terjual: number
  }>
  revenuePerTandon: Array<{
    tandon: string
    revenue: number
  }>
  hasData: boolean
}

function resolveTandonColor(id: TandonId): string {
  if (id === 'T1') return '#4C8DC4'
  if (id === 'T2') return '#4FA772'
  return '#9B7FD1'
}

export function computeDashboardAggregates(
  harvests: HarvestEntry[],
  sales: SaleEntry[],
  filters: DashboardFilters,
): DashboardAggregates {
  const filteredHarvests = filterByRange(harvests, filters)
  const filteredSales = filterByRange(sales, filters)

  const harvestIds = new Set(filteredHarvests.map((h) => h.id))
  const validSales = filteredSales.filter((s) => harvestIds.has(s.harvestId))

  const totalHarvestKg = filteredHarvests.reduce((sum, h) => sum + h.totalWeightKg, 0)
  const totalPlants = filteredHarvests.reduce((sum, h) => sum + h.totalPlants, 0)
  const totalRejected = filteredHarvests.reduce((sum, h) => sum + h.rejected, 0)
  const totalWeightedSum = filteredHarvests.reduce(
    (sum, h) => sum + h.avgWeightG * h.totalPlants,
    0,
  )
  const avgWeightG = totalPlants > 0 ? totalWeightedSum / totalPlants : 0
  const successRate = totalPlants > 0 ? ((totalPlants - totalRejected) / totalPlants) * 100 : 0

  const totalRevenue = validSales
    .filter((s) => s.paymentStatus === 'paid' || s.paymentStatus === 'dp')
    .reduce((sum, s) => sum + s.totalValue, 0)

  const totalSoldKg = validSales.reduce((sum, s) => sum + s.soldVolumeKg, 0)
  const readyStockKg = Math.max(0, totalHarvestKg - totalSoldKg)

  const rejectionTotals = filteredHarvests.reduce(
    (acc, h) => ({
      tipBurn: acc.tipBurn + h.reasons.tipBurn,
      rootRot: acc.rootRot + h.reasons.rootRot,
      pests: acc.pests + h.reasons.pests,
      undersized: acc.undersized + h.reasons.undersized,
      other: acc.other + h.reasons.other,
    }),
    { tipBurn: 0, rootRot: 0, pests: 0, undersized: 0, other: 0 },
  )

  const buyerTotals = validSales.reduce<Record<string, number>>((acc, s) => {
    acc[s.buyerCategory] = (acc[s.buyerCategory] ?? 0) + s.totalValue
    return acc
  }, {})

  const weightTrend = [...filteredHarvests]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((h) => ({
      date: h.date,
      label: h.date.slice(5),
      [h.tandonId]: Math.round(h.avgWeightG),
    }))

  const harvestVsSold = TANDON_IDS.map((id) => {
    const tHarvests = filteredHarvests.filter((h) => h.tandonId === id)
    const tIds = new Set(tHarvests.map((h) => h.id))
    const tSold = validSales
      .filter((s) => tIds.has(s.harvestId))
      .reduce((sum, s) => sum + s.soldVolumeKg, 0)
    const tHarvestKg = tHarvests.reduce((sum, h) => sum + h.totalWeightKg, 0)
    return {
      tandon: id,
      Panen: Math.round(tHarvestKg * 10) / 10,
      Terjual: Math.round(tSold * 10) / 10,
    }
  })

  const revenuePerTandon = TANDON_IDS.map((id) => {
    const tIds = new Set(
      filteredHarvests.filter((h) => h.tandonId === id).map((h) => h.id),
    )
    const revenue = validSales
      .filter((s) => tIds.has(s.harvestId))
      .reduce((sum, s) => sum + s.totalValue, 0)
    return { tandon: id, revenue }
  })

  return {
    totalHarvestKg,
    avgWeightG,
    avgWeightBadgeTone:
      avgWeightG >= 200 ? 'success' : avgWeightG >= 170 ? 'warning' : 'danger',
    totalRevenue,
    successRate,
    readyStockKg,
    harvestCount: filteredHarvests.length,
    rejectionTotals,
    buyerTotals,
    weightTrend,
    harvestVsSold,
    revenuePerTandon,
    hasData: filteredHarvests.length > 0 || filteredSales.length > 0,
  }
}

export function useTandonColors(): Record<string, string> {
  return useMemo(
    () =>
      Object.fromEntries(TANDON_IDS.map((id) => [id, resolveTandonColor(id)])),
    [],
  )
}
