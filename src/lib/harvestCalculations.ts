import type { HarvestBadge } from '@/types/harvest'
import {
  HARVEST_BADGE_THRESHOLDS, TARGET_AVG_WEIGHT_G } from '@/constants/harvestConfig'

export function calculateAvgWeightG(
  totalWeightKg: number,
  totalPlants: number,
): number {
  if (totalPlants <= 0 || totalWeightKg <= 0) return 0
  return (totalWeightKg * 1000) / totalPlants
}

export function calculateSuccessRate(
  totalPlants: number,
  rejected: number,
): number {
  if (totalPlants <= 0) return 0
  const valid = Math.max(0, totalPlants - rejected)
  return (valid / totalPlants) * 100
}

export function getWeightBadge(avgWeightG: number): HarvestBadge {
  for (const rule of HARVEST_BADGE_THRESHOLDS) {
    const { minG, maxG, badge } = rule
    const meetsMin = minG === null || avgWeightG >= minG
    const meetsMax = maxG === null || avgWeightG <= maxG
    if (meetsMin && meetsMax) return badge
  }
  return HARVEST_BADGE_THRESHOLDS[HARVEST_BADGE_THRESHOLDS.length - 1].badge
}

export function getDeltaVsTarget(avgWeightG: number): number {
  if (avgWeightG <= 0) return 0
  return avgWeightG - TARGET_AVG_WEIGHT_G
}

export function calculateTotalValidPlants(
  totalPlants: number,
  rejected: number,
): number {
  return Math.max(0, totalPlants - rejected)
}
