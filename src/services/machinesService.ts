// Service para Gestão de Máquinas - Integração Supabase
// Sistema Soropel - Conecta store com banco real

import { supabase } from '@/lib/supabase'
import type { 
  Machine, 
  MachineStatus as MachineStatusType,
  MachineMetrics 
} from '@/types/gestao-maquinas'

// Interfaces para dados do Supabase
interface SupabaseMachine {
  id: string
  machine_number: number
  name: string
  type: string
  is_special: boolean
  status: 'ativa' | 'manutencao' | 'inativa'
  max_width: number | null
  max_height: number | null
  efficiency_rate: number
  last_maintenance: string | null
  created_at: string
  updated_at: string
  current_product: string | null
  current_bobina_id: string | null
  progress_percentage: number
  estimated_completion: string | null
  time_remaining: string | null
  observations: string | null
}

interface SupabaseMachineStatus {
  id: string
  machine_id: string
  current_product: string | null
  current_order_id: string | null
  progress_percentage: number
  estimated_completion: string | null
  time_remaining: string | null
  efficiency_current: number
  observations: string | null
  started_at: string | null
  updated_at: string
}

// Verificar se Supabase está configurado
const checkSupabaseAvailable = (): boolean => {
  const enableSupabase = import.meta.env.VITE_ENABLE_SUPABASE === 'true'
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  return enableSupabase && Boolean(supabaseUrl) && Boolean(supabaseKey)
}

