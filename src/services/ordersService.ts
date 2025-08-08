// 📋 Orders Service - Integração completa com Supabase
// CRUD completo para gestão de pedidos no sistema Soropel

import { supabase } from '../lib/supabase'
import type { DatabaseResult } from '../types/supabase'

// 🎯 TIPOS ESPECÍFICOS PARA PEDIDOS
export interface Order {
  id: string
  order_number: string
  client_id?: string | null
  status: 'pendente' | 'producao' | 'finalizado' | 'entregue'
  priority: 'normal' | 'especial' | 'urgente'
  delivery_date?: string
  observations?: string
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
  client_id?: string | null
  priority?: 'normal' | 'especial' | 'urgente'
  delivery_date?: string
  observations?: string
  notes?: string // Compatibilidade
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
  console.log('🔍 DEBUG - isSupabaseAvailable check:', {
    supabaseExists: !!supabase,
    supabaseNull: supabase === null,
    supabaseUndefined: supabase === undefined
  })
  return !!supabase
}

const createSupabaseUnavailableError = () => {
  return new Error('Supabase não está disponível. Verifique as variáveis de ambiente.')
}

// 🔄 CONVERSÃO DE PRIORIDADES
const convertFrontendPriorityToDatabase = (frontendPriority: string): 'normal' | 'especial' | 'urgente' => {
  switch (frontendPriority) {
    case 'urgente': return 'urgente'
    case 'alta': return 'especial'
    case 'media': return 'normal'
    case 'baixa': return 'normal'
    default: return 'normal'
  }
}

// 🔍 FUNÇÃO PARA CALCULAR SIMILARIDADE ENTRE STRINGS
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const levenshteinDistance = (s1: string, s2: string): number => {
    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null))
    
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        )
      }
    }
    
    return matrix[s2.length][s1.length]
  }
  
  return (longer.length - levenshteinDistance(longer, shorter)) / longer.length
}

