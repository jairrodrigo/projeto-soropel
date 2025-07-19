import React from 'react'
import { Check } from 'lucide-react'
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
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg mb-6">
      <div className="flex flex-col space-y-3">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isPending = stepNumber > currentStep

            return (
              <div key={stepNumber} className="flex items-center space-x-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  isCompleted && 'bg-green-500 text-white',
                  isCurrent && 'bg-blue-600 text-white',
                  isPending && 'bg-gray-300 text-gray-600'
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className={cn(
                  'text-sm font-medium transition-colors duration-300',
                  isCompleted && 'text-green-600',
                  isCurrent && 'text-blue-600', 
                  isPending && 'text-gray-600'
                )}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
        
        {/* Step Info */}
        <div className="text-center">
          <span className="text-xs text-gray-500">
            Passo {currentStep} de {steps.length}
          </span>
        </div>
      </div>
    </div>
  )
}
