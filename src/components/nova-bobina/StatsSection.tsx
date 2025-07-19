import React from 'react'
import type { RecentBobina } from '@/types/nova-bobina'
import { cn } from '@/utils'

interface StatsSectionProps {
  className?: string
}

export const StatsSection: React.FC<StatsSectionProps> = ({ className }) => {
  // Mock data para bobinas recentes
  const recentBobinas: RecentBobina[] = [
    {
      id: '1',
      codigo: 'BOB-2025-891',
      tipoPapel: 'MIX32',
      gramatura: '45',
      fornecedor: 'PARANA',
      peso: 180,
      status: 'estoque',
      timestamp: '17:15'
    },
    {
      id: '2',
      codigo: 'BOB-2025-890',
      tipoPapel: 'MIX32',
      gramatura: '45',
      fornecedor: 'PARANA',
      peso: 95,
      status: 'em-maquina',
      timestamp: '16:45',
      maquina: '3',
      produto: 'KRAFT 1/2 MIX'
    },
    {
      id: '3',
      codigo: 'BOB-2025-889',
      tipoPapel: 'MIX32',
      gramatura: '45',
      fornecedor: 'SUZANO',
      peso: 25,
      status: 'sobra',
      timestamp: '16:20'
    }
  ]

  const stats = {
    emEstoque: 42,
    emMaquinas: 8,
    sobrasUteis: 15,
    acabaramHoje: 3
  }

  const tiposPopulares = [
    { tipo: 'MIX32', percentual: 35 },
    { tipo: 'IRANI45', percentual: 22 },
    { tipo: 'BRANCO52', percentual: 18 },
    { tipo: 'MONO32', percentual: 15 },
    { tipo: 'Outros', percentual: 10 }
  ]

  const getStatusInfo = (status: string) => {
    const statusMap = {
      estoque: { label: '📦 ESTOQUE', color: 'green' },
      'em-maquina': { label: '⚙️ MÁQUINA', color: 'blue' },
      sobra: { label: '📏 SOBRA', color: 'yellow' },
      acabou: { label: '✅ ACABOU', color: 'red' }
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'gray' }
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6", className)}>
      {/* Recent Bobinas */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Últimas Bobinas Cadastradas</h3>
        <div className="space-y-3">
          {recentBobinas.map((bobina) => {
            const statusInfo = getStatusInfo(bobina.status)
            
            return (
              <div 
                key={bobina.id} 
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  bobina.status === 'estoque' && 'bg-gray-50',
                  bobina.status === 'em-maquina' && 'bg-blue-50',
                  bobina.status === 'sobra' && 'bg-yellow-50'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    bobina.status === 'estoque' && 'bg-green-100',
                    bobina.status === 'em-maquina' && 'bg-blue-100',
                    bobina.status === 'sobra' && 'bg-yellow-100'
                  )}>
                    <span className="text-sm">
                      {bobina.status === 'estoque' && '📦'}
                      {bobina.status === 'em-maquina' && '⚙️'}
                      {bobina.status === 'sobra' && '📏'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{bobina.codigo}</p>
                    <p className="text-sm text-gray-600">
                      {bobina.tipoPapel} • {bobina.gramatura}g/m² • {bobina.fornecedor} • {bobina.peso}kg
                      {bobina.status === 'em-maquina' && ' restantes'}
                      {bobina.status === 'sobra' && ' sobra'}
                    </p>
                    {bobina.status === 'em-maquina' && bobina.maquina && bobina.produto && (
                      <p className="text-xs text-blue-600">
                        🏭 Máq. {bobina.maquina} • {bobina.produto}
                      </p>
                    )}
                    {bobina.status === 'sobra' && (
                      <p className="text-xs text-yellow-600">Aproveitável p/ pequenos</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-sm',
                    bobina.status === 'estoque' && 'bg-green-100 text-green-800',
                    bobina.status === 'em-maquina' && 'bg-blue-100 text-blue-800',
                    bobina.status === 'sobra' && 'bg-yellow-100 text-yellow-800'
                  )}>
                    {statusInfo.label}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{bobina.timestamp}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Estatísticas Simplificadas */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Controle de Bobinas</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.emEstoque}</div>
            <div className="text-sm text-green-800">📦 Em Estoque</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.emMaquinas}</div>
            <div className="text-sm text-blue-800">⚙️ Em Máquinas</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.sobrasUteis}</div>
            <div className="text-sm text-yellow-800">📏 Sobras Úteis</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.acabaramHoje}</div>
            <div className="text-sm text-red-800">✅ Acabaram Hoje</div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Tipos mais utilizados:</h4>
          <div className="space-y-2">
            {tiposPopulares.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.tipo}</span>
                <span className="font-medium">{item.percentual}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Fluxo do dia:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>📦 → ⚙️ : 5 bobinas para máquinas</div>
            <div>⚙️ → ✅ : 3 bobinas acabaram</div>
            <div>⚙️ → 📏 : 2 sobras aproveitáveis</div>
          </div>
        </div>
      </div>
    </div>
  )
}
