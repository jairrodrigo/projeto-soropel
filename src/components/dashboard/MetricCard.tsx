import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui'
import { cn, formatNumber } from '@/utils'

interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  colorScheme: 'blue' | 'green' | 'purple' | 'orange'
  subtitle?: string
  progress?: {
    current: number
    total: number
    label?: string
  }
  className?: string
}

const colorClasses = {
  blue: {
    value: 'text-blue-600',
    background: 'bg-blue-100',
    icon: 'text-blue-600'
  },
  green: {
    value: 'text-green-600', 
    background: 'bg-green-100',
    icon: 'text-green-600'
  },
  purple: {
    value: 'text-purple-600',
    background: 'bg-purple-100', 
    icon: 'text-purple-600'
  },
  orange: {
    value: 'text-orange-600',
    background: 'bg-orange-100',
    icon: 'text-orange-600'
  }
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  colorScheme,
  subtitle,
  progress,
  className
}) => {
  const colors = colorClasses[colorScheme]
  
  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      return formatNumber(val)
    }
    return val
  }

  return (
    <Card className={cn(
      'metric-card bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={cn('text-3xl font-bold', colors.value)}>
            {formatValue(value)}
          </p>
          
          {subtitle && (
            <div className="text-sm text-gray-500 mt-1">
              {subtitle}
            </div>
          )}
          
          {progress && (
            <div className="mt-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all duration-500', colors.background.replace('bg-', 'bg-').replace('-100', '-500'))}
                  style={{ 
                    width: `${Math.min((progress.current / progress.total) * 100, 100)}%` 
                  }}
                />
              </div>
              {progress.label && (
                <span className="text-xs text-gray-500 mt-1 block">
                  {progress.label}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
          colors.background
        )}>
          <Icon className={cn('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </Card>
  )
}
