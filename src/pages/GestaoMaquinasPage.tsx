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
            
            {/* Título e Descrição - Typography Enhanced */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 lg:mb-4 leading-tight">
                Gestão de Máquinas
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg xl:text-xl max-w-2xl lg:max-w-none mx-auto lg:mx-0 leading-relaxed">
                Controle e monitoramento em tempo real das 9 máquinas de produção
              </p>
            </div>
            
            {/* Botões de Ação - Enhanced Visual */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              
              {/* Botão Atualizar - Modern Style */}
              <button
                onClick={handleRefresh}
                className="w-full sm:w-auto bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Atualizar</span>
              </button>
              
              {/* Botão Planejamento - Enhanced */}
              <div className="relative group">
                <button
                  onClick={handlePlanejamento}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Planejar Semana</span>
                </button>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-black text-white text-xs lg:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 shadow-xl">
                  Planejamento Semanal<br/>
                  Seleciona pedidos e distribui nas máquinas
                </div>
              </div>
              
              {/* Botão Produtos - Enhanced */}
              <div className="relative group">
                <button
                  onClick={handleConfigurarProdutos}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Configurar Produtos</span>
                </button>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-black text-white text-xs lg:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 shadow-xl">
                  Configuração de Produtos<br/>
                  Define produtos por máquina (1-4: Sem impressão | 5-8: Com impressão | 9: Especial)
                </div>
              </div>

              {/* Botão IoT - Enhanced */}
              <div className="relative group">
                <button
                  onClick={handleConfigurarIoT}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Wifi className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Sistema IoT</span>
                </button>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-black text-white text-xs lg:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 shadow-xl">
                  Sistema IoT ESP32<br/>
                  Configurar contadores de sacos em tempo real
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Métricas - Enhanced Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          
          {/* Máquinas Ativas - Modern Card */}
          <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Máquinas Ativas</p>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {metrics.totalActive}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* Máquinas Paradas - Modern Card */}
          <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Máquinas Paradas</p>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  {metrics.totalStopped}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Pause className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          {/* Em Manutenção - Modern Card */}
          <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Em Manutenção</p>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {metrics.totalMaintenance}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-yellow-100 to-orange-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          {/* Eficiência Média - Modern Card */}
          <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Eficiência Média</p>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {Math.round(metrics.averageEfficiency)}%
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-100 to-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid das Máquinas - Enhanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {machines.map((machine, index) => (
            <div 
              key={machine.id} 
              className="animate-fadeIn opacity-0"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <MachineCard
                machine={machine}
                onToggleStatus={handleToggleStatus}
                onOpenConfig={handleOpenConfig}
              />
            </div>
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