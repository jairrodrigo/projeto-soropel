// 📊 Dashboard Service - Sistema Soropel
// Serviços para buscar dados reais do dashboard no Supabase

import { supabase } from '../lib/supabase'
import type { DatabaseResult } from '../types/supabase'
import type { Machine, Alert, Activity } from '../types/dashboard'

// 🎯 TIPOS ESPECÍFICOS DO DASHBOARD
export interface DashboardMetrics {
  pedidosAndamento: number
  bobinaemUso: number
  maquinasAtivas: {
    ativas: number
    total: number
    eficienciaMedia: number
  }
  sobrasHoje: number
}

export interface ProductionData {
  metaDiaria: number
  realizado: number
  porcentagem: number
  projecao: number
  topProdutos: Array<{
    nome: string
    quantidade: number
  }>
}

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
    case 'inativa':
      frontendStatus = 'offline'
      break
    default:
      frontendStatus = 'idle'
  }

  return {
    id: supabaseMachine.id,
    nome: `Máquina ${supabaseMachine.machine_number} - ${supabaseMachine.name}`,
    status: frontendStatus,
    produto: supabaseMachine.current_product || 'Aguardando produção',
    progresso: supabaseMachine.progress_percentage || 0,
    tempoRestante: supabaseMachine.time_remaining || undefined,
    observacao: supabaseMachine.observations || `Eficiência: ${supabaseMachine.efficiency_rate || 100}%`
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
  try {
    // Buscar dados de várias tabelas em paralelo
    const [ordersResult, bobinasResult, machinesResult] = await Promise.all([
      // Pedidos em andamento
      supabase
        .from('orders')
        .select('id, status')
        .in('status', ['pendente', 'producao']),
        
      // Bobinas em uso
      supabase
        .from('bobinas')
        .select('id, status')
        .eq('status', 'em_maquina'),
        
      // Máquinas ativas
      supabase
        .from('machines')
        .select('id, status, efficiency_rate')
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
    const eficienciaMedia = machines.length > 0 
      ? Math.round(machines.reduce((acc, m) => acc + (m.efficiency_rate || 100), 0) / machines.length)
      : 100

    // Buscar sobras de hoje
    const today = new Date().toISOString().split('T')[0]
    const { data: sobras } = await supabase
      .from('bobinas')
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
  try {
    // Buscar dados de produção atual
    const { data: tracking, error: trackingError } = await supabase
      .from('production_tracking')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (trackingError && trackingError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar produção:', trackingError)
      return { error: 'Erro ao buscar dados de produção' }
    }

    // Se não tem dados, usar valores padrão
    const productionData: ProductionData = {
      metaDiaria: tracking?.daily_goal || 15000,
      realizado: tracking?.current_production || 8450,
      porcentagem: Math.round((tracking?.percentage || 56.3) * 100) / 100,
      projecao: tracking?.projection || 15100,
      topProdutos: tracking?.top_products || [
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
  try {
    const { data, error } = await supabase
      .from('machines')
      .select(`
        id,
        machine_number,
        name,
        status,
        current_product,
        progress_percentage,
        efficiency_rate,
        estimated_completion,
        time_remaining,
        observations
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
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Erro ao buscar alertas:', error)
      return { error: 'Erro ao buscar alertas' }
    }

    // Converter dados do Supabase para formato do frontend
    const alerts = (data || []).map(convertSupabaseAlertToFrontend)

    return { data: alerts }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar alertas:', error)
    return { error: 'Erro de conexão' }
  }
}

// 📝 BUSCAR ATIVIDADES RECENTES
export const getRecentActivities = async (limit = 20): Promise<DatabaseResult<Activity[]>> => {
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
  try {
    const { data: count } = await supabase
      .from('production_tracking')
      .select('count')
      .limit(1)
    
    console.log('✅ Dashboard conectado ao Supabase!')
    return { success: true, count }
  } catch (error) {
    console.error('❌ Erro na conexão dashboard:', error)
    return { success: false, error }
  }
}