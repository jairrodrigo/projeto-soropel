import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';

interface ProcessingStatusProps {
  isProcessing: boolean;
  hasExtractedData: boolean;
  currentStep: number;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing,
  hasExtractedData,
  currentStep
}) => {
  const steps = [
    { id: 1, label: 'Captura de Imagem', description: 'Fotografar ou fazer upload da ordem' },
    { id: 2, label: 'Processamento OCR', description: 'Extraindo dados do documento' },
    { id: 3, label: 'Validação', description: 'Verificando informações extraídas' },
    { id: 4, label: 'Finalização', description: 'Salvando pedido no sistema' }
  ];

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep && isProcessing) return 'processing';
    if (stepId === currentStep && !isProcessing) return 'current';
    return 'pending';
  };

  const getStepIcon = (stepId: number) => {
    const status = getStepStatus(stepId);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'current':
        return <div className="w-5 h-5 bg-blue-600 rounded-full" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStepClasses = (stepId: number) => {
    const status = getStepStatus(stepId);
    
    return cn(
      'flex items-center space-x-3 p-3 rounded-lg transition-all',
      {
        'bg-green-50 border border-green-200': status === 'completed',
        'bg-blue-50 border border-blue-200': status === 'processing' || status === 'current',
        'bg-gray-50 border border-gray-200': status === 'pending'
      }
    );
  };

  if (isProcessing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processando Ordem de Produção
          </h3>
          <p className="text-gray-600 mb-6">
            Extraindo dados do documento... Isso pode levar alguns segundos.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Analisando estrutura do documento</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Progresso do Processamento
      </h3>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className={getStepClasses(step.id)}>
            <div className="flex-shrink-0">
              {getStepIcon(step.id)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                getStepStatus(step.id) === 'completed' ? 'text-green-800' :
                getStepStatus(step.id) === 'processing' || getStepStatus(step.id) === 'current' ? 'text-blue-800' :
                'text-gray-600'
              )}>
                {step.label}
              </p>
              <p className={cn(
                'text-xs',
                getStepStatus(step.id) === 'completed' ? 'text-green-600' :
                getStepStatus(step.id) === 'processing' || getStepStatus(step.id) === 'current' ? 'text-blue-600' :
                'text-gray-500'
              )}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hasExtractedData && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Dados extraídos com sucesso!
            </p>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Revise as informações no formulário antes de salvar.
          </p>
        </div>
      )}
    </div>
  );
};