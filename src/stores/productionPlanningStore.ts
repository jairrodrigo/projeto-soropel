// Store Unificado - Planejamento de Producao Integrado
// Sistema Soropel - Gestao Completa

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import integratedPlanningService from '@/services/integratedPlanningService'
import type {
  WeeklyPlanningComplete,
  MachineWithPlanning,
  OrderForPlanning,
  PlanningDragDropData,
  WeeklyPlanningUpdate,
  ProductionMetrics,
  PlanningValidation
} from '@/types/integratedPlanning'

interface ProductionPlanningState {
  // Dados principais
  currentWeek: string
  weeklyPlanning: WeeklyPlanningComplete[]
  machines: MachineWithPlanning[]
  availableOrders: OrderForPlanning[]
  metrics: ProductionMetrics | null
  
  // Estado da UI
  loading: boolean
  error: string | null
  
  // Drag and Drop
  dragDropData: PlanningDragDropData
  
  // Modais e seleções
  selectedMachine: string | null
  planningModalOpen: boolean
  
  // Actions principais
  setCurrentWeek: (week: string) => void
  loadWeeklyPlanning: (weekStart: string) => Promise<void>
  moveOrderToMachine: (orderId: string, machineId: string) => Promise<void>
  savePlanningAndSync: () => Promise<void>
  
  // Drag and Drop actions
  setDraggedOrder: (order: OrderForPlanning | null) => void
  setDropTarget: (machineId: string | null) => void
  handleDropOrder: (orderId: string, machineId: string) => Promise<void>
  
  // UI actions
  setSelectedMachine: (machineId: string | null) => void
  openPlanningModal: () => void
  closePlanningModal: () => void
  
