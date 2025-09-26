import React, { useState, useEffect } from 'react'
import { X, Calendar, Package, Users, CheckCircle, Plus, Save, AlertCircle } from 'lucide-react'
import * as weeklyPlanningService from '@/services/weeklyPlanningService'
import type { WeeklyPlanningWithMachine, PlannedOrder, CreateWeeklyPlanningData } from '@/services/weeklyPlanningService'

interface ModalPlanejamentoProps {
  isOpen: boolean
  onClose: () => void
}

export const ModalPlanejamento: React.FC<ModalPlanejamentoProps> = ({
  isOpen,
  onClose
}) => {
  // Estados
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plannings, setPlannings] = useState<WeeklyPlanningWithMachine[]>([])
  const [machines, setMachines] = useState<{
    id: string
    machine_number: number
    name: string
    type: string
    status: string
  }[]>([])
  
  // Estado da semana selecionada
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const weekDates = weeklyPlanningService.getWeekDates()
    return weekDates.start
  })
  
  // Estado para criação/edição
  const [editingPlanningId, setEditingPlanningId] = useState<string | null>(null)
  const [newOrder, setNewOrder] = useState<PlannedOrder>({
    order_number: '',
    product: '',
    quantity: 0,
    priority: 'normal'
  })

  // 🔄 Carregar dados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadPlannings()
      loadMachines()
    }
  }, [isOpen, selectedWeek])

  // 📅 Carregar planejamentos da semana
  const loadPlannings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 DEBUG MODAL PLANEJAMENTO - Carregando planejamentos para:', selectedWeek)
      const result = await weeklyPlanningService.getWeeklyPlannings(selectedWeek)
      
      if (result.success && result.data) {
        setPlannings(result.data)
        console.log(`✅ ${result.data.length} planejamentos carregados para semana ${selectedWeek}`)
      } else {
        console.error('❌ Erro ao carregar planejamentos:', result.error)
        setError(result.error || 'Falha ao carregar planejamentos')
        setPlannings([]) // Limpar dados em caso de erro
      }
    } catch (err) {
      console.error('❌ Erro de conexão ao carregar planejamentos:', err)
      setError('Erro de conexão ao carregar planejamentos')
      setPlannings([])
    } finally {
      setLoading(false)
    }
  }

  // 🏭 Carregar máquinas
  const loadMachines = async () => {
    try {
      const result = await weeklyPlanningService.getMachinesForPlanning()
      
      if (result.success && result.data) {
        setMachines(result.data)
        console.log(`✅ ${result.data.length} máquinas carregadas`)
      }
    } catch (err) {
      console.error('❌ Erro ao carregar máquinas:', err)
    }
  }

  // ➕ Adicionar pedido ao planejamento
  const addOrderToPlanning = async (machineId: string) => {
    if (!newOrder.order_number || !newOrder.product || newOrder.quantity <= 0) {
      alert('Por favor, preencha todos os campos do pedido')
      return
    }

    try {
      // Encontrar planejamento existente ou criar novo
      const existingPlanning = plannings.find(p => p.machine_id === machineId)
      
      if (existingPlanning) {
        // Atualizar planejamento existente
        const updatedOrders = [...existingPlanning.planned_orders, newOrder]
        
        const result = await weeklyPlanningService.updateWeeklyPlanning(
          existingPlanning.id,
          { 
            planned_orders: updatedOrders,
            planned_production_goal: updatedOrders.reduce((sum, order) => sum + order.quantity, 0)
          }
        )
        
        if (result.success) {
          await loadPlannings() // Recarregar
          setNewOrder({ order_number: '', product: '', quantity: 0, priority: 'normal' })
          console.log('✅ Pedido adicionado ao planejamento existente')
        } else {
          setError('Falha ao atualizar planejamento')
        }
      } else {
        // Criar novo planejamento
        const weekDates = weeklyPlanningService.getWeekDates(new Date(selectedWeek))
        
        const planningData: CreateWeeklyPlanningData = {
          machine_id: machineId,
          week_start_date: weekDates.start,
          week_end_date: weekDates.end,
          planned_orders: [newOrder],
          planned_production_goal: newOrder.quantity,
          created_by: 'Usuário'
        }
        
        const result = await weeklyPlanningService.createWeeklyPlanning(planningData)
        
        if (result.success) {
          await loadPlannings() // Recarregar
          setNewOrder({ order_number: '', product: '', quantity: 0, priority: 'normal' })
          console.log('✅ Novo planejamento criado')
        } else {
          setError('Falha ao criar planejamento')
        }
      }
    } catch (err) {
      setError('Erro ao salvar planejamento')
      console.error('❌ Erro ao salvar planejamento:', err)
    }
  }

  // 🗑️ Remover pedido do planejamento
  const removeOrderFromPlanning = async (planningId: string, orderIndex: number) => {
    try {
      const planning = plannings.find(p => p.id === planningId)
      if (!planning) return

      const updatedOrders = planning.planned_orders.filter((_, index) => index !== orderIndex)
      
      if (updatedOrders.length === 0) {
        // Se não há mais pedidos, excluir o planejamento
        const result = await weeklyPlanningService.deleteWeeklyPlanning(planningId)
        if (result.success) {
          await loadPlannings()
          console.log('✅ Planejamento excluído (sem pedidos)')
        }
      } else {
        // Atualizar com pedidos restantes
        const result = await weeklyPlanningService.updateWeeklyPlanning(
          planningId,
          { 
            planned_orders: updatedOrders,
            planned_production_goal: updatedOrders.reduce((sum, order) => sum + order.quantity, 0)
          }
        )
        
        if (result.success) {
          await loadPlannings()
          console.log('✅ Pedido removido do planejamento')
        }
      }
    } catch (err) {
      setError('Erro ao remover pedido')
      console.error('❌ Erro ao remover pedido:', err)
    }
  }

  // 📊 Calcular métricas totais
  const totalPlannedProduction = plannings.reduce((sum, planning) => sum + planning.planned_production_goal, 0)
  const machinesWithPlanning = plannings.length
  const totalMachines = machines.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-6xl h-[90%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Planejamento Semanal
              </h2>
              <p className="text-sm text-gray-600">
                Semana de {new Date(selectedWeek).toLocaleDateString('pt-BR')} a {' '}
                {new Date(new Date(selectedWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Painel Esquerdo - Seleção de Semana */}
          <div className="w-1/4 border-r bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-gray-800 mb-3">Selecionar Semana</h3>
              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Métricas Resumo */}
            <div className="p-4 space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-600 font-medium">Produção Planejada</div>
                <div className="text-lg font-bold text-blue-800">{totalPlannedProduction.toLocaleString()}</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-green-600 font-medium">Máquinas Planejadas</div>
                <div className="text-lg font-bold text-green-800">{machinesWithPlanning}/{totalMachines}</div>
              </div>
            </div>

            {/* Adicionar Novo Pedido */}
            <div className="p-4 border-t">
              <h4 className="font-medium text-gray-800 mb-3">Adicionar Pedido</h4>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nº do Pedido"
                  value={newOrder.order_number}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, order_number: e.target.value }))}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder="Produto"
                  value={newOrder.product}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, product: e.target.value }))}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="number"
                  placeholder="Quantidade"
                  value={newOrder.quantity || ''}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                />
                
                <select
                  value={newOrder.priority}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Painel Principal - Planejamentos por Máquina */}
          <div className="flex-1 flex flex-col">
            
            {/* Estados de Loading/Error */}
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Carregando planejamentos...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Lista de Máquinas e Planejamentos */}
            {!loading && !error && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {machines.map((machine) => {
                    const planning = plannings.find(p => p.machine_id === machine.id)
                    
                    return (
                      <div
                        key={machine.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-800">{machine.name}</h4>
                            <p className="text-xs text-gray-600">{machine.type.toUpperCase()}</p>
                          </div>
                          <button
                            onClick={() => addOrderToPlanning(machine.id)}
                            disabled={!newOrder.order_number || !newOrder.product || newOrder.quantity <= 0}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Pedidos Planejados */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {planning ? (
                            planning.planned_orders.map((order, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-3 flex items-center justify-between group"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {order.order_number}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate">
                                    {order.product}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono text-gray-700">
                                      {order.quantity.toLocaleString()}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      order.priority === 'urgente' ? 'bg-red-100 text-red-700' :
                                      order.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                                      order.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {order.priority}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeOrderFromPlanning(planning.id, index)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500 text-sm">
                              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              Nenhum pedido planejado
                            </div>
                          )}
                        </div>

                        {/* Resumo do Planejamento */}
                        {planning && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Meta Produção:</span>
                              <span className="font-medium text-gray-800">
                                {planning.planned_production_goal.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">Pedidos:</span>
                              <span className="font-medium text-gray-800">
                                {planning.planned_orders.length}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {machinesWithPlanning > 0 ? (
              `${machinesWithPlanning} máquina(s) com planejamento • ${totalPlannedProduction.toLocaleString()} unidades planejadas`
            ) : (
              'Nenhuma máquina com planejamento para esta semana'
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
