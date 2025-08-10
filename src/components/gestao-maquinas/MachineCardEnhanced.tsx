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
  Check,
  AlertTriangle,
  Zap,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/utils'
import type { Machine, MachineCardProps, MachineStatus } from '@/types/gestao-maquinas'

interface MachineCardEnhancedProps extends MachineCardProps {
  onOpenDetails?: (machine: Machine) => void
}

export const MachineCardEnhanced: React.FC<MachineCardEnhancedProps> = ({
  machine,
  onToggleStatus,
  onOpenConfig,
  onOpenDetails
}) => {
  const getStatusConfig = (status: MachineStatus) => {
    const configs = {
      active: {
        dotClass: 'bg-green-500 shadow-green-300 shadow-lg animate-pulse',
        textClass: 'text-green-600',
        bgClass: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
        buttonClass: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg',
        buttonIcon: Pause,
        buttonText: 'PAUSAR',
        statusBadge: 'bg-green-100 text-green-800 border-green-200'
      },
      stopped: {
        dotClass: 'bg-red-500 shadow-red-300 shadow-lg',
        textClass: 'text-red-600',
        bgClass: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200',
        buttonClass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg',
        buttonIcon: Play,
        buttonText: 'INICIAR',
        statusBadge: 'bg-red-100 text-red-800 border-red-200'
      },
      maintenance: {
        dotClass: 'bg-yellow-500 shadow-yellow-300 shadow-lg animate-pulse',
        textClass: 'text-yellow-600',
        bgClass: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
        buttonClass: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        buttonIcon: Wrench,
        buttonText: 'MANUTENÇÃO',
        statusBadge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      waiting: {
        dotClass: 'bg-gray-500 shadow-gray-300 shadow-lg',
        textClass: 'text-gray-600',
        bgClass: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
        buttonClass: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg',
        buttonIcon: Play,
        buttonText: 'INICIAR',
        statusBadge: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
    return configs[status]
  }

  const statusConfig = getStatusConfig(machine.status)
  const ButtonIcon = statusConfig.buttonIcon

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-600'
    if (progress >= 50) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-red-500 to-pink-600'
  }

  const getProgressTextColor = (progress: number) => {
    if (progress >= 80) return 'text-green-700'
    if (progress >= 50) return 'text-yellow-700'
    return 'text-red-700'
  }

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 90) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (efficiency >= 70) return <Activity className="w-4 h-4 text-yellow-600" />
    return <AlertTriangle className="w-4 h-4 text-red-600" />
  }

  const handleToggle = () => {
    if (machine.status !== 'maintenance') {
      onToggleStatus(machine.id, machine.status)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const getTypeConfig = (type: string) => {
    const configs = {
      no_print: { label: 'Sem Impressão', color: 'bg-blue-100 text-blue-800', icon: Package },
      with_print: { label: 'Com Impressão', color: 'bg-purple-100 text-purple-800', icon: Zap },
      special: { label: 'Especial', color: 'bg-orange-100 text-orange-800', icon: Check }
    }
    return configs[type as keyof typeof configs] || configs.no_print
  }

  const typeConfig = getTypeConfig(machine.type)
  const TypeIcon = typeConfig.icon

  return (
    <div className={cn(
      "relative bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden group",
      statusConfig.bgClass
    )}>
      
      {/* Header com Status */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          
          {/* Nome da Máquina e Status */}
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              statusConfig.dotClass
            )} />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{machine.name}</h3>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border inline-block mt-1",
                statusConfig.statusBadge
              )}>
                {machine.status === 'active' && 'ATIVA'}
                {machine.status === 'stopped' && 'PARADA'}
                {machine.status === 'maintenance' && 'MANUTENÇÃO'}
                {machine.status === 'waiting' && 'AGUARDANDO'}
              </div>
            </div>
          </div>

          {/* Tipo da Máquina */}
          <div className={cn(
            "px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1",
            typeConfig.color
          )}>
            <TypeIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{typeConfig.label}</span>
          </div>
        </div>

        {/* Produto Atual */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Produto Atual:</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-white border-opacity-50">
            <p className="font-semibold text-gray-800 text-sm sm:text-base">{machine.currentProduct}</p>
          </div>
        </div>

        {/* Progresso com Design Moderno */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Progresso da Produção:</span>
            <span className={cn(
              "text-sm font-bold",
              getProgressTextColor(machine.progress)
            )}>
              {machine.progress}%
            </span>
          </div>
          
          {/* Barra de Progresso com Gradiente */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                getProgressColor(machine.progress)
              )}
              style={{ width: `${machine.progress}%` }}
            />
            {/* Brilho na barra */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
          </div>
          
          {/* Números de Produção */}
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>{formatNumber(machine.currentProduction)} produzidos</span>
            <span>Meta: {formatNumber(machine.targetProduction)}</span>
          </div>
        </div>

        {/* Métricas em Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          
          {/* Eficiência */}
          <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-white border-opacity-50">
            <div className="flex items-center space-x-2 mb-1">
              {getEfficiencyIcon(machine.efficiency)}
              <span className="text-xs text-gray-600 font-medium">Eficiência</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{machine.efficiency}%</p>
          </div>

          {/* Tempo Restante */}
          <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-white border-opacity-50">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">Tempo</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{machine.timeRemaining}</p>
          </div>
        </div>

        {/* Operador (se disponível) */}
        {machine.operator && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 bg-white bg-opacity-70 rounded-lg p-3 border border-white border-opacity-50">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Operador:</span>
              <span className="text-sm font-semibold text-gray-800">{machine.operator}</span>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          
          {/* Botão Principal (Play/Pause) */}
          <button
            onClick={handleToggle}
            disabled={machine.status === 'maintenance'}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105",
              statusConfig.buttonClass,
              machine.status === 'maintenance' && "hover:scale-100"
            )}
          >
            <ButtonIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{statusConfig.buttonText}</span>
          </button>
          
          {/* Botão Detalhes */}
          {onOpenDetails && (
            <button
              onClick={() => onOpenDetails(machine)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-1 hover:shadow-lg transform hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="hidden lg:inline">Ver</span>
            </button>
          )}
          
          {/* Botão Config */}
          <button
            onClick={() => onOpenConfig(machine.id)}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-1 hover:shadow-lg transform hover:scale-105"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden lg:inline">CONFIG</span>
          </button>
        </div>
      </div>

      {/* Linha de Indicador de Status */}
      <div className={cn(
        "h-1 w-full",
        machine.status === 'active' && "bg-gradient-to-r from-green-400 to-emerald-500",
        machine.status === 'stopped' && "bg-gradient-to-r from-red-400 to-pink-500",
        machine.status === 'maintenance' && "bg-gradient-to-r from-yellow-400 to-orange-500",
        machine.status === 'waiting' && "bg-gradient-to-r from-gray-400 to-slate-500"
      )} />

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-2xl" />
    </div>
  )
}

export default MachineCardEnhanced