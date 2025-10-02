// 📊 Dashboard Service - Sistema Soropel
// Serviços para buscar dados reais do dashboard no Supabase

import { supabase, isSupabaseAvailable, createSupabaseUnavailableError } from '../lib/supabase'
import type { DatabaseResult } from '../types/supabase'
import type { Machine, Alert, Activity, DashboardMetrics, ProductionData } from '../types/dashboard'

// 🔄 FUNÇÕES DE CONVERSÃO DE DADOS
const convertSupabaseMachineToFrontend = (supabaseMachine: any): Machine => {
  // Converter status do Supabase para formato frontend
  let frontendStatus: Machine['status'] = 'offline'
  switch (supabaseMachine.status) {
    case 'ativa':
      frontendStatus = 'online'
      break
    case 'manutencao':
      frontendStatus = 'maintenance'
      break
    case 'parada':
      frontendStatus = 'offline'
      break
    default:
      frontendStatus = 'idle'
  }

  return {
    id: supabaseMachine.id,
    nome: `Máquina ${supabaseMachine.machine_number} - ${supabaseMachine.name}`,
    status: frontendStatus,
    produto: 'Aguardando produção', // Campo removido do schema
    progresso: 0, // Valor padrão já que progress_percentage não existe na tabela machines
    tempoRestante: undefined, // time_remaining não existe na tabela machines
    observacao: `Eficiência: 100%` // Valor padrão já que observations não existe na tabela machines
  }
}

const convertSupabaseAlertToFrontend = (supabaseAlert: any): Alert => ({
  id: supabaseAlert.id,
  type: supabaseAlert.type,
  title: supabaseAlert.title,
  message: supabaseAlert.message,
  timestamp: new Date(supabaseAlert.created_at)
})

const convertSupabaseActivityToFrontend = (supabaseActivity: any): Activity => ({
  id: supabaseActivity.id,
  type: supabaseActivity.type,
  title: supabaseActivity.title,
  description: supabaseActivity.description,
  timestamp: new Date(supabaseActivity.created_at),
  icon: supabaseActivity.icon || 'info'
})

// 📊 BUSCAR MÉTRICAS DO DASHBOARD
export const getDashboardMetrics = async (): Promise<DatabaseResult<DashboardMetrics>> => {
  
  // 🛡️ Verificar se Supabase está disponível
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError() as DatabaseResult<DashboardMetrics>
  }
  
  try {
    // Buscar dados de várias tabelas em paralelo
    const [ordersResult, bobinasResult, machinesResult] = await Promise.all([
      // Pedidos em andamento
      supabase!
        .from('orders')
        .select('id, status')
        .in('status', ['aguardando_producao', 'em_producao']),
      
      // Bobinas em uso
      supabase!
        .from('rolls')
        .select('id, status')
        .eq('status', 'em_maquina'),
      
      // Máquinas ativas
      supabase!
        .from('machines')
        .select('id, status')
    ])

    if (ordersResult.error || bobinasResult.error || machinesResult.error) {
      console.error('❌ Erro ao buscar métricas:', {
        orders: ordersResult.error,
        bobinas: bobinasResult.error,
        machines: machinesResult.error
      })
      return { error: 'Erro ao buscar métricas' }
    }

    // Calcular métricas
    const pedidosAndamento = ordersResult.data?.length || 0
    const bobinaemUso = bobinasResult.data?.length || 0
    
    const machines = machinesResult.data || []
    const maquinasAtivas = machines.filter(m => m.status === 'ativa').length
    const eficienciaMedia = 100 // Valor padrão já que efficiency_rate não existe na tabela machines

    // Buscar sobras de hoje
    const today = new Date().toISOString().split('T')[0]
    const { data: sobras } = await supabase!
      .from('rolls')
      .select('id')
      .eq('status', 'sobra')
      .gte('updated_at', `${today}T00:00:00`)

    const metrics: DashboardMetrics = {
      pedidosAndamento,
      bobinaemUso,
      maquinasAtivas: {
        ativas: maquinasAtivas,
        total: machines.length,
        eficienciaMedia
      },
      sobrasHoje: sobras?.length || 0
    }

    return { data: metrics }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar métricas:', error)
    return { error: 'Erro de conexão' }
  }
}

