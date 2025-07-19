import React from 'react'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/utils'
import { useUIStore } from '@/stores'

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  error: XCircle
}

const colorMap = {
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
  error: 'bg-red-500 text-white'
}

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useUIStore()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type]
        const colorClass = colorMap[notification.type]

        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-center p-4 rounded-lg shadow-lg max-w-sm',
              'transform transition-all duration-300 ease-in-out',
              'animate-in slide-in-from-right',
              colorClass
            )}
          >
            <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">
              {notification.message}
            </p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 flex-shrink-0 hover:bg-white/20 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
