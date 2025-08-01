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

// ➕ CRIAR OU ATUALIZAR BOBINA (UPSERT) - SOLUÇÃO PARA PROBLEMA DE DUPLICAÇÃO
export const upsertBobina = async (bobinaData: NewBobinaData): Promise<DatabaseResult<Bobina>> => {
  try {
    console.log('🚀 Upsert bobina - dados recebidos:', bobinaData)
    console.log('🔍 Código da bobina:', bobinaData.codigo)
    
    // 🔍 VERIFICAR SE BOBINA JÁ EXISTE
    console.log('📋 Verificando se bobina já existe...')
    const { data: existingBobina, error: searchError } = await supabase
      .from('bobinas')
      .select('id, reel_number, status')
      .eq('reel_number', bobinaData.codigo)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar bobina existente:', searchError)
      return { error: `Erro ao verificar bobina: ${searchError.message}` }
    }

    // 🔄 SE EXISTE, ATUALIZAR STATUS
    if (existingBobina) {
      console.log(`✅ Bobina encontrada! ID: ${existingBobina.id}, Status atual: ${existingBobina.status}`)
      console.log(`🔄 Atualizando status para: ${bobinaData.status}`)
      
      const updateData: any = {
        status: bobinaData.status || 'estoque',
        current_weight: bobinaData.peso_atual || bobinaData.peso_inicial,
      }
      
      // Se for mudança para sobra, atualizar observações
      if (bobinaData.status === 'sobra') {
        updateData.observacoes = `Atualizado para sobra em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`
      }

      const { data: updatedBobina, error: updateError } = await supabase
        .from('bobinas')
        .update(updateData)
        .eq('id', existingBobina.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Erro ao atualizar bobina:', updateError)
        return { error: updateError.message }
      }

      console.log('✅ Bobina atualizada com sucesso!')
      return { data: updatedBobina }
    }

    // ➕ SE NÃO EXISTE, CRIAR NOVA
    console.log('➕ Bobina não existe, criando nova...')
    return await createBobina(bobinaData)
  } catch (error) {
    console.error('❌ Erro inesperado no upsert bobina:', error)
    return { error: 'Erro de conexão' }
  }
}

