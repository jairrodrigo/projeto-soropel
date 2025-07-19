// Tipos específicos para Nova Bobina
export interface ProcessedBobinaData {
  codigo: string
  tipoPapel: string
  gramatura: string
  fornecedor: string
  pesoInicial: number
}

export interface BobinaFormData {
  codigoBobina: string
  dataEntrada: string
  tipoPapel: string
  gramatura: string
  fornecedor: string
  pesoInicial: number
  pesoAtual: number
  status: BobinaStatus
  maquinaAtual?: string
  produtoProducao?: string
  pesoSobra?: number
  obsSobra?: string
  observacoes: string
}

export type BobinaStatus = 'estoque' | 'em-maquina' | 'sobra' | 'acabou'

export interface ProcessingStep {
  id: number
  label: string
  status: 'pending' | 'active' | 'completed'
}

export interface CameraState {
  isActive: boolean
  isReady: boolean
  hasImage: boolean
}

export interface FormState {
  isProcessing: boolean
  hasExtractedData: boolean
  currentStep: number
}

export interface NotificationData {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export interface RecentBobina {
  id: string
  codigo: string
  tipoPapel: string
  gramatura: string
  fornecedor: string
  peso: number
  status: BobinaStatus
  timestamp: string
  maquina?: string
  produto?: string
}

// Opções para os selects/datalists
export const TIPOS_PAPEL = [
  'MIX32', 'MIX39', 'MIX45', 'MIX52', 'MIX58', 'MIX65',
  'IRANI32', 'IRANI39', 'IRANI45', 'IRANI52', 'IRANI58', 'IRANI65',
  'BRANCO32', 'BRANCO45', 'BRANCO52', 'BRANCO58', 'BRANCO65',
  'PILAR32', 'PILAR39', 'PILAR45', 'PILAR52', 'PILAR58', 'PILAR65',
  'MONO17', 'MONO25', 'MONO28', 'MONO32', 'MONO38'
] as const

export const FORNECEDORES = [
  'BN', 'PARANA', 'CAPRIMA', 'IRANI', 'DOPEL', 
  'SUZANO', 'KLABIN', 'FIBRIA'
] as const

export const GRAMATURAS = [
  '17', '25', '28', '32', '35', '39', '42', '45', 
  '48', '52', '55', '58', '62', '65', '70', '75', '80'
] as const

export const MAQUINAS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9'
] as const

export type TipoPapel = typeof TIPOS_PAPEL[number]
export type Fornecedor = typeof FORNECEDORES[number]
export type Gramatura = typeof GRAMATURAS[number]
export type Maquina = typeof MAQUINAS[number]
