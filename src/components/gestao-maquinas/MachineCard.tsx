// Componente MachineCard - Sistema Soropel
// Seguindo padrões de design do projeto

import React from 'react'
import { 
  Play, 
  Pause, 
  Settings, 
  Wrench, 
  Clock, 
  Activity,
  User,
  Package,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/utils'
import type { MachineCardProps, MachineStatus } from '@/types/gestao-maquinas'

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  onToggleStatus,
  onOpenConfig
}) => {
  const getStatusConfig = (status: MachineStatus) => {
    const configs = {
      active: {
        dotClass: 'bg-green-500',
        textClass: 'text-green-600',
        bgClass: 'status-online',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        buttonIcon: Pause,
        buttonText: 'PAUSAR'
      },
      stopped: {
        dotClass: 'bg-red-500',
        textClass: 'text-red-600',
        bgClass: 'status-offline',
        buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
        buttonIcon: Play,
        buttonText: 'INICIAR'
      },
      maintenance: {
        dotClass: 'bg-yellow-500',
        textClass: 'text-yellow-600',
        bgClass: 'status-maintenance',
        buttonClass: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        buttonIcon: Wrench,
        buttonText: 'MANUTENÇÃO'
      },
      waiting: {
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-600',
        bgClass: 'status-idle',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        buttonIcon: Play,
        buttonText: 'INICIAR'
      }
    }
    return configs[status]
  }

  const statusConfig = getStatusConfig(machine.status)
  const ButtonIcon = statusConfig.buttonIcon

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600'
    if (progress >= 50) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleToggle = () => {
    if (machine.status !== 'maintenance') {
      onToggleStatus(machine.id, machine.status)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const getMachineTypeLabel = (type: string) => {
    const types = {
      'no_print': 'Sem Impressão',
      'with_print': 'Com Impressão',
      'special': 'Especial'
    }
    return types[type as keyof typeof types] || 'Padrão'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden">
      
      {/* Header com Status - Enhanced */}
      <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={cn("w-3 h-3 rounded-full shadow-lg animate-pulse", statusConfig.dotClass)} />
            <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {machine.name}
            </h3>
          </div>
          
          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full shadow-sm">
            {getMachineTypeLabel(machine.type)}
          </div>
        </div>
        
        <div className={cn("inline-flex items-center px-3 py-2 rounded-full text-xs font-bold shadow-sm", statusConfig.bgClass)}>
          {machine.status === 'active' && 'ATIVA'}
          {machine.status === 'stopped' && 'PARADA'}
          {machine.status === 'maintenance' && 'MANUTENÇÃO'}
          {machine.status === 'waiting' && 'AGUARDANDO'}
        </div>
      </div>

      {/* Conteúdo Principal - Enhanced */}
      <div className="p-4 lg:p-6">
        
        {/* Produto Atual - Modern Design */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Package className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            <span className="text-sm lg:text-base text-gray-600 font-semibold">Produto Atual:</span>
          </div>
          <div className="font-bold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50 p-3 lg:p-4 rounded-xl border border-blue-100 shadow-sm">
            {machine.currentProduct}
          </div>
        </div>

        {/* Progresso - Enhanced Visual */}
        <div className="mb-4 lg:mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm lg:text-base text-gray-600 font-semibold">Progresso:</span>
            <span className={cn("text-sm lg:text-base font-bold", getEfficiencyColor(machine.progress))}>
              {machine.progress}%
            </span>
          </div>
          
          <div className="h-3 lg:h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000 shadow-sm", getProgressColor(machine.progress))}
              style={{ width: `${machine.progress}%` }}
            />
          </div>
          
          <div className="text-xs lg:text-sm text-gray-600 mt-3 flex justify-between font-medium">
            <span>{formatNumber(machine.currentProduction)} unidades</span>
            <span>Meta: {formatNumber(machine.targetProduction)}</span>
          </div>
        </div>

        {/* Métricas - Enhanced Design */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 lg:p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              <div>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">Eficiência</p>
                <p className={cn("text-sm lg:text-base font-bold", getEfficiencyColor(machine.efficiency))}>
                  {machine.efficiency}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-green-50 p-3 lg:p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
              <div>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">Tempo Rest.</p>
                <p className="text-sm lg:text-base font-bold text-gray-800">{machine.timeRemaining}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operador - Enhanced */}
        {machine.operator && (
          <div className="mb-4 lg:mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-purple-50 p-3 lg:p-4 rounded-xl border border-purple-100 shadow-sm">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
              <div>
                <span className="text-xs lg:text-sm text-gray-600 font-medium">Operador:</span>
                <span className="text-sm lg:text-base font-bold text-gray-800 ml-2">{machine.operator}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação - Enhanced */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggle}
            disabled={machine.status === 'maintenance'}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 px-4 py-3 lg:py-4 rounded-xl font-bold text-sm lg:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1",
              statusConfig.buttonClass
            )}
          >
            <ButtonIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>{statusConfig.buttonText}</span>
          </button>
          
          <button
            onClick={() => onOpenConfig(machine.id)}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 lg:py-4 rounded-xl font-bold text-sm lg:text-base transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">CONFIG</span>
          </button>
        </div>
      </div>

      {/* Alerta de Eficiência - Enhanced */}
      {machine.efficiency < 70 && machine.status === 'active' && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-lg animate-pulse">
            <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-600" />
          </div>
        </div>
      )}
    </div>
  )
}