// Hook customizado para Gestão de Máquinas - Sistema Soropel
// Baseado nos padrões estabelecidos no projeto

import { useEffect, useCallback } from 'react'
import { useGestaoMaquinasStore } from '@/stores/gestao-maquinas'
import type { Machine, MachineStatus, MachineConfig } from '@/types/gestao-maquinas'

export const useGestaoMaquinas = () => {
  const store = useGestaoMaquinasStore()

  // Carregar dados iniciais
  useEffect(() => {
    store.refreshData()
  }, [])

  // Função para alternar status da máquina
  const toggleMachineStatus = useCallback((machineId: number, currentStatus: MachineStatus) => {
    if (currentStatus === 'maintenance') {
      console.warn('Não é possível alterar status de máquina em manutenção')
      return
    }

    const newStatus: MachineStatus = currentStatus === 'active' ? 'stopped' : 'active'
    store.updateMachineStatus(machineId, newStatus)
    
    // Aqui poderia fazer uma chamada para o Supabase para persistir a mudança
    // updateMachineStatusInDatabase(machineId, newStatus)
  }, [store])

  // Função para configurar máquina individual
  const configureMachine = useCallback((machineId: number) => {
    store.openModal('configuracaoMaquina', machineId)
  }, [store])

  // Função para abrir planejamento semanal
  const openWeeklyPlanning = useCallback(() => {
    store.openModal('planejamento')
  }, [store])

  // Função para configurar produtos
  const configureProducts = useCallback(() => {
    store.openModal('configurarProdutos')
  }, [store])

  // Função para salvar configurações de máquina
  const saveMachineSettings = useCallback(async (settings: Partial<Machine>) => {
    try {
      store.setLoading(true)
      
      // Aqui faria a chamada para o Supabase
      // await updateMachineSettings(settings)
      
      store.setLoading(false)
      store.closeModal('configuracaoMaquina')
      
      return { success: true }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Erro ao salvar configurações')
      store.setLoading(false)
      
      return { success: false, error }
    }
  }, [store])

  // Função para distribuição automática
  const autoDistribute = useCallback(() => {
    store.autoDistribute()
    
    // Aqui implementaria a lógica real de distribuição
    // baseada nas configurações das máquinas e pedidos selecionados
  }, [store])

  // Função para atualizar configuração de produtos
  const updateProductConfig = useCallback((machineId: number, config: Partial<MachineConfig>) => {
    store.updateMachineConfig(machineId, config)
  }, [store])

  // Função para obter dados de uma máquina específica
  const getMachine = useCallback((machineId: number) => {
    return store.machines.find(machine => machine.id === machineId)
  }, [store.machines])

  // Função para obter máquinas por tipo
  const getMachinesByType = useCallback((type: 'no_print' | 'with_print' | 'special') => {
    return store.machines.filter(machine => machine.type === type)
  }, [store.machines])

  return {
    // Estado
    machines: store.machines,
    selectedMachine: store.selectedMachine,
    loading: store.loading,
    error: store.error,
    modals: store.modals,
    metrics: store.getMachineMetrics(),

    // Actions
    toggleMachineStatus,
    configureMachine,
    openWeeklyPlanning,
    configureProducts,
    saveMachineSettings,
    autoDistribute,
    updateProductConfig,

    // Utility functions
    getMachine,
    getMachinesByType,
    refreshData: store.refreshData,
    
    // Modal actions
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals
  }
}

export default useGestaoMaquinas
