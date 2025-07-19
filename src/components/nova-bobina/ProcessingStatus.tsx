import React from 'react'
import { Zap } from 'lucide-react'
import { cn } from '@/utils'

interface ProcessingStatusProps {
  isVisible: boolean
  progress: number
  message: string
  className?: string
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isVisible,
  progress,
  message,
  className
}) => {
  if (!isVisible) return null

  return (
    <div className={cn(
      'bg-white p-6 rounded-xl shadow-lg fade-in',
      className
    )}>
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Zap className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Processando Imagem...</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
      <div className="mt-4 bg-gray-200 rounded-full h-3">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {Math.round(progress)}% concluído
      </div>
    </div>
  )
}