// 📝 FUNÇÃO: CRIAR PEDIDO COMPLETO
export const createOrder = async (orderData: NewOrderData): Promise<DatabaseResult<Order>> => {
  try {
    // ✅ Log removido para console limpo
    
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    // 1. Criar o pedido principal
    const { data: orderResult, error: orderError } = await supabase!
      .from('orders')
      .insert({
        order_number: orderData.order_number,
        client_id: orderData.client_id || null, // NULL é permitido
        priority: convertFrontendPriorityToDatabase(orderData.priority || 'normal'),
        delivery_date: orderData.delivery_date,
        observations: orderData.observations || orderData.notes,
        status: 'pendente' // Status válido conforme constraint
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

    // ✅ Log removido para console limpo

    // 2. Criar os itens do pedido
    if (orderData.produtos && orderData.produtos.length > 0) {
      const orderItems = []
      
      for (const produto of orderData.produtos) {
        // 🔍 BUSCA INTELIGENTE DE PRODUTOS
        let productData = null
        let productError = null

        // Estratégia 1: Se tem código Soropel, usar ele (mais preciso)
        if (produto.soropel_code) {
          const result = await supabase!
            .from('products')
            .select('id, soropel_code, name')
            .eq('active', true)
            .eq('soropel_code', produto.soropel_code)
            .limit(1)
          
          if (result.data && result.data.length > 0) {
            productData = result.data[0]
            productError = null
          }
        }

        // Estratégia 2: Busca exata por nome (se não achou por código)
        if (!productData && produto.nome) {
          const result = await supabase!
            .from('products')
            .select('id, soropel_code, name')
            .eq('active', true)
            .ilike('name', produto.nome.trim())
            .limit(1)
          
          if (result.data && result.data.length > 0) {
            productData = result.data[0]
            productError = null
          }
        }

        // Estratégia 3: Busca por palavras-chave importantes
        if (!productData && produto.nome) {
          // Extrair palavras-chave do nome do produto
          const keywords = produto.nome
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove pontuação
            .split(/\s+/)
            .filter(word => word.length > 2) // Palavras com mais de 2 chars
            .filter(word => !['saco', 'de', 'da', 'do', 'com', 'para'].includes(word)) // Remove stopwords

          console.log(`🔍 Tentando buscar produto com keywords: ${keywords.join(', ')} (original: ${produto.nome})`)

          // Tentar busca com primeira palavra-chave importante
          if (keywords.length > 0) {
            const result = await supabase!
              .from('products')
              .select('id, soropel_code, name')
              .eq('active', true)
              .ilike('name', `%${keywords[0]}%`)
              .limit(5) // Pegar várias opções

            if (result.data && result.data.length > 0) {
              // Se tem múltiplas opções, tentar encontrar a melhor match
              let bestMatch = result.data[0]
              if (result.data.length > 1) {
                for (const candidate of result.data) {
                  const similarity = calculateSimilarity(produto.nome.toLowerCase(), candidate.name.toLowerCase())
                  if (similarity > calculateSimilarity(produto.nome.toLowerCase(), bestMatch.name.toLowerCase())) {
                    bestMatch = candidate
                  }
                }
              }
              productData = bestMatch
              productError = null
              console.log(`✅ Produto encontrado por keyword: ${bestMatch.name} (código: ${bestMatch.soropel_code})`)
            }
          }
        }

        if (!productData) {
          console.warn(`⚠️ Produto não encontrado após busca inteligente: ${produto.nome}`)
          continue // Pular este produto se não encontrar
        }

        // Buscar máquina se especificada
        let machineId = null
        if (produto.maquinaSugerida) {
          const machineNumber = produto.maquinaSugerida.match(/\d+/)?.[0]
          if (machineNumber) {
            const { data: machineData, error: machineError } = await supabase!
              .from('machines')
              .select('id')
              .eq('machine_number', parseInt(machineNumber))
              .single()
            
            if (machineData && !machineError) {
              machineId = machineData.id
            } else {
              console.warn(`⚠️ Máquina ${machineNumber} não encontrada`)
            }
          }
        }

        console.log(`🔍 DEBUG - Adicionando order_item: produto=${productData.name} (${productData.id}), quantidade=${produto.quantidade}, máquina=${machineId}`)

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
        console.log(`🔍 DEBUG - Criando ${orderItems.length} order_items:`, orderItems)
        
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

        console.log(`✅ DEBUG - ${orderItems.length} order_items criados com sucesso`)
      } else {
        console.warn('⚠️ DEBUG - Nenhum order_item para criar!')
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

// 📝 FUNÇÃO: BUSCAR PEDIDO POR ORDER_NUMBER (OP-XXXX)
export const getOrderByNumber = async (orderNumber: string): Promise<DatabaseResult<OrderWithItems>> => {
  console.log('🔍 DEBUG - getOrderByNumber chamada para:', orderNumber)
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
      .eq('order_number', orderNumber)
      .single()

    if (error) {
      console.log('🚨 DEBUG - Erro no getOrderByNumber:', error)
      return {
        data: null,
        error: `Erro ao buscar pedido: ${error.message}`
      }
    }

    console.log('✅ DEBUG - Pedido encontrado por order_number:', data.order_number)
    return {
      data,
      error: null
    }

  } catch (error) {
    console.log('🚨 DEBUG - Erro capturado no getOrderByNumber:', error)
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
  console.log('🔍 DEBUG - getOrders chamada iniciada')
  try {
    if (!isSupabaseAvailable()) {
      console.log('🚨 DEBUG - Supabase não disponível, retornando erro')
      throw createSupabaseUnavailableError()
    }

    console.log('🔍 DEBUG - Executando query Supabase...')
    let query = supabase!
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          status,
          product:products (
            id,
            name,
            soropel_code
          ),
          machine:machines (
            id,
            name,
            machine_number
          )
        )
      `)
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

    console.log('🔍 DEBUG - Resultado query:', { data, error, dataLength: data?.length })

    if (data && data.length > 0) {
      console.log('🔍 DEBUG - Primeiro pedido com order_items:', {
        orderId: data[0].id,
        orderItemsCount: data[0].order_items?.length || 0,
        orderItems: data[0].order_items
      })
    }

    if (error) {
      console.log('🚨 DEBUG - Erro na query:', error)
      return {
        data: null,
        error: `Erro ao buscar pedidos: ${error.message}`
      }
    }

    console.log('✅ DEBUG - Retornando dados:', data?.length || 0, 'pedidos')
    return {
      data: data || [],
      error: null
    }

  } catch (error) {
    console.log('🚨 DEBUG - Erro capturado na getOrders:', error)
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

// 📝 FUNÇÃO: ATUALIZAR PEDIDO COMPLETO
export const updateOrder = async (
  orderId: string,
  updateData: {
    priority?: Order['priority']
    tipo?: Order['tipo']
    delivery_date?: string
    observations?: string
    status?: Order['status']
  }
): Promise<DatabaseResult<Order>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    const { data, error } = await supabase!
      .from('orders')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: `Erro ao atualizar pedido: ${error.message}`
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

// 📝 FUNÇÃO: ATUALIZAR ITEM DO PEDIDO
export const updateOrderItem = async (
  itemId: string,
  updateData: {
    quantity?: number
    machine_id?: number
    status?: OrderItem['status']
  }
): Promise<DatabaseResult<OrderItem>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    const { data, error } = await supabase!
      .from('order_items')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: `Erro ao atualizar item: ${error.message}`
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

// 📝 FUNÇÃO: DELETAR ITEM DO PEDIDO
export const deleteOrderItem = async (itemId: string): Promise<DatabaseResult<boolean>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    const { error } = await supabase!
      .from('order_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      return {
        data: false,
        error: `Erro ao deletar item: ${error.message}`
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

// 📝 FUNÇÃO: ADICIONAR ITEM AO PEDIDO
export const addOrderItem = async (itemData: {
  order_id: string
  product_id: string
  quantity: number
  machine_id?: number
}): Promise<DatabaseResult<OrderItem>> => {
  try {
    if (!isSupabaseAvailable()) {
      throw createSupabaseUnavailableError()
    }

    const { data, error } = await supabase!
      .from('order_items')
      .insert({
        ...itemData,
        status: 'pendente'
      })
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: `Erro ao adicionar item: ${error.message}`
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

// ✅ Service carregado - log removido para console limpo
