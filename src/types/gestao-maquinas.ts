// Types para Gestão de Máquinas - Sistema Soropel
// Baseado nos padrões estabelecidos do projeto

export type MachineStatus = 'active' | 'stopped' | 'maintenance' | 'waiting'

export interface Machine {
  id: number
  name: string
  status: MachineStatus
  currentProduct: string
  progress: number
  targetProduction: number
  currentProduction: number
  efficiency: number
  timeRemaining: string
  lastMaintenance: string
  nextMaintenance: string
  operatingHours: number
  operator?: string
  type: 'no_print' | 'with_print' | 'special'
  // Dados integrados do banco
  bobina?: {
    numero: string
    tipo: string
    peso: string
  }
  pedidoAtivo?: {
    numero: string
    produto: string
    quantidade: number
    progresso: number
  }
  // Planejamento semanal integrado
  plannedOrders?: PlannedOrderItem[]
  weeklyTarget?: number
  weeklyProgress?: number
  onSchedule?: boolean
  alerts?: MachineAlert[]
}

export interface PlannedOrderItem {
  order_id: string
  order_number: string
  client_name: string
  product_name: string
  quantity: number
  delivery_date: string
  priority: 'urgente' | 'especial' | 'normal'
  days_until_delivery: number
  progress_percentage: number
}

export interface MachineAlert {
  type: 'overload' | 'behind_schedule' | 'urgent_order' | 'maintenance_due'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface PlanejamentoSemanal {
  id: string
  week: string
  selectedOrders: SelectedOrder[]
  consolidatedProducts: ConsolidatedProduct[]
  distribution: MachineDistribution[]
  totalUnits: number
}

export interface SelectedOrder {
  id: string
  code: string
  client: string
  units: number
  selected: boolean
}

export interface ConsolidatedProduct {
  id: string
  name: string
  code: string
  totalUnits: number
  orders: string[]
}

export interface MachineDistribution {
  machineId: number
  products: DistributedProduct[]
  totalLoad: number
  estimatedTime: string
}

export interface DistributedProduct {
  productId: string
  productName: string
  units: number
  priority: 'normal' | 'high' | 'urgent'
}

export interface MachineConfig {
  machineId: number
  allowedProducts: string[]
  maxCapacity: number
  speed: number
  dailyTarget: number
}

export interface MachineMetrics {
  totalActive: number
  totalStopped: number
  totalMaintenance: number
  averageEfficiency: number
}

// Estado para os modals
export interface ModalState {
  planejamento: boolean
  configurarProdutos: boolean
  configuracaoMaquina: boolean
  iotSystem: boolean
  selectedMachine?: number
}

// Props para componentes
export interface MachineCardProps {
  machine: Machine
  onToggleStatus: (machineId: number, currentStatus: MachineStatus) => void
  onOpenConfig: (machineId: number) => void
}

export interface ModalPlanejamentoProps {
  isOpen: boolean
  onClose: () => void
  orders: SelectedOrder[]
  onSelectOrder: (orderId: string) => void
  onAutoDistribute: () => void
  onSave: () => void
}

export interface ModalConfigurarProdutosProps {
  isOpen: boolean
  onClose: () => void
  machines: Machine[]
  configs: MachineConfig[]
  onSaveConfig: (configs: MachineConfig[]) => void
}

export interface ModalConfiguracaoMaquinaProps {
  isOpen: boolean
  onClose: () => void
  machine?: Machine
  onSaveSettings: (settings: Partial<Machine>) => void
}

// Types para Sistema IoT
export interface IoTDevice {
  id: string
  device_id: string
  name: string
  type: 'ESP32_CONTADOR' | 'SENSOR_PESO' | 'SENSOR_TEMPERATURA'
  machine_id?: string
  ip_address?: string
  last_seen?: string
  status: 'online' | 'offline' | 'error'
  firmware_version?: string
  config_settings: Record<string, any>
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductionCount {
  id: string
  device_id: string
  machine_id?: string
  timestamp: string
  saco_detectado: boolean
  contador_total: number
  velocidade_por_minuto: number
  meta_diaria: number
  turno: 'manha' | 'tarde' | 'noite'
  produto_atual?: string
  observacoes?: string
}

export interface DailyProductionSummary {
  id: string
  machine_id: string
  date: string
  turno: 'manha' | 'tarde' | 'noite'
  total_sacos_produzidos: number
  meta_planejada: number
  percentual_atingido: number
  velocidade_media_por_minuto: number
  tempo_producao_minutos: number
  tempo_parada_minutos: number
  eficiencia_percentual: number
  observacoes?: string
}

export interface IoTDashboardData {
  device: IoTDevice
  currentCount: number
  dailyGoal: number
  currentSpeed: number
  efficiency: number
  lastUpdate: string
  isOnline: boolean
}

export interface ModalIoTSystemProps {
  isOpen: boolean
  onClose: () => void
}
