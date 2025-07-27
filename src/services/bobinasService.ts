// 🗄️ Bobinas Service - Integração completa com Supabase
// CRUD completo para gestão de bobinas no sistema Soropel

import { supabase } from '../lib/supabase'
import type { DatabaseResult } from '../types/supabase'

// 🎯 TIPOS ESPECÍFICOS PARA BOBINAS
export interface Bobina {
  id: string
  codigo: string
  supplier_id: string
  paper_type_id: string
  gramatura: number
  peso_inicial: number
  peso_atual: number
  largura?: number
  diametro?: number
  status: 'estoque' | 'em_maquina' | 'sobra' | 'acabou'
  observacoes?: string
  data_entrada: string
  data_saida?: string
  created_at: string
  updated_at: string
}

export interface NewBobinaData {
  codigo: string
  supplier_name: string
  paper_type_name: string
  gramatura: number
  peso_inicial: number
  peso_atual?: number
  largura?: number
  diametro?: number
  status?: 'estoque' | 'em_maquina' | 'sobra' | 'acabou'
  observacoes?: string
  data_entrada?: string
}

export interface BobinaWithDetails extends Bobina {
  supplier_name: string
  paper_type_name: string
}

export interface BobinaFilters {
  status?: string
  supplier_id?: string
  paper_type_id?: string
  search?: string
  data_inicio?: string
  data_fim?: string
}

export interface BobinaStats {
  total_bobinas: number
  em_estoque: number
  em_uso: number
  sobras: number
  peso_total_estoque: number
  peso_medio_bobina: number
  fornecedor_mais_usado: string
  tipo_papel_mais_usado: string
}

// 🔍 BUSCAR BOBINAS COM FILTROS
export const getBobinas = async (
  filters?: BobinaFilters,
  page = 1,
  pageSize = 50
): Promise<DatabaseResult<{ data: BobinaWithDetails[], count: number }>> => {
  try {
    let query = supabase
      .from('bobinas')
      .select(`
        *,
        suppliers!inner(name),
        paper_types!inner(name)
      `, { count: 'exact' })

    // 🎯 Aplicar filtros
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id)
    }
    
    if (filters?.paper_type_id) {
      query = query.eq('paper_type_id', filters.paper_type_id)
    }
    
    if (filters?.search) {
      query = query.or(`codigo.ilike.%${filters.search}%,observacoes.ilike.%${filters.search}%`)
    }
    
    if (filters?.data_inicio) {
      query = query.gte('data_entrada', filters.data_inicio)
    }
    
    if (filters?.data_fim) {
      query = query.lte('data_entrada', filters.data_fim)
    }

    // Paginação e ordenação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('❌ Erro ao buscar bobinas:', error)
      return { error: error.message }
    }

    // Transformar dados para formato frontend
    const bobinasWithDetails: BobinaWithDetails[] = (data || []).map(item => ({
      id: item.id,
      codigo: item.codigo,
      supplier_id: item.supplier_id,
      paper_type_id: item.paper_type_id,
      gramatura: item.gramatura,
      peso_inicial: item.peso_inicial,
      peso_atual: item.peso_atual,
      largura: item.largura,
      diametro: item.diametro,
      status: item.status,
      observacoes: item.observacoes,
      data_entrada: item.data_entrada,
      data_saida: item.data_saida,
      created_at: item.created_at,
      updated_at: item.updated_at,
      supplier_name: item.suppliers?.name || 'N/A',
      paper_type_name: item.paper_types?.name || 'N/A'
    }))

    return { 
      data: { 
        data: bobinasWithDetails, 
        count: count || 0 
      } 
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar bobinas:', error)
    return { error: 'Erro de conexão' }
  }
}

