// Modal de Detalhes da Máquina - Sistema Soropel
// Exibe informações completas e permite ações avançadas

import React, { useState } from 'react'
import {
  X,
  Play,
  Pause,
  Wrench,
  Settings,
  Activity,
  Clock,
  User,
  Package,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Calendar,
  Zap,
  CheckCircle,
  XCircle,
  Gauge
} from 'lucide-react'
import { cn } from '@/utils'
import type { Machine, MachineStatus } from '@/types/gestao-maquinas'

interface ModalDetalhesMaquinaProps {
  isOpen: boolean
  onClose: () => void
  machine: Machine | null
  onToggleStatus: (machineId: number, currentStatus: MachineStatus) => void
  onOpenConfig: (machineId: number) => void
}

export const ModalDetalhesMaquina: React.FC<ModalDetalhesMaquinaProps> = ({
  isOpen,
  onClose,
  machine,
  onToggleStatus,
  onOpenConfig
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'maintenance'>('overview')

  if (!isOpen || !machine) return null

  const getStatusConfig = (status: MachineStatus) => {
    const configs = {
      active: {
        color: 'text-green-600',
        bg: 'bg-green-100',
        icon: CheckCircle,
        label: 'ATIVA'
      },
      stopped: {
        color: 'text-red-600',
        bg: 'bg-red-100', 
        icon: XCircle,
        label: 'PARADA'
      },
      maintenance: {
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        icon: Wrench,
        label: 'MANUTENÇÃO'
      },
      waiting: {
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        icon: Clock,
        label: 'AGUARDANDO'
      }
    }
    return configs[status]
  }

  const statusConfig = getStatusConfig(machine.status)
  const StatusIcon = statusConfig.icon

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600'
    if (progress >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-600'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleToggleStatus = () => {
    onToggleStatus(machine.id, machine.status)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{machine.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    statusConfig.bg,
                    statusConfig.color
                  )}>
                    {statusConfig.label}
                  </div>
                  <span className="text-blue-100 text-sm">
                    {machine.type === 'no_print' && 'Sem Impressão'}
                    {machine.type === 'with_print' && 'Com Impressão'}
                    {machine.type === 'special' && 'Especial'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Activity },
              { id: 'production', label: 'Produção', icon: BarChart3 },
              { id: 'maintenance', label: 'Manutenção', icon: Wrench }
            ].map(tab => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Eficiência</p>
                      <p className={cn("text-xl font-bold", getEfficiencyColor(machine.efficiency))}>
                        {machine.efficiency}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progresso</p>
                      <p className="text-xl font-bold text-purple-600">{machine.progress}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tempo Rest.</p>
                      <p className="text-lg font-semibold text-green-600">{machine.timeRemaining}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Op. Hours</p>
                      <p className="text-lg font-semibold text-orange-600">{formatNumber(machine.operatingHours)}h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Product */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Produto Atual</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">{machine.currentProduct}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progresso da Produção</span>
                    <span>{machine.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", getProgressColor(machine.progress))}
                      style={{ width: `${machine.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Produzido:</span>
                    <span className="font-semibold ml-2">{formatNumber(machine.currentProduction)} unidades</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Meta:</span>
                    <span className="font-semibold ml-2">{formatNumber(machine.targetProduction)} unidades</span>
                  </div>
                </div>
              </div>

              {/* Operator Info */}
              {machine.operator && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Operador Responsável</p>
                      <p className="font-semibold text-gray-800">{machine.operator}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Production Tab */}
          {activeTab === 'production' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Dados de Produção</h3>
                <p className="text-gray-600">Informações detalhadas sobre a produção atual</p>
              </div>
              
              {/* Production Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-4">Meta vs Realizado</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meta Diária:</span>
                      <span className="font-semibold">{formatNumber(machine.targetProduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produzido:</span>
                      <span className="font-semibold text-green-600">{formatNumber(machine.currentProduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Restante:</span>
                      <span className="font-semibold">{formatNumber(machine.targetProduction - machine.currentProduction)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-4">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Eficiência:</span>
                      <span className={cn("font-semibold", getEfficiencyColor(machine.efficiency))}>
                        {machine.efficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo Estimado:</span>
                      <span className="font-semibold">{machine.timeRemaining}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horas Operação:</span>
                      <span className="font-semibold">{formatNumber(machine.operatingHours)}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Informações de Manutenção</h3>
                <p className="text-gray-600">Histórico e agendamento de manutenções</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-gray-800 mb-4">Última Manutenção</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-600">Data:</span>
                      <span className="font-semibold">{machine.lastMaintenance}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-semibold">Preventiva</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-4">Próxima Manutenção</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">Data:</span>
                      <span className="font-semibold">{machine.nextMaintenance}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600">Agendada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleStatus}
                disabled={machine.status === 'maintenance'}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300",
                  machine.status === 'active' 
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white",
                  machine.status === 'maintenance' && "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                {machine.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Iniciar</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenConfig(machine.id)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                <span>Configurar</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalDetalhesMaquina