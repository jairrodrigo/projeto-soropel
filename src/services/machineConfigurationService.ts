// Service para Configuração de Máquinas - Dados Reais do Banco
// Sistema Soropel - Gestão Completa de Máquinas

import { supabase } from '@/lib/supabase'

export interface ProductFromDB {
  id: string
  soropel_code: number
  name: string
  category_name: string
  description?: string
  paper_type?: string
  weight_value?: number
  active: boolean
}

export interface OrderForMachine {
  id: string
  order_number: string
  customer_name: string
  product_name: string
  quantity: number
  priority: 'urgente' | 'especial' | 'normal'
  delivery_date: string
  status: 'pending' | 'in_production' | 'completed'
  days_until_delivery: number
}

export interface MachineConfiguration {
  machine_id: string
  current_product_id?: string
  current_product?: ProductFromDB
  assigned_orders: OrderForMachine[]
  production_goal: number
  efficiency_target: number
  notes?: string
  status: 'active' | 'maintenance' | 'stopped' | 'waiting'
}

class MachineConfigurationService {
  
  private isSupabaseAvailable(): boolean {
    return Boolean(supabase)
  }

  // Buscar todos os produtos ativos do banco
  async getAvailableProducts(): Promise<{
    success: boolean
    data?: ProductFromDB[]
    error?: string
  }> {
    if (!this.isSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    try {
      console.log('Buscando produtos disponíveis do banco...')

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          soropel_code,
          name,
          category_name,
          description,
          paper_type,
          weight_value,
          active
        `)
        .eq('active', true)
        .order('name')

      if (error) {
        throw new Error(`Erro ao buscar produtos: ${error.message}`)
      }

      console.log(`Produtos carregados: ${data?.length || 0}`)
      return { success: true, data: data || [] }

    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Buscar pedidos ativos para um produto específico
  async getOrdersForProduct(productId: string): Promise<{
    success: boolean
    data?: OrderForMachine[]
    error?: string
  }> {
    if (!this.isSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    try {
      console.log(`Buscando pedidos para produto ${productId}...`)

      // Buscar order_items para o produto
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('id, quantity, order_id')
        .eq('product_id', productId)

      if (error) {
        throw new Error(`Erro ao buscar order_items: ${error.message}`)
      }

      const orders: OrderForMachine[] = []

      if (orderItems && orderItems.length > 0) {
        // Buscar dados dos pedidos
        for (const item of orderItems) {
          try {
            const { data: order } = await supabase
              .from('orders')
              .select(`
                order_number,
                priority,
                delivery_date,
                status,
                customer_id
              `)
              .eq('id', item.order_id)
              .in('status', ['pending', 'in_production'])
              .single()

            if (order) {
              const { data: customer } = await supabase
                .from('customers')
                .select('name')
                .eq('id', order.customer_id)
                .single()

              const { data: product } = await supabase
                .from('products')
                .select('name')
                .eq('id', productId)
                .single()

              const deliveryDate = new Date(order.delivery_date)
              const today = new Date()
              const daysUntil = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

              orders.push({
                id: item.id,
                order_number: order.order_number,
                customer_name: customer?.name || 'Cliente não identificado',
                product_name: product?.name || 'Produto',
                quantity: item.quantity,
                priority: order.priority as 'urgente' | 'especial' | 'normal',
                delivery_date: order.delivery_date,
                status: order.status as 'pending' | 'in_production' | 'completed',
                days_until_delivery: daysUntil
              })
            }
          } catch (orderError) {
            console.warn('Erro ao buscar dados do pedido:', item.order_id, orderError)
          }
        }
      }

      console.log(`Pedidos encontrados: ${orders.length}`)
      return { success: true, data: orders }

    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Buscar configuração atual da máquina
  async getMachineConfiguration(machineId: string): Promise<{
    success: boolean
    data?: MachineConfiguration
    error?: string
  }> {
    if (!this.isSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    try {
      console.log(`Carregando configuração da máquina ${machineId}...`)

      // Buscar dados da máquina pelo machine_number (não pelo UUID)
      const { data: machine, error: machineError } = await supabase
        .from('machines')
        .select(`
          id,
          machine_number,
          name,
          status,
          current_product
        `)
        .eq('machine_number', parseInt(machineId))
        .single()

      if (machineError) {
        throw new Error(`Erro ao buscar máquina: ${machineError.message}`)
      }

      // Buscar bobina atual separadamente se necessário
      let currentBobina = null
      try {
        const { data: bobina } = await supabase
          .from('bobinas')
          .select('reel_number, paper_type')
          .eq('machine_id', machine.id)
          .eq('status', 'active')
          .single()
        
        currentBobina = bobina
      } catch (error) {
        // Bobina não encontrada ou múltiplas - não é erro crítico
        console.log('Bobina atual não encontrada ou múltiplas para máquina:', machineId)
      }

      // Buscar produto atual se houver
      let currentProduct = null
      if (machine.current_product) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('name', machine.current_product)
          .single()
        
        currentProduct = product
      }

      // Buscar pedidos atribuídos à máquina de forma simplificada
      const assignedOrders: OrderForMachine[] = []
      
      try {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('id, quantity, order_id, product_id')
          .eq('planned_machine_id', machine.id)

        if (orderItems && orderItems.length > 0) {
          // Buscar dados dos pedidos separadamente
          for (const item of orderItems) {
            try {
              const { data: order } = await supabase
                .from('orders')
                .select(`
                  order_number,
                  priority,
                  delivery_date,
                  status,
                  customer:customers(name)
                `)
                .eq('id', item.order_id)
                .single()

              const { data: product } = await supabase
                .from('products')
                .select('name')
                .eq('id', item.product_id)
                .single()

              if (order && product) {
                const deliveryDate = new Date(order.delivery_date)
                const today = new Date()
                const daysUntil = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                assignedOrders.push({
                  id: item.id,
                  order_number: order.order_number,
                  customer_name: order.customer?.name || 'Cliente não identificado',
                  product_name: product.name,
                  quantity: item.quantity,
                  priority: order.priority as 'urgente' | 'especial' | 'normal',
                  delivery_date: order.delivery_date,
                  status: order.status as 'pending' | 'in_production' | 'completed',
                  days_until_delivery: daysUntil
                })
              }
            } catch (error) {
              console.warn('Erro ao buscar dados do pedido:', item.id, error)
            }
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar pedidos da máquina:', error)
      }

      const configuration: MachineConfiguration = {
        machine_id: machine.id,
        current_product_id: currentProduct?.id,
        current_product: currentProduct,
        assigned_orders: assignedOrders,
        production_goal: 3000, // Meta padrão 3000 unidades/dia
        efficiency_target: 85, // Meta padrão
        status: this.mapMachineStatus(machine.status),
        notes: `Bobina atual: ${currentBobina?.reel_number || 'Não identificada'}`
      }

      return { success: true, data: configuration }

    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Atualizar produto da máquina
  async updateMachineProduct(
    machineId: string, 
    productId: string,
    selectedOrders: string[] = []
  ): Promise<{
    success: boolean
    error?: string
  }> {
    if (!this.isSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    try {
      console.log(`Atualizando produto da máquina ${machineId}...`)

      // Buscar UUID da máquina pelo machine_number
      const { data: machineData, error: findError } = await supabase
        .from('machines')
        .select('id')
        .eq('machine_number', parseInt(machineId))
        .single()

      if (findError || !machineData) {
        throw new Error(`Máquina ${machineId} não encontrada`)
      }

      // Buscar nome do produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name')
        .eq('id', productId)
        .single()

      if (productError) {
        throw new Error(`Produto não encontrado: ${productError.message}`)
      }

      // Atualizar máquina com novo produto
      const { error: updateError } = await supabase
        .from('machines')
        .update({
          current_product: product.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', machineData.id)

      if (updateError) {
        throw new Error(`Erro ao atualizar máquina: ${updateError.message}`)
      }

      // Atualizar order_items selecionados
      if (selectedOrders.length > 0) {
        const { error: ordersUpdateError } = await supabase
          .from('order_items')
          .update({
            planned_machine_id: machineData.id,
            updated_at: new Date().toISOString()
          })
          .in('id', selectedOrders)

        if (ordersUpdateError) {
          console.warn('Erro ao atualizar pedidos:', ordersUpdateError)
        }
      }

      // Registrar atividade
      await supabase
        .from('activities')
        .insert({
          type: 'changed',
          title: `Máquina ${machineId} - Produto Alterado`,
          description: `Produto alterado para: ${product.name}`,
          machine_id: machineData.id,
          user_name: 'Sistema Configuração',
          metadata: {
            product_id: productId,
            product_name: product.name,
            selected_orders_count: selectedOrders.length
          }
        })

      console.log('Configuração atualizada com sucesso')
      return { success: true }

    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Atualizar status da máquina
  async updateMachineStatus(
    machineId: string,
    status: 'active' | 'maintenance' | 'stopped' | 'waiting',
    reason?: string
  ): Promise<{
    success: boolean
    error?: string
  }> {
    if (!this.isSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    try {
      console.log(`Atualizando status da máquina ${machineId} para ${status}...`)

      // Buscar UUID da máquina pelo machine_number
      const { data: machineData, error: findError } = await supabase
        .from('machines')
        .select('id')
        .eq('machine_number', parseInt(machineId))
        .single()

      if (findError || !machineData) {
        throw new Error(`Máquina ${machineId} não encontrada`)
      }

      // Mapear status para banco
      const dbStatus = this.mapStatusToDB(status)

      const { error } = await supabase
        .from('machines')
        .update({
          status: dbStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', machineData.id)

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`)
      }

      // Registrar atividade
      await supabase
        .from('activities')
        .insert({
          type: 'status_changed',
          title: `Máquina ${machineId} - Status Alterado`,
          description: `Status alterado para: ${status}${reason ? ` - ${reason}` : ''}`,
          machine_id: machineData.id,
          user_name: 'Sistema Configuração',
          metadata: {
            old_status: 'unknown',
            new_status: status,
            reason: reason
          }
        })

      return { success: true }

    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Mapear status do banco para interface
  private mapMachineStatus(status: string): 'active' | 'maintenance' | 'stopped' | 'waiting' {
    const statusMap: Record<string, 'active' | 'maintenance' | 'stopped' | 'waiting'> = {
      'ativa': 'active',
      'manutencao': 'maintenance',
      'inativa': 'stopped',
      'aguardando': 'waiting'
    }
    return statusMap[status] || 'stopped'
  }

  // Mapear status da interface para banco
  private mapStatusToDB(status: 'active' | 'maintenance' | 'stopped' | 'waiting'): string {
    const statusMap: Record<string, string> = {
      'active': 'ativa',
      'maintenance': 'manutencao',
      'stopped': 'inativa',
      'waiting': 'aguardando'
    }
    return statusMap[status] || 'inativa'
  }

  // Calcular métricas da configuração
  calculateConfigurationMetrics(config: MachineConfiguration) {
    const totalQuantity = config.assigned_orders.reduce((sum, order) => sum + order.quantity, 0)
    const urgentOrders = config.assigned_orders.filter(o => o.priority === 'urgente').length
    const nearDeadline = config.assigned_orders.filter(o => o.days_until_delivery <= 3).length
    
    return {
      totalOrders: config.assigned_orders.length,
      totalQuantity,
      urgentOrders,
      nearDeadline,
      averageDaysToDelivery: config.assigned_orders.length > 0 
        ? config.assigned_orders.reduce((sum, o) => sum + o.days_until_delivery, 0) / config.assigned_orders.length 
        : 0,
      isOverloaded: totalQuantity > config.production_goal,
      capacityUtilization: config.production_goal > 0 ? (totalQuantity / config.production_goal) * 100 : 0
    }
  }
}

export const machineConfigurationService = new MachineConfigurationService()
export default machineConfigurationService