// Conversores de dados
const convertSupabaseMachineToFrontend = (
  machine: SupabaseMachine, 
  machineStatus?: SupabaseMachineStatus
): Machine => {
  // Mapear status do Supabase para frontend
  const statusMap: Record<string, MachineStatusType> = {
    'ativa': 'active',
    'manutencao': 'maintenance', 
    'inativa': 'stopped'
  }

  // Mapear tipo da máquina
  const typeMap: Record<string, 'no_print' | 'with_print' | 'special'> = {
    'sem_impressao': 'no_print',
    'com_impressao': 'with_print',
    'especial': 'special'
  }

  // Calcular tempo restante formatado
  const formatTimeRemaining = (timeRemaining: string | null): string => {
    if (!timeRemaining) return 'N/A'
    
    // Parse PostgreSQL interval format (ex: "02:30:00")
    const match = timeRemaining.match(/(\d+):(\d+):(\d+)/)
    if (match) {
      const [, hours, minutes] = match
      const h = parseInt(hours)
      const m = parseInt(minutes)
      
      if (h > 0) {
        return `${h}h ${m}min`
      } else {
        return `${m}min`
      }
    }
    
    return timeRemaining
  }

  // Calcular produções baseado no progresso
  const calculateProduction = (progress: number): { current: number, target: number } => {
    // Meta base por tipo de máquina (valores estimados)
    const baseTargets = {
      1: 3500, 2: 2200, 3: 1500, 4: 1800,
      5: 3000, 6: 2800, 7: 4500, 8: 1800, 9: 2000
    }
    
    const target = baseTargets[machine.machine_number as keyof typeof baseTargets] || 2000
    const current = Math.round((progress / 100) * target)
    
    return { current, target }
  }

  const production = calculateProduction(machine.progress_percentage)
  
  return {
    id: machine.machine_number,
    name: machine.name,
    status: statusMap[machine.status] || 'stopped',
    currentProduct: machineStatus?.current_product || machine.current_product || 'Sem produto',
    progress: machineStatus?.progress_percentage || machine.progress_percentage,
    targetProduction: production.target,
    currentProduction: production.current,
    efficiency: machineStatus?.efficiency_current || machine.efficiency_rate || 0,
    timeRemaining: formatTimeRemaining(machineStatus?.time_remaining || machine.time_remaining),
    lastMaintenance: machine.last_maintenance 
      ? new Date(machine.last_maintenance).toLocaleDateString('pt-BR') 
      : 'N/A',
    nextMaintenance: machine.last_maintenance 
      ? new Date(new Date(machine.last_maintenance).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
      : 'N/A',
    operatingHours: Math.round(Math.random() * 2000 + 1500), // Simular por enquanto
    operator: machineStatus?.observations?.includes('Operador') 
      ? machineStatus.observations.split('Operador: ')[1]?.split(',')[0] 
      : undefined,
    type: machine.is_special ? 'special' : typeMap[machine.type] || 'no_print'
  }
}

// Service principal
export class MachinesService {
  /**
   * Buscar todas as máquinas com status
   */
  static async getMachines(): Promise<Machine[]> {
    if (!checkSupabaseAvailable()) {
      console.warn('Supabase não disponível, usando dados simulados')
      return this.getMockMachines()
    }

    try {
      // Buscar máquinas
      const { data: machines, error: machinesError } = await supabase
        .from('machines')
        .select('*')
        .order('machine_number')

      if (machinesError) {
        throw new Error(`Erro ao buscar máquinas: ${machinesError.message}`)
      }

      // Buscar status das máquinas
      const { data: machineStatuses, error: statusError } = await supabase
        .from('machine_status')
        .select('*')

      if (statusError) {
        console.warn('Erro ao buscar status das máquinas:', statusError.message)
      }

      // Combinar dados
      const result = machines.map(machine => {
        const status = machineStatuses?.find(s => s.machine_id === machine.id)
        return convertSupabaseMachineToFrontend(machine, status)
      })

      console.log(`✅ Carregadas ${result.length} máquinas do Supabase`)
      return result

    } catch (error) {
      console.error('Erro no service getMachines:', error)
      console.log('🔄 Fallback para dados simulados')
      return this.getMockMachines()
    }
  }

  /**
   * Atualizar status de uma máquina
   */
  static async updateMachineStatus(
    machineId: number, 
    status: MachineStatusType,
    observations?: string
  ): Promise<boolean> {
    if (!checkSupabaseAvailable()) {
      console.log(`🔄 Simulando atualização da Máquina ${machineId} para ${status}`)
      return true
    }

    try {
      // Mapear status frontend para Supabase
      const statusMap: Record<MachineStatusType, string> = {
        'active': 'ativa',
        'maintenance': 'manutencao',
        'stopped': 'inativa',
        'waiting': 'inativa'
      }

      // Buscar UUID da máquina pelo número
      const { data: machineData, error: findError } = await supabase
        .from('machines')
        .select('id')
        .eq('machine_number', machineId)
        .single()

      if (findError || !machineData) {
        throw new Error(`Máquina ${machineId} não encontrada`)
      }

      // Atualizar na tabela machines
      const { error: updateError } = await supabase
        .from('machines')
        .update({
          status: statusMap[status],
          observations: observations || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', machineData.id)

      if (updateError) {
        throw new Error(`Erro ao atualizar máquina: ${updateError.message}`)
      }

      // Registrar atividade
      await this.logActivity({
        type: status === 'maintenance' ? 'maintenance' : 
              status === 'active' ? 'started' : 'machine_stopped',
        title: `Máquina ${machineId}`,
        description: status === 'active' ? 'Máquina iniciada' :
                    status === 'maintenance' ? `Parada para manutenção${observations ? `: ${observations}` : ''}` :
                    'Máquina pausada',
        machine_id: machineData.id,
        observations
      })

      console.log(`✅ Status da Máquina ${machineId} atualizado para ${status}`)
      return true

    } catch (error) {
      console.error('Erro ao atualizar status da máquina:', error)
      return false
    }
  }

  /**
   * Parar máquina para manutenção
   */
  static async stopForMaintenance(
    machineId: number, 
    reason?: string
  ): Promise<boolean> {
    return this.updateMachineStatus(machineId, 'maintenance', reason)
  }

  /**
   * Parar máquina sem operador
   */
  static async stopWithoutOperator(machineId: number): Promise<boolean> {
    return this.updateMachineStatus(machineId, 'stopped', 'Parada - Sem operador')
  }

  /**
   * Atualizar configurações da máquina
   */
  static async updateMachineConfig(
    machineId: number,
    config: {
      dailyTarget?: number
      currentProduct?: string
    }
  ): Promise<boolean> {
    if (!checkSupabaseAvailable()) {
      console.log(`🔄 Simulando update config Máquina ${machineId}:`, config)
      return true
    }

    try {
      // Buscar UUID da máquina
      const { data: machineData, error: findError } = await supabase
        .from('machines')
        .select('id')
        .eq('machine_number', machineId)
        .single()

      if (findError || !machineData) {
        throw new Error(`Máquina ${machineId} não encontrada`)
      }

      // Atualizar configurações
      const updates: any = { updated_at: new Date().toISOString() }
      
      if (config.currentProduct) {
        updates.current_product = config.currentProduct
      }

      const { error: updateError } = await supabase
        .from('machines')
        .update(updates)
        .eq('id', machineData.id)

      if (updateError) {
        throw new Error(`Erro ao atualizar configurações: ${updateError.message}`)
      }

      // Registrar atividade
      await this.logActivity({
        type: 'changed',
        title: `Configuração Máquina ${machineId}`,
        description: `Configurações atualizadas: ${Object.keys(config).join(', ')}`,
        machine_id: machineData.id
      })

      console.log(`✅ Configurações da Máquina ${machineId} atualizadas`)
      return true

    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      return false
    }
  }

  /**
   * Calcular métricas das máquinas
   */
  static async getMachineMetrics(): Promise<MachineMetrics> {
    const machines = await this.getMachines()
    
    return {
      totalActive: machines.filter(m => m.status === 'active').length,
      totalStopped: machines.filter(m => m.status === 'stopped').length,
      totalMaintenance: machines.filter(m => m.status === 'maintenance').length,
      averageEfficiency: machines.reduce((acc, m) => acc + m.efficiency, 0) / machines.length || 0
    }
  }

  /**
   * Registrar atividade no sistema
   */
  private static async logActivity(activity: {
    type: string
    title: string
    description: string
    machine_id?: string
    observations?: string
  }): Promise<void> {
    if (!checkSupabaseAvailable()) return

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          type: activity.type,
          title: activity.title,  
          description: activity.description,
          machine_id: activity.machine_id || null,
          user_name: 'Sistema',
          metadata: activity.observations ? { observations: activity.observations } : {},
          created_at: new Date().toISOString()
        })

      if (error) {
        console.warn('Erro ao registrar atividade:', error.message)
      }
    } catch (error) {
      console.warn('Erro ao registrar atividade:', error)
    }
  }

  /**
   * Dados simulados (fallback)
   */
  private static getMockMachines(): Machine[] {
    return [
      {
        id: 1,
        name: 'Máquina 1',
        status: 'active',
        currentProduct: 'SACO KRAFT 2KG',
        progress: 81,
        targetProduction: 3500,
        currentProduction: 2850,
        efficiency: 87,
        timeRemaining: '2h 15min',
        lastMaintenance: '15/07/2025',
        nextMaintenance: '22/07/2025',
        operatingHours: 1847,
        type: 'no_print'
      },
      {
        id: 2,
        name: 'Máquina 2',
        status: 'maintenance',
        currentProduct: 'Manutenção Preventiva',
        progress: 0,
        targetProduction: 2200,
        currentProduction: 0,
        efficiency: 0,
        timeRemaining: '1h 30min',
        lastMaintenance: '15/07/2025',
        nextMaintenance: '22/07/2025',
        operatingHours: 1650,
        operator: 'Técnico João',
        type: 'no_print'
      },
      {
        id: 3,
        name: 'Máquina 3',
        status: 'active',
        currentProduct: 'SACO KRAFT 1KG',
        progress: 65,
        targetProduction: 1500,
        currentProduction: 980,
        efficiency: 78,
        timeRemaining: '1h 45min',
        lastMaintenance: '10/07/2025',
        nextMaintenance: '17/07/2025',
        operatingHours: 1623,
        type: 'no_print'
      },
      {
        id: 4,
        name: 'Máquina 4',
        status: 'stopped',
        currentProduct: 'Aguardando Material',
        progress: 0,
        targetProduction: 1800,
        currentProduction: 0,
        efficiency: 0,
        timeRemaining: 'Parada há 35min',
        lastMaintenance: '12/07/2025',
        nextMaintenance: '19/07/2025',
        operatingHours: 1580,
        type: 'no_print'
      },
      {
        id: 5,
        name: 'Máquina 5',
        status: 'active',
        currentProduct: 'PAPEL SEMI KRAFT',
        progress: 43,
        targetProduction: 3000,
        currentProduction: 1290,
        efficiency: 92,
        timeRemaining: '3h 10min',
        lastMaintenance: '14/07/2025',
        nextMaintenance: '21/07/2025',
        operatingHours: 1890,
        type: 'with_print'
      },
      {
        id: 6,
        name: 'Máquina 6',
        status: 'waiting',
        currentProduct: 'Aguardando Setup',
        progress: 0,
        targetProduction: 2800,
        currentProduction: 0,
        efficiency: 0,
        timeRemaining: 'Setup pendente',
        lastMaintenance: '11/07/2025',
        nextMaintenance: '18/07/2025',
        operatingHours: 1720,
        operator: 'Operador Carlos',
        type: 'with_print'
      },
      {
        id: 7,
        name: 'Máquina 7',
        status: 'active',
        currentProduct: 'KRAFT REVISTA',
        progress: 94,
        targetProduction: 4500,
        currentProduction: 4230,
        efficiency: 95,
        timeRemaining: '6h 20min',
        lastMaintenance: '13/07/2025',
        nextMaintenance: '20/07/2025',
        operatingHours: 2100,
        type: 'with_print'
      },
      {
        id: 8,
        name: 'Máquina 8',
        status: 'stopped',
        currentProduct: 'Produção Finalizada',
        progress: 100,
        targetProduction: 1800,
        currentProduction: 1800,
        efficiency: 98,
        timeRemaining: 'Finalizada 16:45',
        lastMaintenance: '16/07/2025',
        nextMaintenance: '23/07/2025',
        operatingHours: 1950,
        type: 'with_print'
      },
      {
        id: 9,
        name: 'Máquina 9',
        status: 'active',
        currentProduct: 'TOALHA AMERICANA',
        progress: 76,
        targetProduction: 2000,
        currentProduction: 1520,
        efficiency: 89,
        timeRemaining: '4h 05min',
        lastMaintenance: '15/07/2025',
        nextMaintenance: '22/07/2025',
        operatingHours: 1800,
        type: 'special'
      }
    ]
  }
}

export default MachinesService