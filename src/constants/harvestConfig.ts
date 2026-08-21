import type {
  HarvestBadge,
  HarvestRejectionBreakdown,
  HarvestRejectionReason,
} from '@/types/harvest'

export const HARVEST_BADGE_THRESHOLDS: Array<{
  minG: number | null
  maxG: number | null
  badge: HarvestBadge
}> = [
  {
    minG: 200,
    maxG: null,
    badge: {
      tone: 'success',
      label: 'Target Tercapai',
      thresholdText: '≥ 200g',
    },
  },
  {
    minG: 170,
    maxG: 199,
    badge: {
      tone: 'warning',
      label: 'Perlu Perhatian',
      thresholdText: '170–199g',
    },
  },
  {
    minG: null,
    maxG: 169,
    badge: {
      tone: 'danger',
      label: 'Dibawah Target',
      thresholdText: '< 170g',
    },
  },
]

export const TARGET_AVG_WEIGHT_G = 200

export const HARVEST_REJECTION_REASONS: Array<{
  key: HarvestRejectionReason
  label: string
  description: string
}> = [
  {
    key: 'tipBurn',
    label: 'Tip Burn',
    description: 'Ujung daun hangus/coklat',
  },
  {
    key: 'rootRot',
    label: 'Root Rot',
    description: 'Akar busuk / coklat kehitaman',
  },
  {
    key: 'pests',
    label: 'Hama',
    description: 'Serangan ulat / kutu / jamur',
  },
  {
    key: 'undersized',
    label: 'Undersized',
    description: 'Terlalu kecil / tidak berkembang',
  },
  {
    key: 'other',
    label: 'Lainnya',
    description: 'Alasan lain (isi catatan)',
  },
]

export function createEmptyRejectionBreakdown(): HarvestRejectionBreakdown {
  return {
    tipBurn: 0,
    rootRot: 0,
    pests: 0,
    undersized: 0,
    other: 0,
  }
}

export function sumRejectionBreakdown(b: HarvestRejectionBreakdown): number {
  return b.tipBurn + b.rootRot + b.pests + b.undersized + b.other
}
