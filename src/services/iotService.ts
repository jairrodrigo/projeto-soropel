// IoT Service - Sistema ESP32 Contador de Sacos
// Sistema Soropel - Integração com Supabase

import { createClient } from '@supabase/supabase-js'
import type { 
  IoTDevice, 
  ProductionCount, 
  DailyProductionSummary 
} from '@/types/gestao-maquinas'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class IoTService {
  
  // Listar dispositivos IoT
  static async getDevices(): Promise<IoTDevice[]> {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar dispositivos IoT:', error)
        throw new Error('Falha ao carregar dispositivos')
      }

      return data || []
    } catch (error) {
      console.error('IoT Service - getDevices error:', error)
      throw error
    }
  }

  // Adicionar novo dispositivo
  static async addDevice(deviceData: {
    device_id: string
    name: string
    machine_id?: string
    wifi_ssid?: string
    sensor_pin?: number
  }): Promise<IoTDevice> {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .insert([{
          device_id: deviceData.device_id,
          name: deviceData.name,
          type: 'ESP32_CONTADOR',
          machine_id: deviceData.machine_id || null,
          status: 'offline',
          firmware_version: 'v1.0.0',
          config_settings: {
            sensor_pin: deviceData.sensor_pin || 34,
            wifi_ssid: deviceData.wifi_ssid || 'Soropel_IoT'
          },
          active: true
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao adicionar dispositivo:', error)
        throw new Error('Falha ao adicionar dispositivo')
      }

      return data
    } catch (error) {
      console.error('IoT Service - addDevice error:', error)
      throw error
    }
  }

  // Atualizar dispositivo
  static async updateDevice(deviceId: string, updates: Partial<IoTDevice>): Promise<IoTDevice> {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .update(updates)
        .eq('id', deviceId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar dispositivo:', error)
        throw new Error('Falha ao atualizar dispositivo')
      }

      return data
    } catch (error) {
      console.error('IoT Service - updateDevice error:', error)
      throw error
    }
  }

  // Buscar dados de produção por dispositivo
  static async getProductionData(
    deviceId: string, 
    date?: string
  ): Promise<ProductionCount[]> {
    try {
      let query = supabase
        .from('production_counting')
        .select(`
          *,
          iot_devices (
            device_id,
            name
          )
        `)
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false })

      if (date) {
        const startDate = `${date}T00:00:00Z`
        const endDate = `${date}T23:59:59Z`
        query = query.gte('timestamp', startDate).lte('timestamp', endDate)
      }

      const { data, error } = await query.limit(100)

      if (error) {
        console.error('Erro ao buscar dados de produção:', error)
        throw new Error('Falha ao carregar dados de produção')
      }

      return data || []
    } catch (error) {
      console.error('IoT Service - getProductionData error:', error)
      throw error
    }
  }

  // Buscar últimos dados de todas as máquinas
  static async getLatestProductionData(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('production_counting')
        .select(`
          *,
          iot_devices (
            device_id,
            name,
            machine_id,
            status
          )
        `)
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Erro ao buscar dados mais recentes:', error)
        throw new Error('Falha ao carregar dados de produção')
      }

      // Agrupar por device_id e pegar o mais recente de cada
      const latestByDevice = new Map()
      
      data?.forEach(record => {
        const deviceId = record.device_id
        if (!latestByDevice.has(deviceId)) {
          latestByDevice.set(deviceId, record)
        }
      })

      return Array.from(latestByDevice.values())
    } catch (error) {
      console.error('IoT Service - getLatestProductionData error:', error)
      throw error
    }
  }

  // Buscar estatísticas diárias
  static async getDailyStats(
    machineId: string, 
    date: string = new Date().toISOString().split('T')[0]
  ): Promise<{
    totalSacos: number
    velocidadeMedia: number
    metaDiaria: number
    percentualMeta: number
    tempoAtivo: number
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_machine_production_stats', {
          machine_uuid: machineId,
          target_date: date
        })

      if (error) {
        console.error('Erro ao buscar estatísticas diárias:', error)
        throw new Error('Falha ao carregar estatísticas')
      }

      const stats = data?.[0] || {
        total_sacos: 0,
        velocidade_atual: 0,
        meta_diaria: 0,
        percentual_meta: 0,
        tempo_ativo_minutos: 0
      }

      return {
        totalSacos: stats.total_sacos,
        velocidadeMedia: stats.velocidade_atual,
        metaDiaria: stats.meta_diaria,
        percentualMeta: stats.percentual_meta,
        tempoAtivo: stats.tempo_ativo_minutos
      }
    } catch (error) {
      console.error('IoT Service - getDailyStats error:', error)
      throw error
    }
  }

  // Buscar resumo de produção por período
  static async getProductionSummary(
    startDate: string,
    endDate: string,
    machineId?: string
  ): Promise<DailyProductionSummary[]> {
    try {
      let query = supabase
        .from('daily_production_summary')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (machineId) {
        query = query.eq('machine_id', machineId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar resumo de produção:', error)
        throw new Error('Falha ao carregar resumo de produção')
      }

      return data || []
    } catch (error) {
      console.error('IoT Service - getProductionSummary error:', error)
      throw error
    }
  }

  // Simular dados para ESP32 (para testes)
  static async simulateESP32Data(
    deviceId: string,
    count: number = 1
  ): Promise<boolean> {
    try {
      // Buscar device para verificar se existe
      const { data: device, error: deviceError } = await supabase
        .from('iot_devices')
        .select('id, machine_id')
        .eq('device_id', deviceId)
        .single()

      if (deviceError || !device) {
        throw new Error(`Dispositivo ${deviceId} não encontrado`)
      }

      // Inserir dados simulados
      const simulatedData = {
        device_id: device.id,
        machine_id: device.machine_id,
        timestamp: new Date().toISOString(),
        saco_detectado: true,
        contador_total: count,
        velocidade_por_minuto: Math.floor(Math.random() * 20) + 10, // 10-30 sacos/min
        meta_diaria: 3500,
        turno: 'manha', // Simplificado para teste
        produto_atual: 'TESTE - Produto Simulado'
      }

      const { error: insertError } = await supabase
        .from('production_counting')
        .insert([simulatedData])

      if (insertError) {
        console.error('Erro ao inserir dados simulados:', insertError)
        throw new Error('Falha ao simular dados')
      }

      // Atualizar status do device para online
      await supabase
        .from('iot_devices')
        .update({ 
          status: 'online',
          last_seen: new Date().toISOString()
        })
        .eq('id', device.id)

      return true
    } catch (error) {
      console.error('IoT Service - simulateESP32Data error:', error)
      throw error
    }
  }

  // Verificar conectividade dos dispositivos
  static async checkDeviceConnectivity(): Promise<{
    online: number
    offline: number
    total: number
  }> {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('status')
        .eq('active', true)

      if (error) {
        console.error('Erro ao verificar conectividade:', error)
        throw new Error('Falha ao verificar conectividade')
      }

      const devices = data || []
      const online = devices.filter(d => d.status === 'online').length
      const offline = devices.filter(d => d.status === 'offline').length

      return {
        online,
        offline,
        total: devices.length
      }
    } catch (error) {
      console.error('IoT Service - checkDeviceConnectivity error:', error)
      throw error
    }
  }

  // Testar endpoint da Edge Function
  static async testEdgeFunction(deviceId: string): Promise<boolean> {
    try {
      const testData = {
        device_id: deviceId,
        saco_detectado: true,
        contador_total: Math.floor(Math.random() * 1000) + 1,
        velocidade_por_minuto: Math.floor(Math.random() * 20) + 10,
        meta_diaria: 3500,
        turno: 'manha'
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/iot-contador-sacos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify(testData)
        }
      )

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Erro na Edge Function:', result)
        throw new Error('Falha no teste da Edge Function')
      }

      console.log('Teste Edge Function bem-sucedido:', result)
      return true
    } catch (error) {
      console.error('IoT Service - testEdgeFunction error:', error)
      throw error
    }
  }
}

export default IoTService