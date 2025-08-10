// Dashboard de Produção em Tempo Real - Sistema Soropel
// Mostra métricas consolidadas de todas as máquinas

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Activity,
  Zap,
  Clock,
  Target,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/utils'
import type { Machine } from '@/types/gestao-maquinas'

interface DashboardProducaoProps {
  machines: Machine[]
  onRefresh?: () => void
}

export const DashboardProducao: React.FC<DashboardProducaoProps> = ({
  machines,
  onRefresh
}) => {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Auto refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      onRefresh?.()
      setLastUpdate(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh])

  // Calcular métricas consolidadas
  const metrics = React.useMemo(() => {
    const activeMachines = machines.filter(m => m.status === 'active')
    const totalProduction = machines.reduce((sum, m) => sum + m.currentProduction, 0)
    const totalTarget = machines.reduce((sum, m) => sum + m.targetProduction, 0)
    const avgEfficiency = machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length || 0
    const avgProgress = machines.reduce((sum, m) => sum + m.progress, 0) / machines.length || 0

    // Calcular tendência (simulado)
    const efficiencyTrend = Math.random() > 0.5 ? 'up' : 'down'
    const productionTrend = Math.random() > 0.5 ? 'up' : 'down'

    return {
      activeMachines: activeMachines.length,
      totalMachines: machines.length,
      totalProduction,
      totalTarget,
      progressPercentage: (totalProduction / totalTarget) * 100 || 0,
      avgEfficiency,
      avgProgress,
      efficiencyTrend,
      productionTrend,
      estimatedCompletion: calculateEstimatedTime(machines)
    }
  }, [machines])

  const calculateEstimatedTime = (machines: Machine[]): string => {
    const activeMachines = machines.filter(m => m.status === 'active')
    if (activeMachines.length === 0) return 'N/A'

    // Cálculo simplificado baseado no progresso médio
    const avgProgress = activeMachines.reduce((sum, m) => sum + m.progress, 0) / activeMachines.length
    const remainingProgress = 100 - avgProgress
    const estimatedHours = (remainingProgress / 100) * 8 // Assumindo 8h como base

    if (estimatedHours < 1) {
      return `${Math.round(estimatedHours * 60)}min`
    } else {
      return `${Math.round(estimatedHours)}h ${Math.round((estimatedHours % 1) * 60)}min`
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(num))
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' 
      ? <ChevronUp className="w-4 h-4 text-green-500" />
      : <ChevronDown className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Dashboard de Produção</h3>
          <p className="text-sm text-gray-600">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200",
              autoRefresh 
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            )}
          >
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </button>
          
          <button
            onClick={onRefresh}
            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200 hover:scale-105"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Máquinas Ativas */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">ATIVAS</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-700">
              {metrics.activeMachines}
            </span>
            <span className="text-sm text-gray-600">
              / {metrics.totalMachines}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {Math.round((metrics.activeMachines / metrics.totalMachines) * 100)}% operando
          </p>
        </div>

        {/* Produção Total */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-600" />
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-green-600">PRODUÇÃO</span>
              {getTrendIcon(metrics.productionTrend)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-700">
              {formatNumber(metrics.totalProduction)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Meta: {formatNumber(metrics.totalTarget)}
          </p>
        </div>

        {/* Eficiência Média */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-purple-600">EFICIÊNCIA</span>
              {getTrendIcon(metrics.efficiencyTrend)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn("text-2xl font-bold", getEfficiencyColor(metrics.avgEfficiency))}>
              {Math.round(metrics.avgEfficiency)}%
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Média geral
          </p>
        </div>

        {/* Tempo Estimado */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">CONCLUSÃO</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-orange-700">
              {metrics.estimatedCompletion}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Tempo estimado
          </p>
        </div>
      </div>

      {/* Progresso Geral */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-800">Progresso Geral da Produção</h4>
          <span className="text-2xl font-bold text-blue-600">
            {Math.round(metrics.progressPercentage)}%
          </span>
        </div>
        
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${Math.min(metrics.progressPercentage, 100)}%` }}
          >
            {/* Animação de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{formatNumber(metrics.totalProduction)} produzidos</span>
          <span>Meta: {formatNumber(metrics.totalTarget)}</span>
        </div>
      </div>

      {/* Alertas e Status */}
      {metrics.avgEfficiency < 70 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Atenção: Eficiência Baixa</p>
              <p className="text-sm text-yellow-700">
                A eficiência média está abaixo de 70%. Considere verificar as máquinas com menor performance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardProducao