import React from 'react'
import { AlertTriangle, Calendar, Clock, CheckCircle, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn, getTimeAgo } from '@/utils'
import type { Alert } from '@/types'

interface AlertPanelProps {
  alerts: Alert[]
  onDismiss?: (id: string) => void
}

const alertColorMap = {
  warning: {
    background: 'bg-yellow-50 border-yellow-400',
    icon: 'bg-yellow-500',
    text: 'text-yellow-800',
    description: 'text-yellow-600',
    timestamp: 'text-yellow-500'
  },
  info: {
    background: 'bg-blue-50 border-blue-400', 
    icon: 'bg-blue-500',
    text: 'text-blue-800',
    description: 'text-blue-600',
    timestamp: 'text-blue-500'
  },
  error: {
    background: 'bg-red-50 border-red-400',
    icon: 'bg-red-500', 
    text: 'text-red-800',
    description: 'text-red-600',
    timestamp: 'text-red-500'
  },
  success: {
    background: 'bg-green-50 border-green-400',
    icon: 'bg-green-500',
    text: 'text-green-800', 
    description: 'text-green-600',
    timestamp: 'text-green-500'
  }
}

const alertIconMap = {
  warning: AlertTriangle,
  info: Calendar,
  error: Clock,
  success: CheckCircle
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onDismiss }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas e Notificações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const colors = alertColorMap[alert.type]
            const IconComponent = alertIconMap[alert.type]
            
            return (
              <div
                key={alert.id}
                className={cn(
                  'alert-card border-l-4 p-4 rounded-lg transition-all duration-300 hover:shadow-md',
                  colors.background
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    colors.icon
                  )}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <p className={cn('font-medium', colors.text)}>
                      {alert.title}
                    </p>
                    <p className={cn('text-sm', colors.description)}>
                      {alert.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={cn('text-xs', colors.timestamp)}>
                      {getTimeAgo(alert.timestamp)}
                    </div>
                    
                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className={cn(
                          'p-1 rounded hover:bg-black/10 transition-colors',
                          colors.text
                        )}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
