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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      
      {/* Header com Status */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={cn("w-3 h-3 rounded-full", statusConfig.dotClass)} />
            <h3 className="text-lg font-semibold text-gray-800">{machine.name}</h3>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getMachineTypeLabel(machine.type)}
          </div>
        </div>
        
        <div className={cn("inline-block px-3 py-1 rounded text-xs font-medium", statusConfig.bgClass)}>
          {machine.status === 'active' && 'ATIVA'}
          {machine.status === 'stopped' && 'PARADA'}
          {machine.status === 'maintenance' && 'MANUTENÇÃO'}
          {machine.status === 'waiting' && 'AGUARDANDO'}
        </div>
      </div>

      {/* Conteúdo Principal - Com Dados Reais */}
      <div className="p-6">
        
        {/* Bobina Atual - Dados Reais */}
        {machine.bobina && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600 font-medium">Bobina Atual:</span>
            </div>
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="font-semibold text-gray-800">{machine.bobina.numero}</div>
              <div className="text-sm text-gray-600">
                {machine.bobina.tipo} • {machine.bobina.peso}kg
              </div>
            </div>
          </div>
        )}

        {/* Produto Atual - Dados Reais */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600 font-medium">Produto:</span>
          </div>
          <div className="font-semibold text-gray-800 bg-gray-50 p-3 rounded border">
            {machine.currentProduct}
          </div>
          {machine.pedidoAtivo && (
            <div className="text-xs text-gray-500 mt-1">
              Pedido: {machine.pedidoAtivo.numero}
            </div>
          )}
        </div>

        {/* Progresso - Real do Banco */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 font-medium">Progresso:</span>
            <span className={cn("text-sm font-bold", getEfficiencyColor(machine.progress))}>
              {machine.progress}%
            </span>
          </div>
          
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", getProgressColor(machine.progress))}
              style={{ width: `${machine.progress}%` }}
            />
          </div>
          
          <div className="text-sm text-gray-600 mt-2 flex justify-between">
            <span>{formatNumber(machine.currentProduction)} unidades</span>
            <span>Meta: {formatNumber(machine.targetProduction)}</span>
          </div>
        </div>

        {/* Métricas - Simple & Clean */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded border">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Eficiência</p>
                <p className={cn("text-sm font-bold", getEfficiencyColor(machine.efficiency))}>
                  {machine.efficiency}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded border">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Tempo Rest.</p>
                <p className="text-sm font-bold text-gray-800">{machine.timeRemaining}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operador */}
        {machine.operator && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded border">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-xs text-gray-600">Operador:</span>
                <span className="text-sm font-semibold text-gray-800 ml-2">{machine.operator}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação - Simple */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggle}
            disabled={machine.status === 'maintenance'}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold text-sm transition-colors duration-300",
              statusConfig.buttonClass
            )}
          >
            <ButtonIcon className="w-4 h-4" />
            <span>{statusConfig.buttonText}</span>
          </button>
          
          <button
            onClick={() => onOpenConfig(machine.id)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-colors duration-300 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">CONFIG</span>
          </button>
        </div>
      </div>

      {/* Alerta de Eficiência */}
      {machine.efficiency < 70 && machine.status === 'active' && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-300">
            <AlertTriangle className="w-3 h-3 text-yellow-600" />
          </div>
        </div>
      )}
    </div>
  )
}