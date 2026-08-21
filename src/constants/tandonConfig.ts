import type { Tandon, TandonId, TandonStatus } from '@/types/tandon'

export const TANDON_IDS: TandonId[] = ['T1', 'T2', 'T3']

export interface TandonConfigEntry {
  id: TandonId
  name: string
  greenhouse: string
  batchCode: string
  holes: number
  color: string
  initialStatus: TandonStatus
}

export const TANDON_CONFIG: Record<TandonId, TandonConfigEntry> = {
  T1: {
    id: 'T1',
    name: 'Tandon 1',
    greenhouse: 'GH 1',
    batchCode: 'Batch A',
    holes: 1000,
    color: 'var(--color-tandon-t1)',
    initialStatus: 'Empty',
  },
  T2: {
    id: 'T2',
    name: 'Tandon 2',
    greenhouse: 'GH 2 Zona A',
    batchCode: 'Batch B',
    holes: 1000,
    color: 'var(--color-tandon-t2)',
    initialStatus: 'Empty',
  },
  T3: {
    id: 'T3',
    name: 'Tandon 3',
    greenhouse: 'GH 2 Zona B',
    batchCode: 'Batch C',
    holes: 1000,
    color: 'var(--color-tandon-t3)',
    initialStatus: 'Empty',
  },
}

export const TANDON_STATUS_LABEL: Record<TandonStatus, string> = {
  Empty: 'Kosong',
  Growing: 'Tumbuh',
  Sanitizing: 'Sanitasi',
}

export function createDefaultTandon(id: TandonId): Tandon {
  const cfg = TANDON_CONFIG[id]
  return {
    id,
    name: cfg.name,
    greenhouse: cfg.greenhouse,
    batchCode: cfg.batchCode,
    holes: cfg.holes,
    sowingDate: null,
    status: cfg.initialStatus,
    color: cfg.color,
  }
}

export function createDefaultTandons(): Record<TandonId, Tandon> {
  return {
    T1: createDefaultTandon('T1'),
    T2: createDefaultTandon('T2'),
    T3: createDefaultTandon('T3'),
  }
}
