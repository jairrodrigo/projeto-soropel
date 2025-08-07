import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/supabase'

export interface MachineProduct {
  id: string
  machine_id: string
  product_id: string
  assigned_at: string
  assigned_by: string
  active: boolean
  created_at: string
  updated_at: string
  // Relacionamentos
  product?: Product
}

export interface MachineProductsConfig {
  machine_id: string
  machine_number: number
  machine_name: string
  products: Product[]
}

/**
 * Buscar todos os produtos configurados para uma máquina específica
 */
export async function getMachineProducts(machineId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('machine_products')
      .select(`
        *,
        product:products(*)
      `)
      .eq('machine_id', machineId)
      .eq('active', true)

    if (error) {
      console.error('Erro ao buscar produtos da máquina:', error)
      throw error
    }

    return data?.map(item => item.product).filter(Boolean) || []
  } catch (error) {
    console.error('Erro no getMachineProducts:', error)
    throw error
  }
}

/**
 * Buscar configuração completa de produtos para todas as máquinas
 */
export async function getAllMachinesProductsConfig(): Promise<MachineProductsConfig[]> {
  try {
    // Buscar todas as máquinas
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, machine_number, name')
      .order('machine_number')

    if (machinesError) {
      console.error('Erro ao buscar máquinas:', machinesError)
      throw machinesError
    }

    if (!machines) return []

    // Buscar produtos para cada máquina
    const configs: MachineProductsConfig[] = []
    
    for (const machine of machines) {
      const products = await getMachineProducts(machine.id)
      
      configs.push({
        machine_id: machine.id,
        machine_number: machine.machine_number,
        machine_name: machine.name,
        products
      })
    }

    return configs
  } catch (error) {
    console.error('Erro no getAllMachinesProductsConfig:', error)
    throw error
  }
}

/**
 * Atribuir um produto a uma máquina
 */
export async function assignProductToMachine(
  machineId: string, 
  productId: string,
  assignedBy: string = 'Sistema'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('machine_products')
      .upsert({
        machine_id: machineId,
        product_id: productId,
        assigned_by: assignedBy,
        active: true
      }, {
        onConflict: 'machine_id,product_id'
      })

    if (error) {
      console.error('Erro ao atribuir produto à máquina:', error)
      throw error
    }

    console.log(`✅ Produto ${productId} atribuído à máquina ${machineId}`)
  } catch (error) {
    console.error('Erro no assignProductToMachine:', error)
    throw error
  }
}

/**
 * Remover um produto de uma máquina
 */
export async function removeProductFromMachine(
  machineId: string, 
  productId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('machine_products')
      .update({ active: false })
      .eq('machine_id', machineId)
      .eq('product_id', productId)

    if (error) {
      console.error('Erro ao remover produto da máquina:', error)
      throw error
    }

    console.log(`❌ Produto ${productId} removido da máquina ${machineId}`)
  } catch (error) {
    console.error('Erro no removeProductFromMachine:', error)  
    throw error
  }
}

/**
 * Salvar configuração completa de uma máquina (substituir todos os produtos)
 */
export async function saveMachineProductsConfig(
  machineId: string,
  productIds: string[],
  assignedBy: string = 'Sistema'
): Promise<void> {
  try {
    // 1. Desativar todos os produtos atuais desta máquina
    const { error: deactivateError } = await supabase
      .from('machine_products')
      .update({ active: false })
      .eq('machine_id', machineId)

    if (deactivateError) {
      console.error('Erro ao desativar produtos existentes:', deactivateError)
      throw deactivateError
    }

    // 2. Inserir/ativar os novos produtos
    if (productIds.length > 0) {
      const machineProducts = productIds.map(productId => ({
        machine_id: machineId,
        product_id: productId,
        assigned_by: assignedBy,
        active: true
      }))

      const { error: insertError } = await supabase
        .from('machine_products')
        .upsert(machineProducts, {
          onConflict: 'machine_id,product_id'
        })

      if (insertError) {
        console.error('Erro ao inserir novos produtos:', insertError)
        throw insertError
      }
    }

    console.log(`✅ Configuração da máquina ${machineId} salva com ${productIds.length} produtos`)
  } catch (error) {
    console.error('Erro no saveMachineProductsConfig:', error)
    throw error
  }
}

/**
 * Salvar configuração completa de todas as máquinas
 */
export async function saveAllMachinesProductsConfig(
  configs: { machineId: string; productIds: string[] }[],
  assignedBy: string = 'Sistema'
): Promise<void> {
  try {
    console.log('💾 Salvando configuração completa de máquinas:', configs)

    for (const config of configs) {
      await saveMachineProductsConfig(config.machineId, config.productIds, assignedBy)
    }

    console.log('✅ Todas as configurações de máquinas foram salvas com sucesso!')
  } catch (error) {
    console.error('Erro no saveAllMachinesProductsConfig:', error)
    throw error
  }
}
