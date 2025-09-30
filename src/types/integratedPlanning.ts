// Types para Planejamento Integrado - Maquinas + Pedidos + Clientes
// Sistema Soropel - Gestao de Producao Semanal

export interface WeeklyPlanningComplete {
  id: string
  week_start_date: string
  week_end_date: string
  machine_id: string
  machine: {
    machine_number: number
    name: string
    type: string
    status: 'ativa' | 'manutencao' | 'parada'
  }
  planned_orders: PlannedOrderItem[]
  total_planned_quantity: number
  completed_quantity: number
  estimated_efficiency: number
  actual_efficiency?: number
  status: 'draft' | 'active' | 'completed'
  notes: string
  created_at: string
  updated_at: string
}

export interface PlannedOrderItem {
  order_id: string
  order_number: string
  product_id: string
  product_name: string
  product_code: number
  client_id: string
  client_name: string
  quantity: number
  completed_quantity: number
  priority: 'urgente' | 'especial' | 'normal'
  delivery_date: string
  estimated_duration_hours: number
  sequence_order: number
  status: 'planned' | 'in_production' | 'completed' | 'delayed'
  progress_percentage: number
}

export interface MachineWithPlanning {
  id: string
  machine_number: number
  name: string
  type: 'no_print' | 'with_print' | 'special'
  status: 'active' | 'stopped' | 'maintenance' | 'waiting'
  
  // Dados atuais da maquina
  currentProduct?: string
  currentProgress: number
  efficiency: number
  
  // Planejamento semanal
  weeklyPlanning?: WeeklyPlanningComplete
  plannedOrders: PlannedOrderItem[]
  weeklyTarget: number
  weeklyProgress: number
  
  // Capacidade e metricas
  capacity_per_hour: number
  utilization_percentage: number
  on_schedule: boolean
  alerts: MachineAlert[]
}

export interface MachineAlert {
  type: 'overload' | 'behind_schedule' | 'urgent_order' | 'maintenance_due'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  order_id?: string
}

export interface OrderForPlanning {
  id: string
  order_number: string
  client_id: string
  client_name: string
  product_id: string
  product_name: string
  product_code: number
  quantity: number
  priority: 'urgente' | 'especial' | 'normal'
  delivery_date: string
  status: 'pending' | 'planned' | 'in_production' | 'completed'
  estimated_hours: number
  machine_compatibility: string[] // IDs das maquinas compativeis
  
  // Metadados para planejamento
  is_planned: boolean
  planned_machine_id?: string
  planned_start_date?: string
  planned_completion_date?: string
  days_until_delivery: number
}

export interface WeeklyPlanningUpdate {
  week_start_date: string
  machineAssignments: {
    machine_id: string
    orders: PlannedOrderItem[]
    production_goal: number
    notes: string
  }[]
  affectedMachines: string[]
}

export interface PlanningDragDropData {
  draggedOrder: OrderForPlanning | null
  draggedFromMachine?: string
  dropTargetMachine?: string
  dragOverOrder?: string
}

export interface ProductionMetrics {
  week_start: string
  week_end: string
  machines: {
    machine_id: string
    planned_quantity: number
    actual_quantity: number
    efficiency_planned: number
    efficiency_actual: number
    orders_completed: number
    orders_delayed: number
    utilization_hours: number
  }[]
  overall: {
    total_planned: number
    total_actual: number
    efficiency_average: number
    on_time_delivery_rate: number
    machine_utilization_average: number
  }
}

export interface PlanningValidation {
  isValid: boolean
  warnings: PlanningWarning[]
  errors: PlanningError[]
  suggestions: PlanningSuggestion[]
}

export interface PlanningWarning {
  type: 'capacity_exceeded' | 'tight_deadline' | 'machine_overload'
  machine_id: string
  message: string
  affected_orders: string[]
}

export interface PlanningError {
  type: 'invalid_machine' | 'duplicate_order' | 'missing_data'
  message: string
  field?: string
}

export interface PlanningSuggestion {
  type: 'redistribute' | 'prioritize' | 'optimize_sequence'
  message: string
  action?: {
    type: 'move_order' | 'change_priority' | 'split_order'
    data: any
  }
}

export {
  WeeklyPlanningComplete,
  PlannedOrderItem,
  MachineWithPlanning,
  OrderForPlanning,
  WeeklyPlanningUpdate,
  PlanningDragDropData,
  ProductionMetrics,
  PlanningValidation
}
