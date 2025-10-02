import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/utils'
import type { Machine } from '@/types'

interface MachineGridProps {
  machines: Machine[]
}

const statusColorMap = {
  online: {
    background: 'border-green-200 bg-green-50',
    badge: 'status-online'
  },
  offline: {
    background: 'border-red-200 bg-red-50', 
    badge: 'status-offline'
  },
  maintenance: {
    background: 'border-yellow-200 bg-yellow-50',
    badge: 'status-maintenance'
  },
  idle: {
    background: 'border-blue-200 bg-blue-50',
    badge: 'status-idle'
  }
}

const statusLabels = {
  online: 'ATIVA',
  offline: 'PARADA', 
  maintenance: 'AGUARDANDO',
  idle: 'LIVRE'
}

export const MachineGrid: React.FC<MachineGridProps> = ({ machines }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status das Máquinas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="machine-grid">
          {machines.map((machine) => {
            const colors = statusColorMap[machine.status]
            const statusLabel = statusLabels[machine.status]
            
            return (
              <div
                key={machine.id}
                className={cn(
                  'border rounded-lg p-3 transition-all duration-200 hover:shadow-md',
                  colors.background
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{machine.nome}</span>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    colors.badge
                  )}>
                    {statusLabel}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  {machine.produto && (
                    <div className="mb-1">
                      {machine.produto}
                      {machine.progresso && (
                        <span> • {machine.progresso}% concluído</span>
                      )}
                    </div>
                  )}
                  
                  {(machine.observacao || machine.tempoRestante) && (
                    <div>
                      {machine.observacao && machine.observacao}
                      {machine.tempoRestante && (
                        <span>{machine.observacao ? ' • ' : ''}{machine.tempoRestante} restantes</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
