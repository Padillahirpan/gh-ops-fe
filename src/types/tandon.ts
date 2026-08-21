export type TandonId = 'T1' | 'T2' | 'T3'

export type TandonStatus = 'Empty' | 'Growing' | 'Sanitizing'

export interface Tandon {
  id: TandonId
  name: string
  greenhouse: string
  batchCode: string
  holes: number
  sowingDate: string | null
  status: TandonStatus
  color: string
}
