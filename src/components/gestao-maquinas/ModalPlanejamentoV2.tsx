import React, { useState, useEffect } from 'react'
import { X, Calendar, Target, TrendingUp, Package, AlertCircle, Save, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertTriangle, Plus, Trash2, Copy, Filter } from 'lucide-react'
import { weeklyPlanningService, OrderForPlanning } from '../../services/weeklyPlanningService'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ModalPlanejamentoProps {
  isOpen: boolean
  onClose: () => void
}

interface MachinePlanning {
  machine_id: string
  machine_number: number
  machine_name: string
  planned_orders: OrderForPlanning[]
  production_goal: number
  estimated_efficiency: number
  notes: string
  current_production?: number
  status: 'idle' | 'running' | 'maintenance'
}

export const ModalPlanejamentoV2: React.FC<ModalPlanejamentoProps> = ({ isOpen, onClose }) => {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [machinePlans, setMachinePlans] = useState<MachinePlanning[]>([])
  const [availableOrders, setAvailableOrders] = useState<OrderForPlanning[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'planning' | 'overview'>('planning')
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgente' | 'especial' | 'normal'>('all')
  
  // Carregar dados ao abrir modal
  useEffect(() => {
    if (isOpen) {
      loadWeekData()
    }
  }, [isOpen, selectedWeek])

  const loadWeekData = async () => {
    setLoading(true)
    try {
      // Formatar datas
      const weekStart = format(selectedWeek, 'yyyy-MM-dd')
      const weekEnd = format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      
      console.log('📅 Carregando planejamento para semana:', weekStart)

      // Carregar máquinas disponíveis
      const machinesResult = await weeklyPlanningService.getAvailableMachines()
      if (!machinesResult.success) throw new Error(machinesResult.error)

      // Carregar planejamentos existentes
      const planningsResult = await weeklyPlanningService.getWeeklyPlannings(weekStart)
      
      // Carregar pedidos disponíveis do banco de dados
      const ordersResult = await weeklyPlanningService.getAvailableOrders()
      if (ordersResult.success && ordersResult.data) {
        setAvailableOrders(ordersResult.data)
      }

      // Combinar dados de máquinas com planejamentos
      const plans: MachinePlanning[] = machinesResult.data?.map(machine => {
        const existingPlan = planningsResult.success && planningsResult.data?.find(p => p.machine_id === machine.id)
        
        return {
          machine_id: machine.id,
          machine_number: machine.machine_number,
          machine_name: machine.name,
          planned_orders: existingPlan?.planned_orders || [],
          production_goal: existingPlan?.planned_production_goal || 0,
          estimated_efficiency: existingPlan?.estimated_efficiency || 85,
          notes: existingPlan?.notes || '',
          current_production: Math.floor(Math.random() * 5000), // Mock atual
          status: machine.status === 'running' ? 'running' : machine.status === 'maintenance' ? 'maintenance' : 'idle'
        }
      }) || []

      setMachinePlans(plans)
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados da semana:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddOrderToMachine = (machineId: string, order: OrderForPlanning) => {
    setMachinePlans(prev => prev.map(plan => {
      if (plan.machine_id === machineId) {
        // Verificar se o pedido já está na máquina
        const orderExists = plan.planned_orders.some(o => o.id === order.id)
        if (!orderExists) {
          return {
            ...plan,
            planned_orders: [...plan.planned_orders, order],
            production_goal: plan.production_goal + order.quantity
          }
        }
      }
      return plan
    }))

    // Remover pedido da lista de disponíveis
    setAvailableOrders(prev => prev.filter(o => o.id !== order.id))
  }

  const handleRemoveOrderFromMachine = (machineId: string, orderId: string) => {
    const removedOrder = machinePlans
      .find(p => p.machine_id === machineId)
      ?.planned_orders.find(o => o.id === orderId)

    if (removedOrder) {
      setMachinePlans(prev => prev.map(plan => {
        if (plan.machine_id === machineId) {
          return {
            ...plan,
            planned_orders: plan.planned_orders.filter(o => o.id !== orderId),
            production_goal: plan.production_goal - removedOrder.quantity
          }
        }
        return plan
      }))

      // Adicionar pedido de volta à lista de disponíveis
      setAvailableOrders(prev => [...prev, removedOrder].sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }))
    }
  }

  const handleSavePlanning = async () => {
    setSaving(true)
    try {
      const weekStart = format(selectedWeek, 'yyyy-MM-dd')
      const weekEnd = format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd')

      for (const plan of machinePlans) {
        if (plan.planned_orders.length > 0) {
          await weeklyPlanningService.createOrUpdatePlanning({
            machine_id: plan.machine_id,
            week_start_date: weekStart,
            week_end_date: weekEnd,
            planned_orders: plan.planned_orders,
            planned_production_goal: plan.production_goal,
            estimated_efficiency: plan.estimated_efficiency,
            notes: plan.notes,
            status: 'active'
          })
        }
      }

      alert('✅ Planejamento salvo com sucesso!')
      onClose()
    } catch (error) {
      console.error('❌ Erro ao salvar planejamento:', error)
      alert('❌ Erro ao salvar planejamento')
    } finally {
      setSaving(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-600 bg-red-50'
      case 'especial': return 'text-orange-600 bg-orange-50'
      case 'normal': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgente': return <AlertTriangle className="w-4 h-4" />
      case 'especial': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getMachineStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'maintenance': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  const filteredOrders = filterPriority === 'all' 
    ? availableOrders 
    : availableOrders.filter(o => o.priority === filterPriority)

  const totalPlannedProduction = machinePlans.reduce((sum, plan) => sum + plan.production_goal, 0)
  const totalOrders = machinePlans.reduce((sum, plan) => sum + plan.planned_orders.length, 0)
  const averageEfficiency = machinePlans.reduce((sum, plan) => sum + plan.estimated_efficiency, 0) / (machinePlans.length || 1)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <Calendar className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Planejamento Semanal de Produção</h2>
              <p className="text-blue-100 mt-1">
                Semana de {format(selectedWeek, "dd 'de' MMMM", { locale: ptBR })} a {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Week Navigation */}
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedWeek(prev => subWeeks(prev, 1))}
              className="p-2 hover:bg-white rounded-lg transition border"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Semana Atual
            </button>
            <button
              onClick={() => setSelectedWeek(prev => addWeeks(prev, 1))}
              className="p-2 hover:bg-white rounded-lg transition border"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border">
              <p className="text-sm text-gray-500">Total Planejado</p>
              <p className="text-xl font-bold text-gray-900">{totalPlannedProduction.toLocaleString()} un</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border">
              <p className="text-sm text-gray-500">Pedidos Alocados</p>
              <p className="text-xl font-bold text-blue-600">{totalOrders}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border">
              <p className="text-sm text-gray-500">Eficiência Média</p>
              <p className="text-xl font-bold text-green-600">{averageEfficiency.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando planejamento...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Left Panel - Available Orders */}
              <div className="w-1/3 border-r bg-gray-50 p-4 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Pedidos Disponíveis ({filteredOrders.length})
                  </h3>
                  
                  {/* Filter */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setFilterPriority('all')}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        filterPriority === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFilterPriority('urgente')}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        filterPriority === 'urgente' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Urgente
                    </button>
                    <button
                      onClick={() => setFilterPriority('especial')}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        filterPriority === 'especial' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Especial
                    </button>
                    <button
                      onClick={() => setFilterPriority('normal')}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        filterPriority === 'normal' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Normal
                    </button>
                  </div>

                  <div className="space-y-2">
                    {filteredOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        {filterPriority === 'all' 
                          ? 'Todos os pedidos foram alocados' 
                          : `Nenhum pedido com prioridade ${filterPriority}`}
                      </p>
                    ) : (
                      filteredOrders.map(order => (
                        <div
                          key={order.id}
                          className="bg-white p-3 rounded-lg border hover:shadow-md transition cursor-move"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('order', JSON.stringify(order))
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-semibold text-sm">{order.order_number}</span>
                            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getPriorityColor(order.priority)}`}>
                              {getPriorityIcon(order.priority)}
                              {order.priority === 'urgente' ? 'Urgente' : order.priority === 'especial' ? 'Especial' : 'Normal'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 font-medium">{order.client_name}</p>
                          <p className="text-sm text-gray-600">{order.product_name}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-semibold text-blue-600">{order.quantity.toLocaleString()} un</span>
                            <span className="text-xs text-gray-500">Até {format(new Date(order.deadline), 'dd/MM')}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Machines Planning */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Planejamento por Máquina
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  {machinePlans.map(plan => (
                    <div
                      key={plan.machine_id}
                      className={`bg-white rounded-lg border-2 ${
                        selectedMachine === plan.machine_id ? 'border-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedMachine(plan.machine_id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const order = JSON.parse(e.dataTransfer.getData('order'))
                        handleAddOrderToMachine(plan.machine_id, order)
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getMachineStatusColor(plan.status)}`}></div>
                            <h4 className="font-semibold text-gray-900">{plan.machine_name}</h4>
                          </div>
                          <span className="text-sm text-gray-500">#{plan.machine_number}</span>
                        </div>

                        {/* Machine Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Meta</p>
                            <p className="text-sm font-semibold">{plan.production_goal.toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Eficiência</p>
                            <p className="text-sm font-semibold">{plan.estimated_efficiency}%</p>
                          </div>
                        </div>

                        {/* Planned Orders */}
                        <div className="space-y-2 min-h-[100px]">
                          {plan.planned_orders.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                              <Plus className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">Arraste pedidos aqui</p>
                            </div>
                          ) : (
                            plan.planned_orders.map(order => (
                              <div key={order.id} className="bg-blue-50 p-2 rounded flex items-center justify-between group">
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-blue-900">{order.order_number}</p>
                                  <p className="text-xs text-blue-700">{order.quantity.toLocaleString()} un</p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveOrderFromMachine(plan.machine_id, order.id)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            💡 Dica: Arraste os pedidos para as máquinas ou clique para alocar
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePlanning}
              disabled={saving || totalOrders === 0}
              className={`px-6 py-2 rounded-lg transition flex items-center gap-2 ${
                saving || totalOrders === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Planejamento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
