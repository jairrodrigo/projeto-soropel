import React, { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  Target, 
  TrendingUp, 
  Package, 
  AlertCircle, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Copy, 
  Filter,
  Users,
  ArrowRight
} from 'lucide-react'
import { useProductionPlanningStore } from '@/stores/productionPlanningStore'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ModalPlanejamentoProps {
  isOpen: boolean
  onClose: () => void
}

export const ModalPlanejamentoV2: React.FC<ModalPlanejamentoProps> = ({ isOpen, onClose }) => {
  const {
    currentWeek,
    machines,
    availableOrders,
    loading,
    error,
    dragDropData,
    setCurrentWeek,
    loadWeeklyPlanning,
    moveOrderToMachine,
    savePlanningAndSync,
    setDraggedOrder,
    handleDropOrder,
    validatePlanning
  } = useProductionPlanningStore()

  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgente' | 'especial' | 'normal'>('all')
  const [saving, setSaving] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null)

  // Carregar dados ao abrir modal
  useEffect(() => {
    if (isOpen) {
      const weekStart = format(selectedWeek, 'yyyy-MM-dd')
      setCurrentWeek(weekStart)
      loadWeeklyPlanning(weekStart)
    }
  }, [isOpen, selectedWeek])

  // Navegação de semanas
  const handlePreviousWeek = () => {
    setSelectedWeek(prev => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setSelectedWeek(prev => addWeeks(prev, 1))
  }

  // Filtrar pedidos por prioridade
  const filteredOrders = availableOrders.filter(order => {
    if (filterPriority === 'all') return true
    return order.priority === filterPriority
  })

  // Drag and Drop handlers
  const handleDragStart = (order: any, e: React.DragEvent) => {
    setDraggedOrder(order)
    e.dataTransfer.setData('application/json', JSON.stringify(order))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (machineId: string, e: React.DragEvent) => {
    e.preventDefault()
    
    try {
      const orderData = JSON.parse(e.dataTransfer.getData('application/json'))
      await handleDropOrder(orderData.id, machineId)
    } catch (error) {
      console.error('Erro no drop:', error)
    }
  }

  // Salvar planejamento
  const handleSave = async () => {
    setSaving(true)
    try {
      await savePlanningAndSync()
      alert('Planejamento salvo com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar planejamento')
    } finally {
      setSaving(false)
    }
  }

  // Funções utilitárias
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-600 bg-red-50 border-red-200'
      case 'especial': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'maintenance': return 'bg-yellow-500'
      case 'stopped': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  // Validação do planejamento
  const validation = validatePlanning()

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

        {/* Navigation */}
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousWeek}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold">
              {format(selectedWeek, "dd/MM", { locale: ptBR })} - {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="especial">Especial</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Pedidos Disponíveis */}
          <div className="w-1/3 border-r bg-gray-50 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Pedidos Disponíveis ({filteredOrders.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando pedidos...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(order, e)}
                    className={`p-3 rounded-lg border-2 cursor-move hover:shadow-md transition ${getPriorityColor(order.priority)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">#{order.order_number}</p>
                        <p className="text-sm opacity-75">{order.client_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.priority === 'urgente' ? 'bg-red-100 text-red-800' :
                        order.priority === 'especial' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p><strong>Produto:</strong> {order.product_name}</p>
                      <p><strong>Quantidade:</strong> {order.quantity.toLocaleString()} un</p>
                      <p><strong>Entrega:</strong> {order.delivery_date}</p>
                      <p className={order.days_until_delivery <= 3 ? 'text-red-600 font-medium' : ''}>
                        <strong>Prazo:</strong> {order.days_until_delivery} dias
                      </p>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum pedido disponível</p>
                    <p className="text-sm">com esta prioridade</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Máquinas */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Máquinas da Semana ({machines.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando máquinas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {machines.map(machine => (
                  <div
                    key={machine.id}
                    className={`bg-white rounded-lg border-2 p-4 transition-all ${
                      selectedMachine === machine.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMachine(machine.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(machine.id, e)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(machine.status)}`}></div>
                        <h4 className="font-semibold text-gray-900">{machine.name}</h4>
                      </div>
                      <span className="text-sm text-gray-500">#{machine.machine_number}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Meta</p>
                        <p className="text-sm font-semibold">{(machine.weeklyTarget || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Eficiência</p>
                        <p className="text-sm font-semibold">{machine.efficiency}%</p>
                      </div>
                    </div>

                    <div className="space-y-2 min-h-[120px] border-2 border-dashed border-gray-200 rounded-lg p-2">
                      {machine.plannedOrders.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          <Plus className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-xs">Arraste pedidos aqui</p>
                        </div>
                      ) : (
                        machine.plannedOrders.map(order => (
                          <div key={order.order_id} className="bg-blue-50 p-2 rounded border border-blue-200 group">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-blue-900">#{order.order_number}</p>
                                <p className="text-xs text-blue-700">{order.client_name}</p>
                                <p className="text-xs text-blue-600">{order.quantity.toLocaleString()} un</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // TODO: implementar remoção
                                  console.log('Remover pedido:', order.order_id)
                                }}
                                className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Alertas da máquina */}
                    {machine.alerts && machine.alerts.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {machine.alerts.map((alert, index) => (
                          <div key={index} className={`text-xs p-2 rounded flex items-center gap-1 ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <AlertTriangle className="w-3 h-3" />
                            {alert.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Dica: Arraste os pedidos para as máquinas
            </div>
            {validation.warnings.length > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{validation.warnings.length} alerta(s)</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg transition flex items-center gap-2 ${
                saving
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

export default ModalPlanejamentoV2
