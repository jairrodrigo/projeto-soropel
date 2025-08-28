// Listagem de Operadores - Sistema Soropel
// Componente para listar, editar e excluir operadores

import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Clock,
  Settings,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/utils'
import operatorsService from '@/services/operatorsService'
import { ModalCadastroOperador } from './ModalCadastroOperador'
import type { Operator } from '@/types/supabase'

interface ListagemOperadoresProps {
  isOpen: boolean
  onClose: () => void
}

type FilterRole = 'all' | 'operador' | 'supervisor' | 'tecnico' | 'manutencao'
type FilterShift = 'all' | 'manha' | 'tarde' | 'noite' | 'integral'
type FilterStatus = 'all' | 'active' | 'inactive'

interface Filters {
  search: string
  role: FilterRole
  shift: FilterShift
  status: FilterStatus
}

const ROLE_LABELS = {
  operador: 'Operador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
  manutencao: 'Manutenção'
}

const SHIFT_LABELS = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
  integral: 'Integral'
}

const ROLE_COLORS = {
  operador: 'bg-blue-100 text-blue-800',
  supervisor: 'bg-purple-100 text-purple-800',
  tecnico: 'bg-green-100 text-green-800',
  manutencao: 'bg-orange-100 text-orange-800'
}

const SHIFT_COLORS = {
  manha: 'bg-yellow-100 text-yellow-800',
  tarde: 'bg-orange-100 text-orange-800',
  noite: 'bg-indigo-100 text-indigo-800',
  integral: 'bg-gray-100 text-gray-800'
}

