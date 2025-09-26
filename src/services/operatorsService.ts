// 👥 Operators Service - Sistema Soropel
// CRUD completo para gestão de operadores no Supabase

import { supabase } from '../lib/supabase'
import type { DatabaseResult, Operator } from '../types/supabase'

// 🎯 TIPOS ESPECÍFICOS PARA OPERADORES

export interface NewOperatorData {
  name: string
  cpf?: string
  phone?: string
  email?: string
  role: 'operador' | 'supervisor' | 'tecnico' | 'manutencao'
  shift: 'manha' | 'tarde' | 'noite' | 'unico' | 'integral'
  machine_ids?: number[]
}

export interface UpdateOperatorData {
  name?: string
  cpf?: string
  phone?: string
  email?: string
  role?: 'operador' | 'supervisor' | 'tecnico' | 'manutencao'
  shift?: 'manha' | 'tarde' | 'noite' | 'unico' | 'integral'
  machine_ids?: number[]
  active?: boolean
}

export interface OperatorFilters {
  role?: string
  shift?: string
  active?: boolean
  search?: string
  machine_id?: number
}

// 🛡️ Verificar se Supabase está disponível
const isSupabaseAvailable = (): boolean => {
  return supabase !== null
}

const createSupabaseUnavailableError = (): DatabaseResult<any> => ({
  error: 'Supabase não está disponível. Verifique a configuração.',
  data: null
})

