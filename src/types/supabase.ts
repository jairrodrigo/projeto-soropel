// 🏗️ Types Supabase - Sistema Soropel
// Tipos TypeScript baseados no schema real criado

// 📦 PRODUTOS
export interface Product {
  id: string
  soropel_code: number
  category_code: string
  category_name: string
  name: string
  description?: string
  weight_value?: number
  weight_unit?: 'kg' | 'gr'
  width?: number
  height?: number
  paper_type?: string
  packages_per_thousand?: number
  packages_per_bundle?: number
  units_per_bundle?: number
  active: boolean
  created_at: string
  updated_at: string
}

// 👥 CLIENTES
export interface Customer {
  id: string
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipcode?: string
  active: boolean
  created_at: string
  updated_at: string
}

// 🏭 MÁQUINAS
export interface Machine {
  id: string
  machine_number: number
  name: string
  type?: string
  status: 'ativa' | 'manutencao' | 'inativa'
  location?: string
  capacity_per_hour?: number
  active: boolean
  created_at: string
  updated_at: string
}

// 📋 PEDIDOS (ORDEM DE PRODUÇÃO)
export interface Order {
  id: string
  op_number: string
  customer_id?: string
  status: string
  priority: 'baixa' | 'normal' | 'alta' | 'urgente'
  total_quantity: number
  machine_id?: number
  notes?: string
  due_date?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  
  // Relacionamentos
  customer?: Customer
  machine?: Machine
  order_items?: OrderItem[]
}

// 📋 ITENS DO PEDIDO
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  bundles_needed?: number
  packages_needed?: number
  produced_quantity?: number
  notes?: string
  created_at: string
  
  // Relacionamentos
  product?: Product
  order?: Order
}

// 🎞️ BOBINAS
export interface Roll {
  id: string
  roll_number: string
  machine_id: number
  paper_type: string
  width: number
  weight_kg: number
  status: 'nova' | 'em_uso' | 'finalizada' | 'descartada'
  usage_percentage?: number
  started_at?: string
  finished_at?: string
  notes?: string
  created_at: string
  updated_at: string
  
  // Relacionamentos
  machine?: Machine
}

// 📊 REGISTROS DE PRODUÇÃO
export interface ProductionRecord {
  id: string
  order_id: string
  machine_id: number
  roll_id?: string
  product_id: string
  quantity_produced: number
  quality_rating?: number
  waste_quantity?: number
  production_time_minutes?: number
  operator_name?: string
  notes?: string
  produced_at: string
  created_at: string
  
  // Relacionamentos
  order?: Order
  machine?: Machine
  roll?: Roll
  product?: Product
}

// 🔍 FILTROS E QUERIES
export interface ProductFilters {
  category_code?: string
  active?: boolean
  search?: string
  weight_min?: number
  weight_max?: number
}

export interface OrderFilters {
  status?: string
  priority?: string
  machine_id?: number
  customer_id?: string
  date_from?: string
  date_to?: string
}

// 📊 DASHBOARD METRICS
export interface DashboardMetrics {
  orders: {
    total: number
    pending: number
    in_production: number
    completed: number
    late: number
  }
  production: {
    today_quantity: number
    week_quantity: number
    month_quantity: number
    efficiency_percentage: number
  }
  machines: {
    active: number
    maintenance: number
    total_capacity: number
    current_usage: number
  }
  inventory: {
    products_count: number
    low_stock_alerts: number
    rolls_active: number
    rolls_low: number
  }
}

// 🎯 API RESPONSES
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// 🔄 DATABASE OPERATIONS
export type DatabaseOperation = 'select' | 'insert' | 'update' | 'delete'

export interface DatabaseResult<T> {
  data?: T
  error?: any
  count?: number
}

// 📱 REAL-TIME SUBSCRIPTIONS
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
  table: string
  schema: string
}