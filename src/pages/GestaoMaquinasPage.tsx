// Página Gestão de Máquinas - Sistema Soropel
// Baseado nos padrões estabelecidos do projeto

import React, { useEffect } from 'react'
import { Play, Pause, Wrench, TrendingUp, Calendar, Settings, Wifi } from 'lucide-react'
import { MachineCard } from '@/components/gestao-maquinas/MachineCard'
import { ModalPlanejamentoV2 } from '@/components/gestao-maquinas/ModalPlanejamentoV2'
import { ModalConfigurarProdutos } from '@/components/gestao-maquinas/ModalConfigurarProdutos'
import { ModalConfiguracaoMaquina } from '@/components/gestao-maquinas/ModalConfiguracaoMaquina'
import { ModalIoTSystem } from '@/components/gestao-maquinas/ModalIoTSystem'
import { useGestaoMaquinasStore } from '@/stores/gestao-maquinas'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">Erro ao carregar dados</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header da Página */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Gestão de Máquinas
            </h1>
            <p className="text-gray-600 text-lg">
              Controle e monitoramento em tempo real das 9 máquinas de produção
            </p>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <button
                onClick={handlePlanejamento}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                <span>Planejar Semana</span>
              </button>
              
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                📅 Planejamento Semanal<br/>
                Seleciona pedidos e distribui nas máquinas
              </div>
            </div>
            
            <div className="relative group">
              <button
                onClick={handleConfigurarProdutos}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Settings className="w-5 h-5" />
                <span>Configurar Produtos</span>
              </button>
              
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                ⚙️ Configuração de Produtos<br/>
                Define produtos por máquina (1-4: Sem impressão | 5-8: Com impressão | 9: Especial)
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={handleConfigurarIoT}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Wifi className="w-5 h-5" />
                <span>Sistema IoT</span>
              </button>
              
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                📡 Sistema IoT ESP32<br/>
                Configurar contadores de sacos em tempo real
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
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
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
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
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
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
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
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

      {/* Grid das Máquinas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {machines.map((machine) => (
          <div key={machine.id} className="animate-fadeIn">
            <MachineCard
              machine={machine}
              onToggleStatus={handleToggleStatus}
              onOpenConfig={handleOpenConfig}
            />
          </div>
        ))}
      </div>

      {/* Mensagem se não houver máquinas */}
      {machines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            Nenhuma máquina encontrada
          </div>
          <button
            onClick={refreshData}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Recarregar Dados
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
  )
}

export default GestaoMaquinasPage
