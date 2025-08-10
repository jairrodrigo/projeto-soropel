// 🔔 Machine Notification Service - Sincronização Nova Bobina → Máquinas
// Notifica automaticamente as máquinas quando bobinas são atribuídas

import { supabase } from '@/lib/supabase'

export interface MachineNotification {
  machineId: string
  bobinaId: string
  bobinaNumero: string
  produto?: string
  timestamp: string
}

// 🔄 Atualizar máquina quando bobina é atribuída
export const notifyMachineAssignment = async (
  machineNumber: string,
  bobinaData: {
    id: string
    codigo: string
    produto?: string
  }
): Promise<boolean> => {
  if (!machineNumber || !bobinaData.id) {
    console.warn('Dados insuficientes para notificar máquina')
    return false
  }

  try {
    console.log(`🔔 Notificando Máquina ${machineNumber} sobre bobina ${bobinaData.codigo}`)

    // 1. Buscar UUID da máquina pelo número
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('id')
      .eq('machine_number', parseInt(machineNumber))
      .single()

    if (machineError || !machine) {
      throw new Error(`Máquina ${machineNumber} não encontrada`)
    }

    // 2. Atualizar bobina com machine_id
    const { error: bobinaError } = await supabase
      .from('bobinas')
      .update({
        machine_id: machine.id,
        status: 'em_maquina',
        product_in_production: bobinaData.produto || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bobinaData.id)

    if (bobinaError) {
      throw new Error(`Erro ao atualizar bobina: ${bobinaError.message}`)
    }

    // 3. Atualizar máquina com a bobina atual
    const { error: machineUpdateError } = await supabase
      .from('machines')
      .update({
        current_bobina_id: bobinaData.id,
        current_product: bobinaData.produto || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', machine.id)

    if (machineUpdateError) {
      throw new Error(`Erro ao atualizar máquina: ${machineUpdateError.message}`)
    }

    // 4. Registrar atividade
    await supabase
      .from('activities')
      .insert({
        type: 'changed',
        title: `Máquina ${machineNumber} - Nova Bobina`,
        description: `Bobina ${bobinaData.codigo} atribuída à máquina`,
        machine_id: machine.id,
        bobina_id: bobinaData.id,
        user_name: 'Sistema Nova Bobina',
        metadata: {
          bobina_codigo: bobinaData.codigo,
          produto: bobinaData.produto
        }
      })

    console.log(`✅ Máquina ${machineNumber} notificada com sucesso`)
    return true

  } catch (error) {
    console.error('❌ Erro ao notificar máquina:', error)
    return false
  }
}

// 🔄 Remover bobina da máquina (quando volta ao estoque)
export const notifyMachineRemoval = async (
  bobinaId: string
): Promise<boolean> => {
  try {
    console.log(`🔔 Removendo bobina ${bobinaId} da máquina`)

    // 1. Buscar bobina com máquina atual
    const { data: bobina, error: bobinaError } = await supabase
      .from('bobinas')
      .select(`
        id,
        reel_number,
        machine_id,
        machines:machines(machine_number)
      `)
      .eq('id', bobinaId)
      .single()

    if (bobinaError || !bobina || !bobina.machine_id) {
      return true // Bobina já não está em máquina
    }

    // 2. Remover bobina da máquina
    const { error: machineError } = await supabase
      .from('machines')
      .update({
        current_bobina_id: null,
        current_product: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bobina.machine_id)

    if (machineError) {
      throw new Error(`Erro ao atualizar máquina: ${machineError.message}`)
    }

    // 3. Atualizar bobina
    const { error: updateError } = await supabase
      .from('bobinas')
      .update({
        machine_id: null,
        status: 'estoque',
        product_in_production: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bobinaId)

    if (updateError) {
      throw new Error(`Erro ao atualizar bobina: ${updateError.message}`)
    }

    // 4. Registrar atividade
    const machineNumber = bobina.machines?.machine_number
    if (machineNumber) {
      await supabase
        .from('activities')
        .insert({
          type: 'changed',
          title: `Máquina ${machineNumber} - Bobina Removida`,
          description: `Bobina ${bobina.reel_number} removida da máquina`,
          machine_id: bobina.machine_id,
          bobina_id: bobinaId,
          user_name: 'Sistema Nova Bobina',
          metadata: {
            bobina_codigo: bobina.reel_number,
            acao: 'remocao'
          }
        })
    }

    console.log(`✅ Bobina removida da máquina com sucesso`)
    return true

  } catch (error) {
    console.error('❌ Erro ao remover bobina da máquina:', error)
    return false
  }
}

// 🔄 Buscar notificações pendentes para uma máquina
export const getMachineNotifications = async (
  machineNumber: string
): Promise<MachineNotification[]> => {
  try {
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('id')
      .eq('machine_number', parseInt(machineNumber))
      .single()

    if (machineError || !machine) {
      return []
    }

    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        *,
        bobinas:bobina_id(reel_number)
      `)
      .eq('machine_id', machine.id)
      .eq('type', 'changed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24h
      .order('created_at', { ascending: false })
      .limit(10)

    if (activitiesError) {
      return []
    }

    return activities.map(activity => ({
      machineId: machine.id,
      bobinaId: activity.bobina_id || '',
      bobinaNumero: activity.bobinas?.reel_number || 'N/A',
      produto: activity.metadata?.produto,
      timestamp: activity.created_at
    }))

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return []
  }
}

export default {
  notifyMachineAssignment,
  notifyMachineRemoval,
  getMachineNotifications
}