// ➕ CRIAR NOVA BOBINA
export const createBobina = async (bobinaData: NewBobinaData): Promise<DatabaseResult<Bobina>> => {
  try {
    console.log('🚀 Criando nova bobina:', bobinaData)

    // 🔍 Buscar ou criar fornecedor
    let supplier_id: string
    
    const { data: existingSupplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('name', bobinaData.supplier_name)
      .single()

    if (existingSupplier) {
      supplier_id = existingSupplier.id
    } else {
      // Criar novo fornecedor
      const { data: newSupplier, error: supplierError } = await supabase
        .from('suppliers')
        .insert([{
          name: bobinaData.supplier_name,
          tipo: 'papel',
          ativo: true
        }])
        .select('id')
        .single()

      if (supplierError || !newSupplier) {
        console.error('❌ Erro ao criar fornecedor:', supplierError)
        return { error: 'Erro ao processar fornecedor' }
      }

      supplier_id = newSupplier.id
    }

    // 🔍 Buscar ou criar tipo de papel
    let paper_type_id: string
    
    const { data: existingPaperType } = await supabase
      .from('paper_types')
      .select('id')
      .eq('name', bobinaData.paper_type_name)
      .single()

    if (existingPaperType) {
      paper_type_id = existingPaperType.id
    } else {
      // Criar novo tipo de papel
      const { data: newPaperType, error: paperTypeError } = await supabase
        .from('paper_types')
        .insert([{
          name: bobinaData.paper_type_name,
          categoria: 'kraft', // Default
          ativo: true
        }])
        .select('id')
        .single()

      if (paperTypeError || !newPaperType) {
        console.error('❌ Erro ao criar tipo de papel:', paperTypeError)
        return { error: 'Erro ao processar tipo de papel' }
      }

      paper_type_id = newPaperType.id
    }

    // 💾 Criar bobina
    const { data, error } = await supabase
      .from('bobinas')
      .insert([{
        codigo: bobinaData.codigo,
        supplier_id,
        paper_type_id,
        gramatura: bobinaData.gramatura,
        peso_inicial: bobinaData.peso_inicial,
        peso_atual: bobinaData.peso_atual || bobinaData.peso_inicial,
        largura: bobinaData.largura,
        diametro: bobinaData.diametro,
        status: bobinaData.status || 'estoque',
        observacoes: bobinaData.observacoes,
        data_entrada: bobinaData.data_entrada || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar bobina:', error)
      return { error: error.message }
    }

    console.log('✅ Bobina criada com sucesso:', data.id)
    return { data }
  } catch (error) {
    console.error('❌ Erro inesperado ao criar bobina:', error)
    return { error: 'Erro de conexão' }
  }
}

// 📝 ATUALIZAR BOBINA
export const updateBobina = async (
  id: string, 
  updates: Partial<NewBobinaData>
): Promise<DatabaseResult<Bobina>> => {
  try {
    // Preparar dados para atualização
    const updateData: any = {}
    
    if (updates.peso_atual !== undefined) updateData.peso_atual = updates.peso_atual
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.observacoes !== undefined) updateData.observacoes = updates.observacoes
    if (updates.data_entrada !== undefined) updateData.data_entrada = updates.data_entrada
    
    const { data, error } = await supabase
      .from('bobinas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar bobina:', error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('❌ Erro inesperado ao atualizar bobina:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🗑️ DELETAR BOBINA
export const deleteBobina = async (id: string): Promise<DatabaseResult<void>> => {
  try {
    const { error } = await supabase
      .from('bobinas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Erro ao deletar bobina:', error)
      return { error: error.message }
    }

    return { data: undefined }
  } catch (error) {
    console.error('❌ Erro inesperado ao deletar bobina:', error)
    return { error: 'Erro de conexão' }
  }
}

// 📊 ESTATÍSTICAS DAS BOBINAS
export const getBobinaStats = async (): Promise<DatabaseResult<BobinaStats>> => {
  try {
    // Buscar estatísticas básicas
    const { data: bobinas, error } = await supabase
      .from('bobinas')
      .select(`
        status,
        peso_atual,
        suppliers!inner(name),
        paper_types!inner(name)
      `)

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error)
      return { error: error.message }
    }

    const stats: BobinaStats = {
      total_bobinas: bobinas.length,
      em_estoque: bobinas.filter(b => b.status === 'estoque').length,
      em_uso: bobinas.filter(b => b.status === 'em_maquina').length,
      sobras: bobinas.filter(b => b.status === 'sobra').length,
      peso_total_estoque: bobinas
        .filter(b => b.status === 'estoque')
        .reduce((sum, b) => sum + (b.peso_atual || 0), 0),
      peso_medio_bobina: bobinas.length > 0 
        ? bobinas.reduce((sum, b) => sum + (b.peso_atual || 0), 0) / bobinas.length
        : 0,
      fornecedor_mais_usado: 'N/A',
      tipo_papel_mais_usado: 'N/A'
    }

    // Calcular fornecedor mais usado
    const supplierCounts = bobinas.reduce((acc, b) => {
      const supplier = b.suppliers?.name || 'N/A'
      acc[supplier] = (acc[supplier] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    stats.fornecedor_mais_usado = Object.entries(supplierCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

    // Calcular tipo mais usado
    const paperTypeCounts = bobinas.reduce((acc, b) => {
      const paperType = b.paper_types?.name || 'N/A'
      acc[paperType] = (acc[paperType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    stats.tipo_papel_mais_usado = Object.entries(paperTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

    return { data: stats }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar estatísticas:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🔍 BUSCAR FORNECEDORES DISPONÍVEIS
export const getAvailableSuppliers = async (): Promise<DatabaseResult<Array<{id: string, name: string}>>> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('ativo', true)
      .order('name')

    if (error) {
      console.error('❌ Erro ao buscar fornecedores:', error)
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar fornecedores:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🔍 BUSCAR TIPOS DE PAPEL DISPONÍVEIS
export const getAvailablePaperTypes = async (): Promise<DatabaseResult<Array<{id: string, name: string}>>> => {
  try {
    const { data, error } = await supabase
      .from('paper_types')
      .select('id, name')
      .eq('ativo', true)
      .order('name')

    if (error) {
      console.error('❌ Erro ao buscar tipos de papel:', error)
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar tipos de papel:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🧪 TESTAR CONEXÃO BOBINAS
export const testBobinaConnection = async (): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('bobinas')
      .select('count')
      .limit(1)
    
    console.log('✅ Bobinas Service conectado ao Supabase!')
    return true
  } catch (error) {
    console.error('❌ Erro na conexão Bobinas Service:', error)
    return false
  }
}

export default {
  getBobinas,
  createBobina,
  updateBobina,
  deleteBobina,
  getBobinaStats,
  getAvailableSuppliers,
  getAvailablePaperTypes,
  testBobinaConnection
}
