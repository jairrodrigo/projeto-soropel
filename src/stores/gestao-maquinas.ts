// Store Zustand para Gestão de Máquinas - Sistema Soropel
// Integrado com Supabase real

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MachinesService } from '@/services/machinesService'
import type { 
  Machine, 
  MachineStatus, 
  ModalState, 
  PlanejamentoSemanal,
  SelectedOrder,
  ConsolidatedProduct,
  MachineConfig,
  MachineMetrics
} from '@/types/gestao-maquinas'

interface GestaoMaquinasState {
  // Estado das máquinas
  machines: Machine[]
  selectedMachine?: Machine
  
  // Estado dos modals
  modals: ModalState
  
  // Planejamento semanal
  planejamento?: PlanejamentoSemanal
  availableOrders: SelectedOrder[]
  
  // Configurações
  machineConfigs: MachineConfig[]
  
  // Loading e erro
  loading: boolean
  error: string | null
  
  // Actions
  setMachines: (machines: Machine[]) => void
  updateMachineStatus: (machineId: number, status: MachineStatus) => void
  setSelectedMachine: (machine?: Machine) => void
  
  // Modal actions
  openModal: (modal: keyof ModalState, machineId?: number) => void
  closeModal: (modal: keyof ModalState) => void
  closeAllModals: () => void
  
  // Planejamento actions
  setPlanejamento: (planejamento: PlanejamentoSemanal) => void
  selectOrder: (orderId: string) => void
  autoDistribute: () => void
  savePlanejamento: () => Promise<void>
  
  // Configuração actions
  updateMachineConfig: (machineId: number, config: Partial<MachineConfig>) => void
  saveMachineConfigs: () => Promise<void>
  
  // Utility actions
  getMachineMetrics: () => MachineMetrics
  refreshData: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Implementação das actions do store
export const useGestaoMaquinasStore = create<GestaoMaquinasState>()(
  devtools((set, get) => ({
    // Estado inicial
    machines: [],
    modals: {
      planejamento: false,
      configurarProdutos: false,
      configuracaoMaquina: false,
      iotSystem: false
    },
    availableOrders: [],
    machineConfigs: [],
    loading: false,
    error: null,

    // Actions básicas
    setMachines: (machines) => set({ machines }),
    
    setSelectedMachine: (machine) => set({ selectedMachine: machine }),
    
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error }),

    // Atualizar status da máquina - INTEGRAÇÃO REAL SUPABASE
    updateMachineStatus: async (machineId, status) => {
      // Atualizar UI imediatamente para responsividade
      const machines = get().machines.map(machine => 
        machine.id === machineId 
          ? { ...machine, status }
          : machine
      )
      set({ machines })

      try {
        // Chamar service real para persistir no Supabase
        const success = await MachinesService.updateMachineStatus(machineId, status)
        
        if (!success) {
          // Reverter mudança se falhou
          const originalMachines = get().machines.map(machine => 
            machine.id === machineId 
              ? { ...machine, status: machine.status === status ? 'stopped' : 'active' }
              : machine
          )
          set({ machines: originalMachines, error: 'Falha ao atualizar status da máquina' })
        } else {
          // Recarregar dados para sincronizar
          setTimeout(() => {
            get().refreshData()
          }, 1000)
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error)
        // Reverter mudança
        const originalMachines = get().machines.map(machine => 
          machine.id === machineId 
            ? { ...machine, status: machine.status === status ? 'stopped' : 'active' }
            : machine
        )
        set({ machines: originalMachines, error: 'Erro na comunicação com servidor' })
      }
    },

    // Modal actions
    openModal: (modal, machineId) => {
      const updates: Partial<GestaoMaquinasState> = {
        modals: { 
          ...get().modals, 
          [modal]: true,
          selectedMachine: machineId 
        }
      }
      
      if (machineId && modal === 'configuracaoMaquina') {
        const machine = get().machines.find(m => m.id === machineId)
        updates.selectedMachine = machine
      }
      
      set(updates)
    },

    closeModal: (modal) => set({
      modals: { ...get().modals, [modal]: false }
    }),

    closeAllModals: () => set({
      modals: {
        planejamento: false,
        configurarProdutos: false,
        configuracaoMaquina: false,
        iotSystem: false
      },
      selectedMachine: undefined
    }),

    // Planejamento actions
    setPlanejamento: (planejamento) => set({ planejamento }),

    selectOrder: (orderId) => {
      const orders = get().availableOrders.map(order =>
        order.id === orderId 
          ? { ...order, selected: !order.selected }
          : order
      )
      set({ availableOrders: orders })
    },

    autoDistribute: () => {
      // Lógica de distribuição automática
      const selectedOrders = get().availableOrders.filter(o => o.selected)
      const machines = get().machines
      
      // Aqui implementaríamos a lógica de distribuição
      console.log('Distribuindo automaticamente:', selectedOrders, machines)
    },

    savePlanejamento: async () => {
      set({ loading: true, error: null })
      try {
        // Aqui faria a chamada para salvar no Supabase
        await new Promise(resolve => setTimeout(resolve, 1000))
        set({ loading: false })
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Erro ao salvar planejamento'
        })
      }
    },

    // Configuração actions
    updateMachineConfig: (machineId, config) => {
      const configs = get().machineConfigs.map(c =>
        c.machineId === machineId ? { ...c, ...config } : c
      )
      set({ machineConfigs: configs })
    },

    saveMachineConfigs: async () => {
      set({ loading: true, error: null })
      try {
        // Salvar configurações no Supabase
        await new Promise(resolve => setTimeout(resolve, 1000))
        set({ loading: false })
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Erro ao salvar configurações'
        })
      }
    },

    // Métricas
    getMachineMetrics: () => {
      const machines = get().machines
      return {
        totalActive: machines.filter(m => m.status === 'active').length,
        totalStopped: machines.filter(m => m.status === 'stopped').length,
        totalMaintenance: machines.filter(m => m.status === 'maintenance').length,
        averageEfficiency: machines.reduce((acc, m) => acc + m.efficiency, 0) / machines.length || 0
      }
    },

    // Refresh data - INTEGRAÇÃO REAL SUPABASE
    refreshData: async () => {
      set({ loading: true, error: null })
      try {
        // Usar dados reais do Supabase via MachinesService
        const machines = await MachinesService.getMachines()
        
        set({ machines, loading: false })
        console.log(`✅ ${machines.length} máquinas carregadas do Supabase`)
      } catch (error) {
        console.error('Erro ao carregar máquinas:', error)
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Erro ao carregar dados das máquinas'
        })
      }
    }

  }), { name: 'gestao-maquinas-store' })
)
