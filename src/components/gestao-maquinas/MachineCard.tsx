// Componente MachineCard - Sistema Soropel
// Baseado nos padrões estabelecidos no projeto

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
  Check
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
        dotClass: 'bg-green-500 shadow-green-300',
        textClass: 'text-green-600',
        buttonClass: 'bg-red-500 hover:bg-red-600 text-white',
        buttonIcon: Pause,
        buttonText: 'PAUSAR'
      },
      stopped: {
        dotClass: 'bg-red-500 shadow-red-300',
        textClass: 'text-red-600',
        buttonClass: 'bg-green-500 hover:bg-green-600 text-white',
        buttonIcon: Play,
        buttonText: 'INICIAR'
      },
      maintenance: {
        dotClass: 'bg-yellow-500 shadow-yellow-300',
        textClass: 'text-yellow-600',
        buttonClass: 'bg-yellow-500 text-white opacity-60 cursor-not-allowed',
        buttonIcon: Wrench,
        buttonText: 'MANUTENÇÃO'
      },
      waiting: {
        dotClass: 'bg-gray-500 shadow-gray-300',
        textClass: 'text-gray-600',
        buttonClass: 'bg-green-500 hover:bg-green-600 text-white',
        buttonIcon: Play,
        buttonText: 'INICIAR'
      }
    }
    return configs[status]
  }

  const statusConfig = getStatusConfig(machine.status)
  const ButtonIcon = statusConfig.buttonIcon

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleToggle = () => {
    if (machine.status !== 'maintenance') {
      onToggleStatus(machine.id, machine.status)
    }
  }

  const formatNumber = (num: number) => {
    return (num / 1000).toFixed(2) + ' mil'
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header com Status e Botões */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={cn(
            "w-3 h-3 rounded-full mr-3 shadow-lg",
            statusConfig.dotClass
          )} />
          <span className="text-gray-800 font-semibold">{machine.name}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggle}
            disabled={machine.status === 'maintenance'}
            className={cn(
              "flex items-center space-x-1 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 hover:shadow-lg",
              statusConfig.buttonClass
            )}
          >
            <ButtonIcon className="w-3 h-3" />
            <span>{statusConfig.buttonText}</span>
          </button>
          
          <button
            onClick={() => onOpenConfig(machine.id)}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs transition-all duration-300 hover:shadow-lg"
          >
            <Settings className="w-3 h-3" />
            <span>CONFIG</span>
          </button>
        </div>
      </div>

      {/* Produto Atual */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">Produto Atual:</div>
        <div className="font-semibold text-lg text-gray-800">{machine.currentProduct}</div>
      </div>

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progresso:</span>
          <span className={cn(
            "text-sm font-medium",
            machine.progress >= 80 ? 'text-green-600' : 
            machine.progress >= 50 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {machine.progress}%
          </span>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300",
              getProgressColor(machine.progress)
            )}
            style={{ width: `${machine.progress}%` }}
          />
        </div>
        
        <div className="text-sm text-gray-600 mt-2">
          {formatNumber(machine.currentProduction)} / {formatNumber(machine.targetProduction)} unidades
        </div>
      </div>

      {/* Footer com Informações */}
      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>{machine.timeRemaining}</span>
        </div>
        <div className="flex items-center">
          <Activity className="w-4 h-4 mr-1" />
          <span>{machine.efficiency}% eficiência</span>
        </div>
      </div>
    </div>
  )
}
