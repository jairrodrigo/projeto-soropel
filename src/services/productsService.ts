// 📦 Products Service - Sistema Soropel
// Serviços para interação com produtos no Supabase

import { supabase, isSupabaseAvailable, createSupabaseUnavailableError } from '../lib/supabase'
import type { Product, ProductFilters, DatabaseResult, PaginatedResponse } from '../types/supabase'

// 🔍 BUSCAR PRODUTOS
export const getProducts = async (
  filters?: ProductFilters,
  page = 1,
  pageSize = 50
): Promise<DatabaseResult<PaginatedResponse<Product>>> => {
  
  // 🛡️ Verificar se Supabase está disponível
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError() as DatabaseResult<PaginatedResponse<Product>>
  }
  
  try {
    let query = supabase!
      .from('products')
      .select('*', { count: 'exact' })

    // 🎯 Aplicar filtros
    if (filters?.category_code) {
      query = query.eq('category_code', filters.category_code)
    }
    
    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active)
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,soropel_code.eq.${filters.search}`)
    }
    
    if (filters?.weight_min) {
      query = query.gte('weight_value', filters.weight_min)
    }
    
    if (filters?.weight_max) {
      query = query.lte('weight_value', filters.weight_max)
    }

    // 📄 Paginação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    query = query
      .order('soropel_code', { ascending: true })
      .range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error)
      return { error }
    }

    return {
      data: {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🔍 BUSCAR PRODUTO POR CÓDIGO
export const getProductByCode = async (soropelCode: number): Promise<DatabaseResult<Product>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('soropel_code', soropelCode)
      .eq('active', true)
      .single()

    if (error) {
      console.error('❌ Erro ao buscar produto por código:', error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { error: 'Erro de conexão' }
  }
}

// 📊 BUSCAR CATEGORIAS
export const getCategories = async (): Promise<DatabaseResult<Array<{
  category_code: string
  category_name: string
  count: number
}>>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category_code, category_name')
      .eq('active', true)

    if (error) {
      console.error('❌ Erro ao buscar categorias:', error)
      return { error }
    }

    // Agrupar e contar por categoria
    const categories = data?.reduce((acc, product) => {
      const existing = acc.find(c => c.category_code === product.category_code)
      if (existing) {
        existing.count++
      } else {
        acc.push({
          category_code: product.category_code,
          category_name: product.category_name,
          count: 1
        })
      }
      return acc
    }, [] as Array<{category_code: string, category_name: string, count: number}>)

    return { data: categories || [] }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🔍 BUSCAR PRODUTOS POR CATEGORIA
export const getProductsByCategory = async (categoryCode: string): Promise<DatabaseResult<Product[]>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_code', categoryCode)
      .eq('active', true)
      .order('soropel_code', { ascending: true })

    if (error) {
      console.error('❌ Erro ao buscar produtos por categoria:', error)
      return { error }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🔍 BUSCAR PRODUTOS MAIS USADOS
export const getPopularProducts = async (limit = 10): Promise<DatabaseResult<Product[]>> => {
  try {
    // Por enquanto, buscar por ordem alfabética
    // TODO: Implementar ranking baseado em frequência de uso
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('❌ Erro ao buscar produtos populares:', error)
      return { error }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { error: 'Erro de conexão' }
  }
}

// ➕ CRIAR PRODUTO
export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<Product>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar produto:', error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { error: 'Erro de conexão' }
  }
}

// ✏️ ATUALIZAR PRODUTO
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<DatabaseResult<Product>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar produto:', error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🗑️ DELETAR PRODUTO (soft delete)
export const deleteProduct = async (id: string): Promise<DatabaseResult<boolean>> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      console.error('❌ Erro ao deletar produto:', error)
      return { error }
    }

    return { data: true }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { error: 'Erro de conexão' }
  }
}