export const ListagemOperadores: React.FC<ListagemOperadoresProps> = ({
  isOpen,
  onClose
}) => {
  const [operators, setOperators] = useState<Operator[]>([])
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados dos modais
  const [showCadastroModal, setShowCadastroModal] = useState(false)
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  const [deletingOperator, setDeletingOperator] = useState<Operator | null>(null)
  
  // Estados dos filtros
  const [filters, setFilters] = useState<Filters>({
    search: '',
    role: 'all',
    shift: 'all',
    status: 'all'
  })
  
  // Estado do menu de ações
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Carregar operadores
  const loadOperators = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await operatorsService.getAllOperators({
        active: filters.status === 'all' ? undefined : filters.status === 'active'
      })
      
      if (result.error) {
        setError(result.error)
        setOperators([])
      } else {
        setOperators(result.data || [])
      }
    } catch (err) {
      console.error('Erro ao carregar operadores:', err)
      setError('Erro ao carregar operadores')
      setOperators([])
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = operators

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(op => 
        op.name.toLowerCase().includes(searchLower) ||
        op.cpf?.includes(filters.search) ||
        op.phone?.includes(filters.search) ||
        op.email?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro de função
    if (filters.role !== 'all') {
      filtered = filtered.filter(op => op.role === filters.role)
    }

    // Filtro de turno
    if (filters.shift !== 'all') {
      filtered = filtered.filter(op => op.shift === filters.shift)
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter(op => 
        filters.status === 'active' ? op.active : !op.active
      )
    }

    setFilteredOperators(filtered)
  }, [operators, filters])

  // Carregar dados quando abrir
  useEffect(() => {
    if (isOpen) {
      loadOperators()
    }
  }, [isOpen])

  // Manipular filtros
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      shift: 'all',
      status: 'all'
    })
  }

  // Abrir modal de cadastro
  const handleNewOperator = () => {
    setEditingOperator(null)
    setShowCadastroModal(true)
  }

  // Abrir modal de edição
  const handleEditOperator = (operator: Operator) => {
    setEditingOperator(operator)
    setShowCadastroModal(true)
    setActiveMenu(null)
  }

  // Confirmar exclusão
  const handleDeleteOperator = (operator: Operator) => {
    setDeletingOperator(operator)
    setActiveMenu(null)
  }

  // Executar exclusão
  const confirmDelete = async () => {
    if (!deletingOperator) return

    try {
      await operatorsService.deleteOperator(deletingOperator.id)
      await loadOperators() // Recarregar lista
      setDeletingOperator(null)
    } catch (err) {
      console.error('Erro ao excluir operador:', err)
      setError('Erro ao excluir operador')
    }
  }

  // Reativar operador
  const handleReactivateOperator = async (operator: Operator) => {
    try {
      await operatorsService.reactivateOperator(operator.id)
      await loadOperators() // Recarregar lista
      setActiveMenu(null)
    } catch (err) {
      console.error('Erro ao reativar operador:', err)
      setError('Erro ao reativar operador')
    }
  }

  // Sucesso no cadastro/edição
  const handleOperatorSuccess = () => {
    setShowCadastroModal(false)
    setEditingOperator(null)
    loadOperators() // Recarregar lista
  }

  // Fechar menu de ações
  const closeMenu = () => {
    setActiveMenu(null)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6" />
                <h2 className="text-xl font-bold">Gerenciar Operadores</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filtros e Ações */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Busca */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, CPF, telefone ou email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as Funções</option>
                  <option value="operador">Operador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="tecnico">Técnico</option>
                  <option value="manutencao">Manutenção</option>
                </select>

                <select
                  value={filters.shift}
                  onChange={(e) => handleFilterChange('shift', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os Turnos</option>
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                  <option value="integral">Integral</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpar
                </button>
              </div>

              {/* Botão Novo */}
              <button
                onClick={handleNewOperator}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Operador
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Carregando operadores...</span>
              </div>
            ) : filteredOperators.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {operators.length === 0 ? 'Nenhum operador cadastrado' : 'Nenhum operador encontrado'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {operators.length === 0 
                    ? 'Comece cadastrando o primeiro operador do sistema.'
                    : 'Tente ajustar os filtros para encontrar o operador desejado.'
                  }
                </p>
                {operators.length === 0 && (
                  <button
                    onClick={handleNewOperator}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Cadastrar Primeiro Operador
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOperators.map((operator) => (
                  <div
                    key={operator.id}
                    className={cn(
                      "bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative",
                      !operator.active && "opacity-60 border-gray-300"
                    )}
                  >
                    {/* Menu de Ações */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => setActiveMenu(activeMenu === operator.id ? null : operator.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {activeMenu === operator.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                          <button
                            onClick={() => handleEditOperator(operator)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </button>
                          
                          {operator.active ? (
                            <button
                              onClick={() => handleDeleteOperator(operator)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Desativar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateOperator(operator)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-green-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Reativar
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-4">
                      {operator.active ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        operator.active ? "text-green-700" : "text-red-700"
                      )}>
                        {operator.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {/* Nome */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {operator.name}
                    </h3>

                    {/* Função e Turno */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        ROLE_COLORS[operator.role]
                      )}>
                        {ROLE_LABELS[operator.role]}
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        SHIFT_COLORS[operator.shift]
                      )}>
                        {SHIFT_LABELS[operator.shift]}
                      </span>
                    </div>

                    {/* Contatos */}
                    <div className="space-y-2 mb-4">
                      {operator.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {operator.phone}
                        </div>
                      )}
                      {operator.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {operator.email}
                        </div>
                      )}
                    </div>

                    {/* Máquinas */}
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <Settings className="w-4 h-4" />
                        <span className="font-medium">Máquinas:</span>
                      </div>
                      <div className="text-xs">
                        {operator.machine_ids && operator.machine_ids.length > 0 
                          ? `${operator.machine_ids.length} máquina(s) habilitada(s)`
                          : 'Nenhuma máquina habilitada'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer com Estatísticas */}
          <div className="p-6 border-t bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{operators.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {operators.filter(op => op.active).length}
                </div>
                <div className="text-sm text-gray-600">Ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {operators.filter(op => op.role === 'operador').length}
                </div>
                <div className="text-sm text-gray-600">Operadores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {operators.filter(op => op.role === 'supervisor').length}
                </div>
                <div className="text-sm text-gray-600">Supervisores</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      <ModalCadastroOperador
        isOpen={showCadastroModal}
        onClose={() => {
          setShowCadastroModal(false)
          setEditingOperator(null)
        }}
        operator={editingOperator}
        onSuccess={handleOperatorSuccess}
      />

      {/* Modal de Confirmação de Exclusão */}
      {deletingOperator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Confirmar Desativação
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja desativar o operador <strong>{deletingOperator.name}</strong>?
                <br /><br />
                O operador será marcado como inativo, mas seus dados serão preservados.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingOperator(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Desativar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para fechar menu */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-[5]" 
          onClick={closeMenu}
        />
      )}
    </>
  )
}

export default ListagemOperadores