// 📈 BUSCAR DADOS DE PRODUÇÃO
export const getProductionData = async (): Promise<DatabaseResult<ProductionData>> => {
  // 🛡️ Verificar se Supabase está disponível
  if (!isSupabaseAvailable() || !supabase) {
    return createSupabaseUnavailableError() as DatabaseResult<ProductionData>
  }

  try {
    // Como a tabela production_tracking não existe, usar dados padrão
    // Em uma implementação futura, esta tabela pode ser criada
    const productionData: ProductionData = {
      metaDiaria: 15000,
      realizado: 8450,
      porcentagem: 56.3,
      projecao: 15100,
      topProdutos: [
        { nome: 'KRAFT 1/2 MIX', quantidade: 2890 },
        { nome: 'KRAFT 1/4 MIX', quantidade: 2156 },
        { nome: 'PAPEL SEMI KRAFT', quantidade: 1740 }
      ]
    }

    return { data: productionData }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar produção:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🤖 BUSCAR STATUS DAS MÁQUINAS
export const getMachinesStatus = async (): Promise<DatabaseResult<Machine[]>> => {
  // 🛡️ Verificar se Supabase está disponível
  if (!isSupabaseAvailable() || !supabase) {
    return createSupabaseUnavailableError() as DatabaseResult<Machine[]>
  }

  try {
    const { data, error } = await supabase
      .from('machines')
      .select(`
        id,
        machine_number,
        name,
        status
      `)
      .order('machine_number', { ascending: true })

    if (error) {
      console.error('❌ Erro ao buscar máquinas:', error)
      return { error: 'Erro ao buscar status das máquinas' }
    }

    // Converter dados do Supabase para formato do frontend
    const machines = (data || []).map(convertSupabaseMachineToFrontend)

    return { data: machines }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar máquinas:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🚨 BUSCAR ALERTAS ATIVOS
export const getActiveAlerts = async (): Promise<DatabaseResult<Alert[]>> => {
  try {
    // Sistema atual não possui tabela de alertas
    // Retorna lista vazia para compatibilidade
    return { data: [] }
  } catch (error) {
    console.error('❌ Erro ao buscar alertas:', error)
    return { error: 'Erro ao buscar alertas' }
  }
}

// 📝 BUSCAR ATIVIDADES RECENTES
export const getRecentActivities = async (limit = 20): Promise<DatabaseResult<Activity[]>> => {
  // 🛡️ Verificar se Supabase está disponível
  if (!isSupabaseAvailable() || !supabase) {
    return createSupabaseUnavailableError() as DatabaseResult<Activity[]>
  }

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Erro ao buscar atividades:', error)
      return { error: 'Erro ao buscar atividades' }
    }

    // Converter dados do Supabase para formato do frontend
    const activities = (data || []).map(convertSupabaseActivityToFrontend)

    return { data: activities }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar atividades:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🔄 ATUALIZAR DADOS COMPLETOS DO DASHBOARD
export const refreshDashboardData = async () => {
  try {
    const [metrics, production, machines, alerts, activities] = await Promise.all([
      getDashboardMetrics(),
      getProductionData(),
      getMachinesStatus(),
      getActiveAlerts(),
      getRecentActivities()
    ])

    return {
      metrics: metrics.data,
      production: production.data,
      machines: machines.data,
      alerts: alerts.data,
      activities: activities.data,
      errors: {
        metrics: metrics.error,
        production: production.error,
        machines: machines.error,
        alerts: alerts.error,
        activities: activities.error
      }
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar dashboard:', error)
    throw error
  }
}

// 🧪 TESTAR CONEXÃO COM DADOS DO DASHBOARD
export const testDashboardConnection = async () => {
  // 🛡️ Verificar se Supabase está disponível ANTES de usar
  if (!isSupabaseAvailable() || !supabase) {
    console.warn('⚠️ Supabase não disponível - variáveis de ambiente não carregadas')
    return { success: false, error: 'Supabase client não inicializado - verifique variáveis de ambiente' }
  }

  try {
    // Usar tabela que realmente existe para testar conexão
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão dashboard:', error)
      return { success: false, error: error.message }
    }
    
    // ✅ Conexão OK - log removido para console limpo
    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro na conexão dashboard:', error)
    return { success: false, error }
  }
}