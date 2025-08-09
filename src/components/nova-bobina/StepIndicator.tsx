import React from 'react'
import { Check, Clipboard } from 'lucide-react'
import { cn } from '@/utils'

interface StepIndicatorProps {
  currentStep: number
  steps: string[]
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  steps = ['Captura', 'Processamento', 'Confirmação'] 
}) => {
  const progressPercentage = (currentStep / steps.length) * 100

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Clipboard className="w-5 h-5 mr-2 text-blue-600" />
            Progresso do Registro
          </h3>
          <p className="text-sm text-gray-600">Passo {currentStep} de {steps.length}</p>
        </div>

        {/* Progress Bar - Enhanced */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="absolute -top-1 right-0 transform translate-x-1/2">
            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>
        
        {/* Steps - Mobile Enhanced */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isPending = stepNumber > currentStep

            return (
              <div key={stepNumber} className="flex items-center space-x-4 sm:space-x-3">
                {/* Step Circle */}
                <div className={cn(
                  'w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-sm font-bold transition-all duration-300 shadow-lg',
                  isCompleted && 'bg-green-500 text-white shadow-green-200',
                  isCurrent && 'bg-blue-600 text-white shadow-blue-200 ring-4 ring-blue-100',
                  isPending && 'bg-gray-300 text-gray-600 shadow-gray-200'
                )}>
                  {isCompleted ? (
                    <Check className="w-6 h-6 sm:w-5 sm:h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Text */}
                <div className="flex-1 sm:flex-none">
                  <span className={cn(
                    'text-base sm:text-sm font-semibold transition-colors duration-300 block',
                    isCompleted && 'text-green-600',
                    isCurrent && 'text-blue-600', 
                    isPending && 'text-gray-600'
                  )}>
                    {step}
                  </span>
                  <span className={cn(
                    'text-xs transition-colors duration-300 block sm:hidden',
                    isCompleted && 'text-green-500',
                    isCurrent && 'text-blue-500', 
                    isPending && 'text-gray-500'
                  )}>
                    {isCompleted ? 'Concluído' : 
                     isCurrent ? 'Em andamento' : 
                     'Pendente'}
                  </span>
                </div>

                {/* Connection Line (mobile only) */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block flex-1 h-px bg-gray-300 mx-2" />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Current Step Description */}
        <div className="text-center bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-900">
            {currentStep === 1 && 'Capture ou faça upload da imagem do rótulo'}
            {currentStep === 2 && 'IA está analisando a imagem e extraindo dados'}
            {currentStep === 3 && 'Confirme os dados e salve a bobina no sistema'}
          </p>
        </div>
      </div>
    </div>
  )
}
