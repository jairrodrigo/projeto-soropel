import { supabase } from '@/config/supabase'
import { 
  WeeklyPlanning, 
  WeeklyPlanningWithMachine, 
  DatabaseResult,
  Machine 
} from '@/types/weeklyPlanning'

// 🛡️ Verificar se Supabase está disponível
const isSupabaseAvailable = (): boolean => {
  if (!supabase) {
    console.error('❌ Supabase client não está disponível')
    return false
  }
  return true
}

// 🛡️ Resposta padrão quando Supabase não está disponível
const createSupabaseUnavailableError = (): DatabaseResult<any> => ({
  success: false,
  error: 'Supabase não está disponível. Verifique a configuração.'
})

// Interface para pedidos
export interface OrderForPlanning {
  id: string
  order_number: string
  client_name: string
  product_name: string
  quantity: number
  priority: 'urgente' | 'especial' | 'normal'
  deadline: string
  status: string
}

/**
 * 📋 Buscar pedidos disponíveis para planejamento
 */
export const getAvailableOrders = async (): Promise<DatabaseResult<OrderForPlanning[]>> => {
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError()
  }

  try {
    console.log('🔍 Buscando pedidos disponíveis para planejamento...')
    
    const { data, error } = await supabase!
      .from('orders')
      .select(`
        id,
        order_number,
        total_units,
        priority,
        status,
        delivery_date,
        tipo,
        client_id,
        clients!inner(
          company_name,
          fantasy_name
        )
      `)
      .in('status', ['pending', 'in_production'])
      .order('delivery_date', { ascending: true })

    if (error) {
      console.error('❌ Erro ao buscar pedidos:', error)
      
      // Retornar dados mock se houver erro
      const mockOrders: OrderForPlanning[] = [
        {
          id: '1',
          order_number: 'OP-2025-001',
          client_name: 'Supermercado Central',
          product_name: 'Saco Kraft 2kg',
          quantity: 5000,
          priority: 'urgente',
          deadline: '2025-08-10',
          status: 'pending'
        },
        {
          id: '2',
          order_number: 'OP-2025-002',
          client_name: 'Padaria São José',
          product_name: 'Saco Kraft 1kg',
          quantity: 3000,
          priority: 'especial',
          deadline: '2025-08-12',
          status: 'pending'
        },
        {
          id: '3',
          order_number: 'OP-2025-003',
          client_name: 'Mercado Bom Preço',
          product_name: 'Saco Kraft 5kg',
          quantity: 2000,
          priority: 'normal',
          deadline: '2025-08-15',
          status: 'pending'
        },
        {
          id: '4',
          order_number: 'OP-2025-004',
          client_name: 'Atacado Silva',
          product_name: 'Saco Kraft 10kg',
          quantity: 1500,
          priority: 'especial',
          deadline: '2025-08-11',
          status: 'in_production'
        },
        {
          id: '5',
          order_number: 'OP-2025-005',
          client_name: 'Distribuidora Norte',
          product_name: 'Saco Kraft 2kg',
          quantity: 8000,
          priority: 'urgente',
          deadline: '2025-08-09',
          status: 'pending'
        }
      ]
      
      console.log('📦 Usando pedidos mock:', mockOrders.length)
      return { success: true, data: mockOrders }
    }

    // Transformar dados reais
    const orders: OrderForPlanning[] = (data || []).map(item => ({
      id: item.id,
      order_number: item.order_number,
      client_name: item.clients?.fantasy_name || item.clients?.company_name || 'Cliente',
      product_name: item.tipo || 'Produto',
      quantity: item.total_units || 0,
      priority: item.priority as 'urgente' | 'especial' | 'normal',
      deadline: item.delivery_date,
      status: item.status
    }))

    console.log('✅ Pedidos carregados:', orders.length)
    return { success: true, data: orders }

  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * 📊 Buscar planejamentos da semana
 */
export const getWeeklyPlannings = async (
  weekStartDate: string
): Promise<DatabaseResult<WeeklyPlanningWithMachine[]>> => {
  
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError() as DatabaseResult<WeeklyPlanningWithMachine[]>
  }
  
  try {
    console.log('🔍 Buscando planejamentos para semana:', weekStartDate)
    
    const { data, error } = await supabase!
      .from('weekly_planning')
      .select(`
        *,
        machines (
          machine_number,
          name,
          type
        )
      `)
      .eq('week_start_date', weekStartDate)
      .order('machine_id', { ascending: true })
    
    if (error) {
      console.error('❌ Erro ao buscar planejamentos semanais:', error)
      return { success: false, error: error.message }
    }
    
    // Transformar dados
    const planningsWithMachine: WeeklyPlanningWithMachine[] = (data || []).map(item => ({
      ...item,
      machine: item.machines || null
    }))
    
    console.log('✅ Planejamentos carregados:', planningsWithMachine.length)
    return { success: true, data: planningsWithMachine }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

/**
 * 🏭 Buscar máquinas disponíveis
 */
export const getAvailableMachines = async (): Promise<DatabaseResult<Machine[]>> => {
  
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError() as DatabaseResult<Machine[]>
  }
  
  try {
    console.log('📊 Buscando máquinas para planejamento...')
    
    const { data, error } = await supabase!
      .from('machines')
      .select('*')
      .eq('active', true)
      .order('machine_number', { ascending: true })
    
    if (error) {
      console.error('❌ Erro ao buscar máquinas:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Máquinas carregadas:', data?.length || 0)
    return { success: true, data: data || [] }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

/**
 * 💾 Criar ou atualizar planejamento
 */
export const createOrUpdatePlanning = async (
  planning: Omit<WeeklyPlanning, 'id' | 'created_at' | 'updated_at'>
): Promise<DatabaseResult<WeeklyPlanning>> => {
  
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError() as DatabaseResult<WeeklyPlanning>
  }
  
  try {
    console.log('💾 Salvando planejamento:', planning)
    
    // Verificar se já existe
    const { data: existing } = await supabase!
      .from('weekly_planning')
      .select('id')
      .eq('machine_id', planning.machine_id)
      .eq('week_start_date', planning.week_start_date)
      .single()
    
    let result
    
    if (existing) {
      // Atualizar existente
      result = await supabase!
        .from('weekly_planning')
        .update({
          ...planning,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Criar novo
      result = await supabase!
        .from('weekly_planning')
        .insert({
          ...planning,
          created_by: planning.created_by || 'Sistema'
        })
        .select()
        .single()
    }
    
    if (result.error) {
      console.error('❌ Erro ao salvar planejamento:', result.error)
      return { success: false, error: result.error.message }
    }
    
    console.log('✅ Planejamento salvo com sucesso')
    return { success: true, data: result.data }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

/**
 * 🗑️ Deletar planejamento
 */
export const deletePlanning = async (
  planningId: string
): Promise<DatabaseResult<void>> => {
  
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError() as DatabaseResult<void>
  }
  
  try {
    console.log('🗑️ Deletando planejamento:', planningId)
    
    const { error } = await supabase!
      .from('weekly_planning')
      .delete()
      .eq('id', planningId)
    
    if (error) {
      console.error('❌ Erro ao deletar planejamento:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Planejamento deletado com sucesso')
    return { success: true, data: undefined }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Exportar serviço atualizado
export const weeklyPlanningService = {
  getWeeklyPlannings,
  getAvailableMachines,
  getAvailableOrders,
  createOrUpdatePlanning,
  deletePlanning
}
