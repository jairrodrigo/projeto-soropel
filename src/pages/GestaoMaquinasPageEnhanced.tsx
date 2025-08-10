// Página Gestão de Máquinas Enhanced - Sistema Soropel
// Aplicando padrões mobile-first e design moderno estabelecidos no projeto

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
  Factory,
  Monitor,
  Gauge
} from 'lucide-react'
import { MachineCardEnhanced } from '@/components/gestao-maquinas/MachineCardEnhanced'
import { ModalDetalhesMaquina } from '@/components/gestao-maquinas/ModalDetalhesMaquina'
import { DashboardProducao } from '@/components/gestao-maquinas/DashboardProducao'
import { ModalPlanejamentoV2 } from '@/components/gestao-maquinas/ModalPlanejamentoV2'
import { ModalConfigurarProdutos } from '@/components/gestao-maquinas/ModalConfigurarProdutos'
import { ModalConfiguracaoMaquina } from '@/components/gestao-maquinas/ModalConfiguracaoMaquina'
import { ModalIoTSystem } from '@/components/gestao-maquinas/ModalIoTSystem'
import { useGestaoMaquinasStore } from '@/stores/gestao-maquinas'
import { cn } from '@/utils'

export const GestaoMaquinasPageEnhanced: React.FC = () => {
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

  const [detailsMachine, setDetailsMachine] = React.useState<Machine | null>(null)
  const [showDetailsModal, setShowDetailsModal] = React.useState(false)

  const metrics = getMachineMetrics()

  useEffect(() => {
    refreshData()
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

  const handleOpenDetails = (machine: Machine) => {
    setDetailsMachine(machine)
    setShowDetailsModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setDetailsMachine(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-600">Carregando máquinas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-md w-full mx-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header da Página - Mobile First */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Título e Descrição */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Gestão de Máquinas
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Controle e monitoramento em tempo real das 9 máquinas de produção
              </p>
            </div>
            
            {/* Botões de Ação - Responsivos */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              
              {/* Botão Refresh */}
              <button
                onClick={handleRefresh}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="sm:hidden lg:inline">Atualizar</span>
              </button>
              
              {/* Botão Planejamento */}
              <div className="relative group w-full sm:w-auto">
                <button
                  onClick={handlePlanejamento}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Planejar Semana</span>
                </button>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 pointer-events-none">
                  📅 Planejamento Semanal
                </div>
              </div>
              
              {/* Botão Produtos */}
              <div className="relative group w-full sm:w-auto">
                <button
                  onClick={handleConfigurarProdutos}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Settings className="w-5 h-5" />
                  <span>Configurar Produtos</span>
                </button>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 pointer-events-none">
                  ⚙️ Produtos por Máquina
                </div>
              </div>

              {/* Botão IoT */}
              <div className="relative group w-full sm:w-auto">
                <button
                  onClick={handleConfigurarIoT}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Wifi className="w-5 h-5" />
                  <span>Sistema IoT</span>
                </button>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 pointer-events-none">
                  📡 Contadores ESP32
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Métricas - Grid Responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Máquinas Ativas */}
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Ativas</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{metrics.totalActive}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* Máquinas Paradas */}
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Paradas</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{metrics.totalStopped}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          {/* Em Manutenção */}
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Manutenção</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{metrics.totalMaintenance}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          {/* Eficiência Média */}
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Eficiência</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{Math.round(metrics.averageEfficiency)}%</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Gauge className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard de Produção em Tempo Real */}
        <div className="mb-6 sm:mb-8">
          <DashboardProducao 
            machines={machines} 
            onRefresh={handleRefresh}
          />
        </div>

        {/* Status Summary - Mobile */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <Monitor className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Status das Máquinas</h3>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total: {machines.length}</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">{metrics.totalActive}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">{metrics.totalStopped}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-600 font-medium">{metrics.totalMaintenance}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid das Máquinas - Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {machines.map((machine, index) => (
            <div 
              key={machine.id} 
              className={cn(
                "animate-fadeIn",
                "opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MachineCardEnhanced
                machine={machine}
                onToggleStatus={handleToggleStatus}
                onOpenConfig={handleOpenConfig}
                onOpenDetails={handleOpenDetails}
              />
            </div>
          ))}
        </div>

        {/* Mensagem se não houver máquinas */}
        {machines.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Factory className="w-12 h-12 text-gray-400" />
            </div>
            <div className="text-gray-500 text-lg mb-4">
              Nenhuma máquina encontrada
            </div>
            <button
              onClick={refreshData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
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

        <ModalDetalhesMaquina
          isOpen={showDetailsModal}
          onClose={handleCloseDetails}
          machine={detailsMachine}
          onToggleStatus={handleToggleStatus}
          onOpenConfig={handleOpenConfig}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default GestaoMaquinasPageEnhanced