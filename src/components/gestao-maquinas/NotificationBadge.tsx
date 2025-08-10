import React from 'react'
import { Bell, X, Clock, Package } from 'lucide-react'
import { cn } from '@/utils'

interface NotificationBadgeProps {
  notifications: string[]
  onDismiss?: (index: number) => void
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  notifications,
  onDismiss
}) => {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification, index) => (
        <div
          key={index}
          className="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500 animate-slideIn"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Bell className="w-4 h-4" />
                <span className="text-xs font-medium">Nova Bobina Atribuída</span>
                <Clock className="w-3 h-3" />
              </div>
              
              <p className="text-sm text-blue-100 leading-relaxed">
                {notification}
              </p>
            </div>
            
            {onDismiss && (
              <button
                onClick={() => onDismiss(index)}
                className="flex-shrink-0 p-1 hover:bg-blue-500 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
      
      {notifications.length > 3 && (
        <div className="bg-gray-600 text-white p-3 rounded-lg shadow-lg text-center">
          <span className="text-sm">
            +{notifications.length - 3} notificações pendentes
          </span>
        </div>
      )}
    </div>
  )
}

interface BobinaStatusBadgeProps {
  machine: {
    id: number
    name: string
    bobina?: {
      numero: string
      tipo: string
      peso: string
    }
  }
  isNew?: boolean
}

export const BobinaStatusBadge: React.FC<BobinaStatusBadgeProps> = ({
  machine,
  isNew = false
}) => {
  if (!machine.bobina) return null

  return (
    <div className={cn(
      "absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10",
      isNew 
        ? "bg-green-500 text-white animate-pulse" 
        : "bg-blue-500 text-white"
    )}>
      <div className="flex items-center space-x-1">
        <Package className="w-3 h-3" />
        <span>Nova Bobina</span>
      </div>
    </div>
  )
}

export default NotificationBadge
