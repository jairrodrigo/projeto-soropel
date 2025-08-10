// Página Gestão de Máquinas - Sistema Soropel
// Seguindo padrões de design do projeto

import React, { useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Wrench, 
  TrendingUp, 
  Calendar, 
  Settings, 
  Wifi,
  RefreshCw,
  AlertTriangle,
  Factory
} from 'lucide-react'
import { MachineCard } from '@/components/gestao-maquinas/MachineCard'
import { ModalPlanejamentoV2 } from '@/components/gestao-maquinas/ModalPlanejamentoV2'
import { ModalConfigurarProdutos } from '@/components/gestao-maquinas/ModalConfigurarProdutos'
import { ModalConfiguracaoMaquina } from '@/components/gestao-maquinas/ModalConfiguracaoMaquina'
import { ModalIoTSystem } from '@/components/gestao-maquinas/ModalIoTSystem'
import { useGestaoMaquinasStore } from '@/stores/gestao-maquinas'
import { cn } from '@/utils'

export const GestaoMaquinasPage: React.FC = () => {
  const {
    machines,
    loading,
    error,
    modals,
    refreshData,
    updateMachineStatus,
    openModal,
    closeModal,
    getMachineMetrics
  } = useGestaoMaquinasStore()

  const metrics = getMachineMetrics()

  useEffect(() => {
    refreshData()
    
    // Auto-refresh a cada 30 segundos para dados em tempo real
    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshData])

  const handleToggleStatus = (machineId: number, currentStatus: any) => {
    const newStatus = currentStatus === 'active' ? 'stopped' : 'active'
    updateMachineStatus(machineId, newStatus)
    
    const action = newStatus === 'active' ? 'iniciada' : 'pausada'
    console.log(`Máquina ${machineId} ${action}`)
  }

  const handleOpenConfig = (machineId: number) => {
    openModal('configuracaoMaquina', machineId)
  }

  const handlePlanejamento = () => {
    openModal('planejamento')
    console.log("Abrindo planejamento semanal...")
  }

  const handleConfigurarProdutos = () => {
    openModal('configurarProdutos')
    console.log("Abrindo configuração de produtos...")
  }

  const handleConfigurarIoT = () => {
    openModal('iotSystem')
    console.log("Abrindo configuração do Sistema IoT...")
  }

  const handleRefresh = () => {
    refreshData()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-600">Carregando máquinas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg border max-w-md w-full mx-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        
        {/* Header da Página - Mobile First Enhanced */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Título e Descrição - Simple & Clean */}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Gestão de Máquinas
              </h1>
              <p className="text-gray-600 text-lg">
                Controle e monitoramento das 9 máquinas de produção
              </p>
            </div>
            
            {/* Botões de Ação - Simple & Functional */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              
              {/* Botão Atualizar */}
              <button
                onClick={handleRefresh}
                className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
              
              {/* Botão Planejamento */}
              <button
                onClick={handlePlanejamento}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                <span>Planejar Semana</span>
              </button>
              
              {/* Botão Produtos */}
              <button
                onClick={handleConfigurarProdutos}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Settings className="w-5 h-5" />
                <span>Configurar Produtos</span>
              </button>

              {/* Botão IoT */}
              <button
                onClick={handleConfigurarIoT}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Wifi className="w-5 h-5" />
                <span>Sistema IoT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Métricas - Simple & Clean */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Máquinas Ativas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Máquinas Ativas</p>
                <p className="text-3xl font-bold text-green-600">{metrics.totalActive}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* Máquinas Paradas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Máquinas Paradas</p>
                <p className="text-3xl font-bold text-red-600">{metrics.totalStopped}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Pause className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          {/* Em Manutenção */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Em Manutenção</p>
                <p className="text-3xl font-bold text-yellow-600">{metrics.totalMaintenance}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          {/* Eficiência Média */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Eficiência Média</p>
                <p className="text-3xl font-bold text-blue-600">{Math.round(metrics.averageEfficiency)}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid das Máquinas - Simple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              onToggleStatus={handleToggleStatus}
              onOpenConfig={handleOpenConfig}
            />
          ))}
        </div>

        {/* Mensagem se não houver máquinas - Enhanced */}
        {machines.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Factory className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400" />
            </div>
            <div className="text-gray-500 text-lg lg:text-xl mb-6 font-medium">
              Nenhuma máquina encontrada
            </div>
            <button
              onClick={refreshData}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>Recarregar Dados</span>
            </button>
          </div>
        )}
        
        {/* Modais */}
        <ModalPlanejamentoV2 
          isOpen={modals.planejamento}
          onClose={() => closeModal('planejamento')}
        />
        
        <ModalConfigurarProdutos 
          isOpen={modals.configurarProdutos}
          onClose={() => closeModal('configurarProdutos')}
        />
        
        <ModalConfiguracaoMaquina 
          isOpen={modals.configuracaoMaquina}
          onClose={() => closeModal('configuracaoMaquina')}
          machineId={modals.selectedMachine}
        />

        <ModalIoTSystem 
          isOpen={modals.iotSystem}
          onClose={() => closeModal('iotSystem')}
        />
      </div>
    </div>
  )
}

export default GestaoMaquinasPage