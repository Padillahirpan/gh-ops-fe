import { DEFAULT_REVENUE_PER_HOLE_HOLES } from '@/constants/salesConfig'
import type { HarvestEntry } from '@/types/harvest'
import type { SaleEntry } from '@/types/sale'

export function calculateTotalValue(
  soldVolumeKg: number,
  pricePerKg: number,
): number {
  if (soldVolumeKg <= 0 || pricePerKg <= 0) return 0
  return Math.round(soldVolumeKg * pricePerKg)
}

export function calculateRevenuePerHole(
  totalRevenueBatch: number,
  totalHoles: number = DEFAULT_REVENUE_PER_HOLE_HOLES,
): number {
  if (totalHoles <= 0) return 0
  return Math.round(totalRevenueBatch / totalHoles)
}

export function calculateHarvestToCashRatio(
  totalSoldKg: number,
  totalHarvestKg: number,
): number {
  if (totalHarvestKg <= 0) return 0
  return Math.min(100, (totalSoldKg / totalHarvestKg) * 100)
}

export function calculateRemainingStockKg(
  harvest: HarvestEntry | undefined,
  sales: SaleEntry[],
): number {
  if (!harvest) return 0
  const sold = sales
    .filter((s) => s.harvestId === harvest.id)
    .reduce((sum, s) => sum + s.soldVolumeKg, 0)
  return Math.max(0, harvest.totalWeightKg - sold)
}

export function sumSalesRevenueByStatus(
  sales: SaleEntry[],
  statuses?: Array<SaleEntry['paymentStatus']>,
): number {
  return sales
    .filter((s) => !statuses || statuses.includes(s.paymentStatus))
    .reduce((sum, s) => {
      if (s.paymentStatus === 'paid') return sum + s.totalValue
      if (s.paymentStatus === 'dp') return sum + Math.round(s.totalValue * 0.5)
      return sum
    }, 0)
}
