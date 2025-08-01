// 📋 Orders Service - Integração completa com Supabase
// CRUD completo para gestão de pedidos no sistema Soropel

import { supabase } from '../lib/supabase'
import type { DatabaseResult } from '../types/supabase'

// 🎯 TIPOS ESPECÍFICOS PARA PEDIDOS
export interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer_name?: string
  status: 'aguardando_producao' | 'em_producao' | 'produzido' | 'produzido_parcial' | 
         'separado_parcial' | 'cancelado' | 'em_andamento' | 'liberado_completo' | 
         'liberado_parcial' | 'entrega_completa' | 'entrega_parcial'
  priority: 'normal' | 'especial' | 'urgente'
  tipo?: 'timbrado' | 'neutro'
  delivery_date?: string
  notes?: string
  total_quantity?: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  bundles_needed?: number
  packages_needed?: number
  machine_id?: number
  status: 'pendente' | 'em_producao' | 'concluido' | 'cancelado'
  separated_quantity?: number
  progress_percentage?: number
  created_at: string
  updated_at: string
}

export interface NewOrderData {
  order_number: string
  customer_name?: string
  priority?: 'normal' | 'especial' | 'urgente'
  tipo?: 'timbrado' | 'neutro'
  delivery_date?: string
  notes?: string
  produtos: {
    nome: string
    soropel_code?: number
    quantidade: number
    maquinaSugerida?: string
  }[]
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    product?: {
      name: string
      soropel_code: number
    }
    machine?: {
      name: string
    }
  })[]
}

// 🛠️ UTILITÁRIOS INTERNOS
const isSupabaseAvailable = (): boolean => {
  return supabase !== null
}

const createSupabaseUnavailableError = () => {
  return new Error('Supabase não está disponível. Verifique as variáveis de ambiente.')
}

// 📝 FUNÇÃO: CRIAR PEDIDO COMPLETO
export const createOrder = async (orderData: NewOrderData): Promise<DatabaseResult<Order>> => {
  try {
    console.log('🔄 Criando pedido:', orderData.order_number)
    
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    // 1. Criar o pedido principal
    const { data: orderResult, error: orderError } = await supabase!
      .from('orders')
      .insert({
        order_number: orderData.order_number,
        customer_name: orderData.customer_name || 'Cliente não informado',
        priority: orderData.priority || 'normal',
        tipo: orderData.tipo || 'neutro',
        delivery_date: orderData.delivery_date,
        notes: orderData.notes,
        status: 'aguardando_producao'
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Erro ao criar pedido:', orderError)
      return {
        data: null,
        error: `Erro ao criar pedido: ${orderError.message}`
      }
    }

    console.log('✅ Pedido criado:', orderResult.id)

    // 2. Criar os itens do pedido
    if (orderData.produtos && orderData.produtos.length > 0) {
      const orderItems = []
      
      for (const produto of orderData.produtos) {
        // Buscar o produto pelo nome ou código
        let productQuery = supabase!
          .from('products')
          .select('id, soropel_code, name')
          .eq('active', true)

        // Se tem código Soropel, usar ele
        if (produto.soropel_code) {
          productQuery = productQuery.eq('soropel_code', produto.soropel_code)
        } else {
          // Senão, buscar por nome (case insensitive)
          productQuery = productQuery.ilike('name', `%${produto.nome}%`)
        }

        const { data: productData, error: productError } = await productQuery.limit(1).single()

        if (productError) {
          console.warn(`⚠️ Produto não encontrado: ${produto.nome}`)
          continue // Pular este produto se não encontrar
        }

        // Buscar máquina se especificada
        let machineId = null
        if (produto.maquinaSugerida) {
          const machineNumber = produto.maquinaSugerida.match(/\d+/)?.[0]
          if (machineNumber) {
            const { data: machineData } = await supabase!
              .from('machines')
              .select('id')
              .eq('number', parseInt(machineNumber))
              .single()
            
            machineId = machineData?.id || null
          }
        }

        orderItems.push({
          order_id: orderResult.id,
          product_id: productData.id,
          quantity: produto.quantidade,
          machine_id: machineId,
          status: 'pendente'
        })
      }

      // Inserir todos os itens
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase!
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('❌ Erro ao criar itens do pedido:', itemsError)
          // Tentar deletar o pedido criado em caso de erro
          await supabase!.from('orders').delete().eq('id', orderResult.id)
          
          return {
            data: null,
            error: `Erro ao criar itens do pedido: ${itemsError.message}`
          }
        }

        console.log(`✅ ${orderItems.length} itens criados para o pedido`)
      }
    }

    return {
      data: orderResult,
      error: null
    }

  } catch (error) {
    console.error('❌ Erro inesperado ao criar pedido:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// 📝 FUNÇÃO: BUSCAR PEDIDO POR ID
export const getOrderById = async (orderId: string): Promise<DatabaseResult<OrderWithItems>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    const { data, error } = await supabase!
      .from('orders')
      .select(`
        *,
        order_items:order_items (
          *,
          product:products (
            name,
            soropel_code
          ),
          machine:machines (
            name
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      return {
        data: null,
        error: `Erro ao buscar pedido: ${error.message}`
      }
    }

    return {
      data,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// 📝 FUNÇÃO: LISTAR PEDIDOS
export const getOrders = async (
  limit: number = 20,
  offset: number = 0,
  filters?: {
    status?: string
    priority?: string
    customer_name?: string
  }
): Promise<DatabaseResult<Order[]>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    let query = supabase!
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    // Aplicar filtros se fornecidos
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.customer_name) {
      query = query.ilike('customer_name', `%${filters.customer_name}%`)
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        data: null,
        error: `Erro ao buscar pedidos: ${error.message}`
      }
    }

    return {
      data: data || [],
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// 📝 FUNÇÃO: ATUALIZAR STATUS DO PEDIDO
export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status']
): Promise<DatabaseResult<Order>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    const { data, error } = await supabase!
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: `Erro ao atualizar status: ${error.message}`
      }
    }

    return {
      data,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// 📝 FUNÇÃO: DELETAR PEDIDO
export const deleteOrder = async (orderId: string): Promise<DatabaseResult<boolean>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    // Os itens são deletados automaticamente por CASCADE
    const { error } = await supabase!
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) {
      return {
        data: false,
        error: `Erro ao deletar pedido: ${error.message}`
      }
    }

    return {
      data: true,
      error: null
    }

  } catch (error) {
    return {
      data: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// 📊 FUNÇÃO: ESTATÍSTICAS DE PEDIDOS
export const getOrdersStats = async (): Promise<DatabaseResult<{
  total: number
  aguardando_producao: number
  em_producao: number
  concluidos: number
}>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    const { data, error } = await supabase!
      .from('orders')
      .select('status')

    if (error) {
      return {
        data: null,
        error: `Erro ao buscar estatísticas: ${error.message}`
      }
    }

    const stats = {
      total: data.length,
      aguardando_producao: data.filter(o => o.status === 'aguardando_producao').length,
      em_producao: data.filter(o => ['em_producao', 'em_andamento'].includes(o.status)).length,
      concluidos: data.filter(o => ['produzido', 'entrega_completa'].includes(o.status)).length
    }

    return {
      data: stats,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

console.log('📋 Orders Service carregado com sucesso!')
