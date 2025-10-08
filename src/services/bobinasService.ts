// 🗄️ Bobinas Service - Integração completa com Supabase
// CRUD completo para gestão de bobinas no sistema Soropel

import { supabase } from '../lib/supabase'
import { logDebug, logInfo, logError } from '../utils/logger'
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
  condutor?: string
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
    if (!checkSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    let query = supabase!
      .from('rolls')
      .select(`
        *
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
      supplier_name: Array.isArray(item.suppliers) ? item.suppliers[0]?.name || 'N/A' : item.suppliers?.name || 'N/A',
      paper_type_name: Array.isArray(item.paper_types) ? item.paper_types[0]?.name || 'N/A' : item.paper_types?.name || 'N/A'
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

// ➕ CRIAR OU ATUALIZAR BOBINA (UPSERT) - SOLUÇÃO PARA PROBLEMA DE DUPLICAÇÃO
export const upsertBobina = async (bobinaData: NewBobinaData): Promise<DatabaseResult<Bobina>> => {
  try {
    if (!checkSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    // ✅ Log removido para console limpo
    // ✅ Log removido para console limpo
    
    // 🔍 VERIFICAR SE BOBINA JÁ EXISTE
    // ✅ Log removido para console limpo
    const { data: existingBobina, error: searchError } = await supabase!
      .from('rolls')
      .select('id, roll_code, status')
      .eq('roll_code', bobinaData.codigo)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar bobina existente:', searchError)
      return { error: `Erro ao verificar bobina: ${searchError.message}` }
    }

    // 🔄 SE EXISTE, ATUALIZAR STATUS
    if (existingBobina) {
      // ✅ Log removido para console limpo
      // ✅ Log removido para console limpo
      
      const normalizeStatusForDb = (status?: string): 'estoque' | 'em_maquina' | 'sobra' | 'acabou' => {
        switch (status) {
          case 'em_maquina':
          case 'estoque':
          case 'sobra':
          case 'acabou':
            return status as 'estoque' | 'em_maquina' | 'sobra' | 'acabou'
          case 'em-maquina':
            return 'em_maquina'
          default:
            return 'estoque'
        }
      }

      const normalizedStatus = normalizeStatusForDb(bobinaData.status)

      const updateData: any = {
        status: normalizedStatus,
        // O schema usa "weight" para peso da bobina
        weight: bobinaData.peso_atual ?? bobinaData.peso_inicial,
        // Se existir coluna de notas/observações, enviar
        ...(bobinaData.observacoes ? { notes: bobinaData.observacoes } : {})
      }
      
      // Se status for em_maquina, registrar data de instalação
      if (normalizedStatus === 'em_maquina') {
        updateData.installation_date = new Date().toISOString().split('T')[0]
      }

      // Se for mudança para sobra, atualizar observações
      // Observações não existem no schema atual de rolls, então ignoramos aqui

      const { data: updatedBobina, error: updateError } = await supabase!
        .from('rolls')
        .update(updateData)
        .eq('id', existingBobina.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Erro ao atualizar bobina:', updateError)
        return { error: updateError.message }
      }

      // ✅ Log removido para console limpo
      return { data: updatedBobina }
    }

    // ➕ SE NÃO EXISTE, CRIAR NOVA
    logDebug('BobinasService', 'Bobina não existe, criando nova...')
    return await createBobina(bobinaData)
  } catch (error) {
    console.error('❌ Erro inesperado no upsert bobina:', error)
    return { error: 'Erro de conexão' }
  }
}

// ➕ CRIAR NOVA BOBINA (função original mantida para casos específicos)
export const createBobina = async (bobinaData: NewBobinaData): Promise<DatabaseResult<Bobina>> => {
  try {
    // ✅ Log removido para console limpo
    // ✅ Log removido para console limpo
    // ✅ Log removido para console limpo

    // Nota: Sistema atual não usa tabela de fornecedores separada
    // O nome do fornecedor é armazenado diretamente na bobina

    // Nota: Sistema atual não usa tabela de tipos de papel separada
    // O tipo de papel é armazenado diretamente na bobina

    // 💾 Criar bobina
    logDebug('BobinasService', 'Criando bobina no banco', { 
      roll_code: bobinaData.codigo,
      supplier: bobinaData.supplier_name,
      paper_type: bobinaData.paper_type_name
    })
    
    const normalizeStatusForDb = (status?: string): 'estoque' | 'em_maquina' | 'sobra' | 'acabou' => {
      switch (status) {
        case 'em_maquina':
        case 'estoque':
        case 'sobra':
        case 'acabou':
          return status as 'estoque' | 'em_maquina' | 'sobra' | 'acabou'
        case 'em-maquina':
          return 'em_maquina'
        default:
          return 'estoque'
      }
    }

    const normalizedStatus = normalizeStatusForDb(bobinaData.status)

    const { data: newBobina, error: bobinaError } = await supabase
      .from('rolls')
      .insert([{
        roll_code: bobinaData.codigo,
        supplier: bobinaData.supplier_name,
        paper_type: bobinaData.paper_type_name,
        // width é NOT NULL no schema
        width: bobinaData.largura ?? 0,
        // Ajuste: para status 'sobra', persistir o peso_atual (peso da sobra). Caso contrário, usar peso_inicial.
        weight: normalizedStatus === 'sobra'
          ? (bobinaData.peso_atual ?? bobinaData.peso_inicial)
          : bobinaData.peso_inicial,
        // length é opcional; só enviamos se disponível
        ...(bobinaData.diametro !== undefined ? { length: bobinaData.diametro } : {}),
        status: normalizedStatus,
        received_date: bobinaData.data_entrada || new Date().toISOString().split('T')[0],
        // Se já entrar em máquina, registramos data de instalação
        ...(normalizedStatus === 'em_maquina' ? { installation_date: new Date().toISOString().split('T')[0] } : {}),
        // Se existir coluna de notas/observações, enviar
        ...(bobinaData.observacoes ? { notes: bobinaData.observacoes } : {}),
        created_at: new Date().toISOString()
      }])
      .select('*')
      .single()

    if (bobinaError) {
      console.error('❌ Erro ao criar bobina:', bobinaError)
      return { error: bobinaError.message }
    }

    // ✅ Log removido para console limpo
    return { data: newBobina }
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
    if (!checkSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    if (updates.peso_atual !== undefined) updateData.weight = updates.peso_atual
    const normalizeStatusForDb = (status?: string): 'estoque' | 'em_maquina' | 'sobra' | 'acabou' => {
      switch (status) {
        case 'em_maquina':
        case 'estoque':
        case 'sobra':
        case 'acabou':
          return status as 'estoque' | 'em_maquina' | 'sobra' | 'acabou'
        case 'em-maquina':
          return 'em_maquina'
        default:
          return 'estoque'
      }
    }

    const normalizedStatus = normalizeStatusForDb(updates.status)
    if (updates.status !== undefined) updateData.status = normalizedStatus
    if (updates.data_entrada !== undefined) updateData.received_date = updates.data_entrada
    if (normalizedStatus === 'em_maquina') updateData.installation_date = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase!
      .from('rolls')
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
    if (!checkSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    const { error } = await supabase!
      .from('rolls')
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
      .from('rolls')
      .select(`
        status,
        weight
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
        .reduce((sum, b) => sum + (b.weight || 0), 0),
      peso_medio_bobina: bobinas.length > 0 
        ? bobinas.reduce((sum, b) => sum + (b.weight || 0), 0) / bobinas.length
        : 0,
      fornecedor_mais_usado: 'N/A',
      tipo_papel_mais_usado: 'N/A'
    }

    // Como não temos mais as tabelas de fornecedores e tipos de papel,
    // mantemos os valores padrão
    return { data: stats }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar estatísticas:', error)
    return { error: 'Erro de conexão' }
  }
}

// 🔍 BUSCAR FORNECEDORES DISPONÍVEIS
export const getAvailableSuppliers = async (): Promise<DatabaseResult<Array<{id: string, name: string}>>> => {
  try {
    // Sistema atual não usa tabela de fornecedores separada
    // Retorna lista vazia para compatibilidade
    return { data: [] }
  } catch (error) {
    console.error('❌ Erro ao buscar fornecedores:', error)
    return { error: 'Erro ao buscar fornecedores' }
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
    if (!checkSupabaseAvailable()) {
      return false
    }

    const { data } = await supabase!
      .from('rolls')
      .select('count')
      .limit(1)
    
    // ✅ Log removido para console limpo
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

// 🔍 Função auxiliar para verificar disponibilidade do Supabase
const checkSupabaseAvailable = (): boolean => {
  if (!supabase) {
    console.warn('⚠️ Supabase não está disponível. Operação cancelada.')
    return false
  }
  return true
}