// 📋 LISTAR TODOS OS OPERADORES
export const getAllOperators = async (filters?: OperatorFilters): Promise<DatabaseResult<Operator[]>> => {
  if (!isSupabaseAvailable()) {
    // Dados mock para demonstração quando Supabase não está disponível
    const mockOperators: Operator[] = [
      {
        id: '1',
        name: 'João Silva',
        cpf: '12345678901',
        phone: '(11) 99999-1111',
        email: 'joao@soropel.com',
        role: 'operador',
        shift: 'manha',
        machine_ids: [1, 2, 3],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Maria Santos',
        cpf: '23456789012',
        phone: '(11) 99999-2222',
        email: 'maria@soropel.com',
        role: 'operador',
        shift: 'tarde',
        machine_ids: [4, 5, 6],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Carlos Oliveira',
        cpf: '34567890123',
        phone: '(11) 99999-3333',
        email: 'carlos@soropel.com',
        role: 'supervisor',
        shift: 'manha',
        machine_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Ana Costa',
        cpf: '45678901234',
        phone: '(11) 99999-4444',
        email: 'ana@soropel.com',
        role: 'operador',
        shift: 'noite',
        machine_ids: [7, 8],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Pedro Souza',
        cpf: '56789012345',
        phone: '(11) 99999-5555',
        email: 'pedro@soropel.com',
        role: 'tecnico',
        shift: 'integral',
        machine_ids: [9],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Lucia Ferreira',
        cpf: '67890123456',
        phone: '(11) 99999-6666',
        email: 'lucia@soropel.com',
        role: 'operador',
        shift: 'unico',
        machine_ids: [1, 2],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '7',
        name: 'Roberto Lima',
        cpf: '78901234567',
        phone: '(11) 99999-7777',
        email: 'roberto@soropel.com',
        role: 'manutencao',
        shift: 'integral',
        machine_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '8',
        name: 'Fernanda Alves',
        cpf: '89012345678',
        phone: '(11) 99999-8888',
        email: 'fernanda@soropel.com',
        role: 'operador',
        shift: 'tarde',
        machine_ids: [3, 4, 5],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '9',
        name: 'José Santos',
        cpf: '90123456789',
        phone: '(11) 99999-9999',
        email: 'jose@soropel.com',
        role: 'operador',
        shift: 'unico',
        machine_ids: [6, 7, 8],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    // Aplicar filtros aos dados mock
    let filteredOperators = mockOperators

    if (filters) {
      if (filters.role && filters.role !== 'all') {
        filteredOperators = filteredOperators.filter(op => op.role === filters.role)
      }
      if (filters.shift && filters.shift !== 'all') {
        filteredOperators = filteredOperators.filter(op => op.shift === filters.shift)
      }
      if (filters.active !== undefined) {
        filteredOperators = filteredOperators.filter(op => op.active === filters.active)
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredOperators = filteredOperators.filter(op => 
          op.name.toLowerCase().includes(searchLower) ||
          (op.cpf && op.cpf.includes(filters.search!))
        )
      }
      if (filters.machine_id) {
        filteredOperators = filteredOperators.filter(op => 
          op.machine_ids && op.machine_ids.includes(filters.machine_id!)
        )
      }
    }

    console.log('✅ Operadores mock encontrados:', filteredOperators.length)
    return { data: filteredOperators, error: null }
  }

  try {
    console.log('🔍 Buscando operadores...', filters)

    let query = supabase!
      .from('operators')
      .select('*')
      .order('name', { ascending: true })

    // Aplicar filtros
    if (filters) {
      if (filters.role) {
        query = query.eq('role', filters.role)
      }
      if (filters.shift) {
        query = query.eq('shift', filters.shift)
      }
      if (filters.active !== undefined) {
        query = query.eq('active', filters.active)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`)
      }
      if (filters.machine_id) {
        query = query.contains('machine_ids', [filters.machine_id])
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Erro ao buscar operadores:', error)
      return { error: error.message, data: null }
    }

    console.log('✅ Operadores encontrados:', data?.length || 0)
    return { data: data || [], error: null }

  } catch (error) {
    console.error('❌ Erro inesperado ao buscar operadores:', error)
    return { error: 'Erro inesperado ao buscar operadores', data: null }
  }
}

// 🔍 BUSCAR OPERADOR POR ID
export const getOperatorById = async (id: string): Promise<DatabaseResult<Operator>> => {
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError()
  }

  try {
    console.log('🔍 Buscando operador por ID:', id)

    const { data, error } = await supabase!
      .from('operators')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Erro ao buscar operador:', error)
      return { error: error.message, data: null }
    }

    console.log('✅ Operador encontrado:', data?.name)
    return { data, error: null }

  } catch (error) {
    console.error('❌ Erro inesperado ao buscar operador:', error)
    return { error: 'Erro inesperado ao buscar operador', data: null }
  }
}

// ➕ CRIAR NOVO OPERADOR
export const createOperator = async (operatorData: NewOperatorData): Promise<DatabaseResult<Operator>> => {
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError()
  }

  try {
    console.log('➕ Criando novo operador:', operatorData.name)

    // Validar dados obrigatórios
    if (!operatorData.name?.trim()) {
      return { error: 'Nome do operador é obrigatório', data: null }
    }

    // Verificar se CPF já existe (se fornecido)
    if (operatorData.cpf) {
      const { data: existingOperator } = await supabase!
        .from('operators')
        .select('id')
        .eq('cpf', operatorData.cpf)
        .single()

      if (existingOperator) {
        return { error: 'CPF já cadastrado para outro operador', data: null }
      }
    }

    const { data, error } = await supabase!
      .from('operators')
      .insert({
        ...operatorData,
        active: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar operador:', error)
      return { error: error.message, data: null }
    }

    console.log('✅ Operador criado com sucesso:', data.name)
    return { data, error: null }

  } catch (error) {
    console.error('❌ Erro inesperado ao criar operador:', error)
    return { error: 'Erro inesperado ao criar operador', data: null }
  }
}

// ✏️ ATUALIZAR OPERADOR
export const updateOperator = async (id: string, updates: UpdateOperatorData): Promise<DatabaseResult<Operator>> => {
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError()
  }

  try {
    console.log('✏️ Atualizando operador:', id)

    // Verificar se CPF já existe em outro operador (se sendo atualizado)
    if (updates.cpf) {
      const { data: existingOperator } = await supabase!
        .from('operators')
        .select('id')
        .eq('cpf', updates.cpf)
        .neq('id', id)
        .single()

      if (existingOperator) {
        return { error: 'CPF já cadastrado para outro operador', data: null }
      }
    }

    const { data, error } = await supabase!
      .from('operators')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar operador:', error)
      return { error: error.message, data: null }
    }

    console.log('✅ Operador atualizado com sucesso:', data.name)
    return { data, error: null }

  } catch (error) {
    console.error('❌ Erro inesperado ao atualizar operador:', error)
    return { error: 'Erro inesperado ao atualizar operador', data: null }
  }
}

// 🗑️ EXCLUIR OPERADOR (SOFT DELETE)
export const deleteOperator = async (id: string): Promise<DatabaseResult<boolean>> => {
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError()
  }

  try {
    console.log('🗑️ Excluindo operador:', id)

    // Verificar se operador está sendo usado em alguma máquina
    // (implementar verificação se necessário)

    const { error } = await supabase!
      .from('operators')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      console.error('❌ Erro ao excluir operador:', error)
      return { error: error.message, data: null }
    }

    console.log('✅ Operador excluído com sucesso')
    return { data: true, error: null }

  } catch (error) {
    console.error('❌ Erro inesperado ao excluir operador:', error)
    return { error: 'Erro inesperado ao excluir operador', data: null }
  }
}

// 🔄 REATIVAR OPERADOR
export const reactivateOperator = async (id: string): Promise<DatabaseResult<Operator>> => {
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError()
  }

  try {
    console.log('🔄 Reativando operador:', id)

    const { data, error } = await supabase!
      .from('operators')
      .update({ active: true })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao reativar operador:', error)
      return { error: error.message, data: null }
    }

    console.log('✅ Operador reativado com sucesso:', data.name)
    return { data, error: null }

  } catch (error) {
    console.error('❌ Erro inesperado ao reativar operador:', error)
    return { error: 'Erro inesperado ao reativar operador', data: null }
  }
}

// 📊 BUSCAR OPERADORES POR MÁQUINA
export const getOperatorsByMachine = async (machineId: number): Promise<DatabaseResult<Operator[]>> => {
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError()
  }

  try {
    console.log('🔍 Buscando operadores para máquina:', machineId)

    const { data, error } = await supabase!
      .from('operators')
      .select('*')
      .contains('machine_ids', [machineId])
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Erro ao buscar operadores da máquina:', error)
      return { error: error.message, data: null }
    }

    console.log('✅ Operadores encontrados para máquina:', data?.length || 0)
    return { data: data || [], error: null }

  } catch (error) {
    console.error('❌ Erro inesperado ao buscar operadores da máquina:', error)
    return { error: 'Erro inesperado ao buscar operadores da máquina', data: null }
  }
}

// 📊 ESTATÍSTICAS DOS OPERADORES
export const getOperatorStats = async (): Promise<DatabaseResult<{
  total: number
  active: number
  inactive: number
  byRole: Record<string, number>
  byShift: Record<string, number>
}>> => {
  if (!isSupabaseAvailable()) {
    return createSupabaseUnavailableError()
  }

  try {
    console.log('📊 Buscando estatísticas dos operadores...')

    const { data, error } = await supabase!
      .from('operators')
      .select('role, shift, active')

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error)
      return { error: error.message, data: null }
    }

    const stats = {
      total: data?.length || 0,
      active: data?.filter(op => op.active).length || 0,
      inactive: data?.filter(op => !op.active).length || 0,
      byRole: {} as Record<string, number>,
      byShift: {} as Record<string, number>
    }

    // Contar por função
    data?.forEach(op => {
      stats.byRole[op.role] = (stats.byRole[op.role] || 0) + 1
    })

    // Contar por turno
    data?.forEach(op => {
      stats.byShift[op.shift] = (stats.byShift[op.shift] || 0) + 1
    })

    console.log('✅ Estatísticas calculadas:', stats)
    return { data: stats, error: null }

  } catch (error) {
    console.error('❌ Erro inesperado ao calcular estatísticas:', error)
    return { error: 'Erro inesperado ao calcular estatísticas', data: null }
  }
}

// 🔍 BUSCAR OPERADORES DISPONÍVEIS (ATIVOS)
export const getAvailableOperators = async (): Promise<DatabaseResult<Operator[]>> => {
  return getAllOperators({ active: true })
}

// 📝 VALIDAR DADOS DO OPERADOR
export const validateOperatorData = (data: NewOperatorData | UpdateOperatorData): string[] => {
  const errors: string[] = []

  if ('name' in data && !data.name?.trim()) {
    errors.push('Nome é obrigatório')
  }

  if (data.cpf && !/^\d{11}$/.test(data.cpf.replace(/\D/g, ''))) {
    errors.push('CPF deve ter 11 dígitos')
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email inválido')
  }

  if (data.phone && !/^\d{10,11}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Telefone deve ter 10 ou 11 dígitos')
  }

  return errors
}

export default {
  getAllOperators,
  getOperatorById,
  createOperator,
  updateOperator,
  deleteOperator,
  reactivateOperator,
  getOperatorsByMachine,
  getOperatorStats,
  getAvailableOperators,
  validateOperatorData
}