  // Utility actions
  validatePlanning: () => PlanningValidation
  syncWithMachineCards: () => void
  refreshData: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProductionPlanningStore = create<ProductionPlanningState>()(
  devtools((set, get) => ({
    // Estado inicial
    currentWeek: getMonday(new Date()).toISOString().split('T')[0],
    weeklyPlanning: [],
    machines: [],
    availableOrders: [],
    metrics: null,
    loading: false,
    error: null,
    
    dragDropData: {
      draggedOrder: null,
      draggedFromMachine: undefined,
      dropTargetMachine: undefined,
      dragOverOrder: undefined
    },
    
    selectedMachine: null,
    planningModalOpen: false,

    // Definir semana atual
    setCurrentWeek: (week) => {
      set({ currentWeek: week })
      get().loadWeeklyPlanning(week)
    },

    // Carregar planejamento da semana
    loadWeeklyPlanning: async (weekStart) => {
      set({ loading: true, error: null })
      
      try {
        console.log('Carregando planejamento para semana:', weekStart)
        
        const result = await integratedPlanningService.getWeeklyPlanningWithMachineStatus(weekStart)
        
        if (result.success && result.data) {
          set({
            weeklyPlanning: result.data.planning,
            machines: result.data.machines,
            availableOrders: result.data.availableOrders,
            metrics: result.data.metrics,
            loading: false
          })
          
          console.log('Planejamento carregado:', {
            planning: result.data.planning.length,
            machines: result.data.machines.length,
            orders: result.data.availableOrders.length
          })
          
        } else {
          throw new Error(result.error || 'Erro ao carregar planejamento')
        }
        
      } catch (error) {
        console.error('Erro ao carregar planejamento:', error)
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Erro desconhecido' 
        })
      }
    },

    // Mover pedido para máquina
    moveOrderToMachine: async (orderId, machineId) => {
      const state = get()
      const order = state.availableOrders.find(o => o.id === orderId)
      
      if (!order) {
        console.error('Pedido não encontrado:', orderId)
        return
      }

      try {
        console.log(`Movendo pedido ${orderId} para máquina ${machineId}`)
        
        const result = await integratedPlanningService.moveOrderBetweenMachines(
          orderId, 
          order.planned_machine_id || null, 
          machineId
        )
        
        if (result.success) {
          // Atualizar estado local
          set(state => ({
            availableOrders: state.availableOrders.filter(o => o.id !== orderId),
            machines: state.machines.map(machine => {
              if (machine.id === machineId) {
                const newOrder = {
                  order_id: order.id,
                  order_number: order.order_number,
                  client_name: order.client_name,
                  product_name: order.product_name,
                  quantity: order.quantity,
                  delivery_date: order.delivery_date,
                  priority: order.priority,
                  days_until_delivery: order.days_until_delivery,
                  progress_percentage: 0
                }
                
                return {
                  ...machine,
                  plannedOrders: [...machine.plannedOrders, newOrder],
                  weeklyTarget: machine.weeklyTarget + order.quantity
                }
              }
              return machine
            })
          }))
          
          console.log('Pedido movido com sucesso')
        } else {
          throw new Error(result.error)
        }
        
      } catch (error) {
        console.error('Erro ao mover pedido:', error)
        set({ error: error instanceof Error ? error.message : 'Erro ao mover pedido' })
      }
    },

    // Salvar planejamento e sincronizar
    savePlanningAndSync: async () => {
      const state = get()
      
      try {
        console.log('Salvando planejamento semanal...')
        
        const planningData: WeeklyPlanningUpdate = {
          week_start_date: state.currentWeek,
          machineAssignments: state.machines.map(machine => ({
            machine_id: machine.id,
            orders: machine.plannedOrders,
            production_goal: machine.weeklyTarget,
            notes: machine.weeklyPlanning?.notes || ''
          })),
          affectedMachines: state.machines.map(m => m.id)
        }
        
        const result = await integratedPlanningService.savePlanningAndSync(planningData)
        
        if (result.success) {
          console.log('Planejamento salvo e sincronizado')
          // Recarregar dados para confirmar sincronização
          await get().loadWeeklyPlanning(state.currentWeek)
        } else {
          throw new Error(result.error)
        }
        
      } catch (error) {
        console.error('Erro ao salvar planejamento:', error)
        set({ error: error instanceof Error ? error.message : 'Erro ao salvar planejamento' })
      }
    },

    // Drag and Drop actions
    setDraggedOrder: (order) => {
      set(state => ({
        dragDropData: { ...state.dragDropData, draggedOrder: order }
      }))
    },

    setDropTarget: (machineId) => {
      set(state => ({
        dragDropData: { ...state.dragDropData, dropTargetMachine: machineId }
      }))
    },

    handleDropOrder: async (orderId, machineId) => {
      await get().moveOrderToMachine(orderId, machineId)
      
      // Limpar estado de drag
      set(state => ({
        dragDropData: {
          draggedOrder: null,
          draggedFromMachine: undefined,
          dropTargetMachine: undefined,
          dragOverOrder: undefined
        }
      }))
    },

    // UI actions
    setSelectedMachine: (machineId) => set({ selectedMachine: machineId }),
    
    openPlanningModal: () => set({ planningModalOpen: true }),
    
    closePlanningModal: () => set({ planningModalOpen: false }),

    // Validar planejamento
    validatePlanning: (): PlanningValidation => {
      const state = get()
      const warnings = []
      const errors = []
      const suggestions = []

      // Verificar máquinas sobrecarregadas
      for (const machine of state.machines) {
        if (machine.utilization_percentage > 100) {
          warnings.push({
            type: 'capacity_exceeded',
            machine_id: machine.id,
            message: `Máquina ${machine.machine_number} sobrecarregada: ${machine.utilization_percentage.toFixed(0)}%`,
            affected_orders: machine.plannedOrders.map(o => o.order_id)
          })
        }

        // Verificar pedidos urgentes
        const urgentOrders = machine.plannedOrders.filter(o => 
          o.priority === 'urgente' && o.days_until_delivery <= 3
        )
        
        if (urgentOrders.length > 0) {
          warnings.push({
            type: 'tight_deadline',
            machine_id: machine.id,
            message: `${urgentOrders.length} pedido(s) urgente(s) com prazo apertado`,
            affected_orders: urgentOrders.map(o => o.order_id)
          })
        }
      }

      return {
        isValid: errors.length === 0,
        warnings,
        errors,
        suggestions
      }
    },

    // Sincronizar com cards das máquinas
    syncWithMachineCards: () => {
      console.log('Sincronizando planejamento com cards das máquinas...')
      // Esta função será chamada quando o planejamento for salvo
      // para atualizar os cards das máquinas em tempo real
    },

    // Atualizar dados
    refreshData: async () => {
      const state = get()
      await get().loadWeeklyPlanning(state.currentWeek)
    },

    // Utility actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error })

  }), { name: 'production-planning-store' })
)

// Função utilitária para obter segunda-feira da semana
function getMonday(date: Date): Date {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

export default useProductionPlanningStore
