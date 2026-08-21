import type { TandonId } from './tandon'

export type HarvestRejectionReason =
  | 'tipBurn'
  | 'rootRot'
  | 'pests'
  | 'undersized'
  | 'other'

export interface HarvestRejectionBreakdown {
  tipBurn: number
  rootRot: number
  pests: number
  undersized: number
  other: number
}

export interface HarvestEntry {
  id: string
  tandonId: TandonId
  date: string
  totalWeightKg: number
  totalPlants: number
  rejected: number
  reasons: HarvestRejectionBreakdown
  notes: string | null
  avgWeightG: number
  successRate: number
  createdAt: string
}

export type HarvestBadgeTone = 'success' | 'warning' | 'danger'

export interface HarvestBadge {
  tone: HarvestBadgeTone
  label: string
  thresholdText: string
}