// ➕ CRIAR NOVA BOBINA (função original mantida para casos específicos)
export const createBobina = async (bobinaData: NewBobinaData): Promise<DatabaseResult<Bobina>> => {
  try {
    console.log('🚀 Criando nova bobina - dados recebidos:', bobinaData)
    console.log('🔍 Fornecedor para processar:', bobinaData.supplier_name)
    console.log('🔍 Tipo de papel para processar:', bobinaData.paper_type_name)

    // 🔍 Buscar ou criar fornecedor
    let supplier_id: string
    
    console.log('📋 Buscando fornecedor existente...')
    const { data: existingSupplier, error: searchSupplierError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('name', bobinaData.supplier_name)
      .single()

    if (searchSupplierError && searchSupplierError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar fornecedor:', searchSupplierError)
      return { error: `Erro ao buscar fornecedor: ${searchSupplierError.message}` }
    }

    if (existingSupplier) {
      supplier_id = existingSupplier.id
      console.log('✅ Fornecedor encontrado com ID:', supplier_id)
    } else {
      // Criar novo fornecedor (usando campos corretos)
      console.log('➕ Criando novo fornecedor:', bobinaData.supplier_name)
      const { data: newSupplier, error: supplierError } = await supabase
        .from('suppliers')
        .insert([{
          name: bobinaData.supplier_name,
          contact_person: `Fornecedor criado automaticamente via IA em ${new Date().toLocaleDateString('pt-BR')}`,
          active: true,
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single()

      if (supplierError) {
        console.error('❌ Erro detalhado ao criar fornecedor:', {
          error: supplierError,
          message: supplierError.message,
          code: supplierError.code,
          details: supplierError.details,
          hint: supplierError.hint
        })
        
        // Se erro por duplicata, tentar buscar o fornecedor existente
        if (supplierError.code === '23505') {
          console.log('🔄 Tentando buscar fornecedor duplicado...')
          const { data: duplicateSupplier } = await supabase
            .from('suppliers')
            .select('id')
            .ilike('name', bobinaData.supplier_name)
            .single()
          
          if (duplicateSupplier) {
            console.log('✅ Fornecedor encontrado após duplicata:', duplicateSupplier.id)
            supplier_id = duplicateSupplier.id
          } else {
            return { error: `Erro ao processar fornecedor: ${supplierError.message}` }
          }
        } else {
          return { error: `Erro ao processar fornecedor: ${supplierError.message}` }
        }
      } else if (!newSupplier) {
        console.error('❌ Fornecedor criado mas sem dados retornados')
        return { error: 'Erro ao processar fornecedor - dados não retornados' }
      } else {
        supplier_id = newSupplier.id
        console.log('✅ Fornecedor criado com ID:', supplier_id)
      }
    }

    // 🔍 Buscar ou criar tipo de papel
    let paper_type_id: string
    
    console.log('📋 Buscando tipo de papel existente...')
    console.log('🔍 Valor de busca:', bobinaData.paper_type_name)
    // Buscar tanto por nome quanto por código (caso OCR retorne código em vez de nome)
    const { data: existingPaperTypes, error: searchPaperTypeError } = await supabase
      .from('paper_types')
      .select('id')
      .or(`name.eq.${bobinaData.paper_type_name},code.eq.${bobinaData.paper_type_name}`)
      
    let existingPaperType = existingPaperTypes?.[0] || null
    console.log('📊 Resultados da busca:', existingPaperTypes?.length || 0, 'tipos encontrados')

    if (searchPaperTypeError && searchPaperTypeError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar tipo de papel:', searchPaperTypeError)
      return { error: `Erro ao buscar tipo de papel: ${searchPaperTypeError.message}` }
    }

    if (existingPaperType) {
      paper_type_id = existingPaperType.id
      console.log('✅ Tipo de papel encontrado com ID:', paper_type_id)
    } else {
      // Criar novo tipo de papel (usando campos corretos)
      console.log('➕ Criando novo tipo de papel:', bobinaData.paper_type_name)
      
      // Gerar código automático baseado no nome (ex: MIX038 -> MIX038, Papel Novo -> PAPELNOVO)
      const paperCode = bobinaData.paper_type_name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 10)
      
      const { data: newPaperType, error: paperTypeError } = await supabase
        .from('paper_types')
        .insert([{
          code: paperCode,
          name: bobinaData.paper_type_name,
          description: `Tipo de papel criado automaticamente via IA em ${new Date().toLocaleDateString('pt-BR')}`,
          active: true,
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single()

      if (paperTypeError) {
        console.error('❌ Erro detalhado ao criar tipo de papel:', {
          error: paperTypeError,
          message: paperTypeError.message,
          code: paperTypeError.code,
          details: paperTypeError.details,
          hint: paperTypeError.hint
        })
        
        // Se erro por duplicata, tentar buscar o tipo existente
        if (paperTypeError.code === '23505') {
          console.log('🔄 Tentando buscar tipo de papel duplicado...')
          const { data: duplicatePaperTypes } = await supabase
            .from('paper_types')
            .select('id')
            .or(`name.ilike.%${bobinaData.paper_type_name}%,code.ilike.%${bobinaData.paper_type_name}%`)
          
          const duplicatePaperType = duplicatePaperTypes?.[0] || null
          
          if (duplicatePaperType) {
            console.log('✅ Tipo de papel encontrado após duplicata:', duplicatePaperType.id)
            paper_type_id = duplicatePaperType.id
          } else {
            return { error: `Erro ao processar tipo de papel: ${paperTypeError.message}` }
          }
        } else {
          return { error: `Erro ao processar tipo de papel: ${paperTypeError.message}` }
        }
      } else if (!newPaperType) {
        console.error('❌ Tipo de papel criado mas sem dados retornados')
        return { error: 'Erro ao processar tipo de papel - dados não retornados' }
      } else {
        paper_type_id = newPaperType.id
        console.log('✅ Tipo de papel criado com ID:', paper_type_id)
      }
    }

    // 💾 Criar bobina
    const { data, error } = await supabase
      .from('bobinas')
      .insert([{
        reel_number: bobinaData.codigo,  // Campo correto da tabela
        supplier: bobinaData.supplier_name,
        paper_type: bobinaData.paper_type_name,
        gramatura: bobinaData.gramatura,
        initial_weight: bobinaData.peso_inicial,
        current_weight: bobinaData.peso_atual || bobinaData.peso_inicial,
        weight_kg: bobinaData.peso_inicial,
        width: bobinaData.largura,
        diameter: bobinaData.diametro,
        condutor: bobinaData.condutor,  // Novo campo
        status: bobinaData.status || 'estoque',
        received_date: bobinaData.data_entrada || new Date().toISOString().split('T')[0]
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
