import React from 'react'
import { Activity, Settings, Package2, Clipboard, Package } from 'lucide-react'
import { cn } from '@/utils'
import type { BobinaFormData, BobinaStatus } from '@/types/nova-bobina'
import type { Product } from '@/types/supabase'
import { MAQUINAS } from '@/types/nova-bobina'
import { ProductSelector } from './ProductSelector'

interface StatusControlProps {
  formData: BobinaFormData
  onUpdateFormData: (updates: Partial<BobinaFormData>) => void
  onUpdateStatus: (status: BobinaStatus) => void
  onReturnToStock: (peso: number) => void
}

export const StatusControl: React.FC<StatusControlProps> = ({
  formData,
  onUpdateFormData,
  onUpdateStatus,
  onReturnToStock
}) => {
  const statusOptions = [
    {
      value: 'estoque' as const,
      label: 'ESTOQUE',
      icon: Package,
      description: 'Disponível para uso',
      color: 'green'
    },
    {
      value: 'em-maquina' as const,
      label: 'EM MÁQUINA',
      icon: Settings,
      description: 'Sendo utilizada na produção',
      color: 'blue'
    },
    {
      value: 'sobra' as const,
      label: 'SOBRA',
      icon: Package2,
      description: 'Resto aproveitável',
      color: 'yellow'
    }
  ]

  const handleReturnToStock = () => {
    const pesoSobra = Number(formData.pesoSobra)
    if (!pesoSobra || !formData.codigoBobina) {
      return
    }
    
    const confirmed = window.confirm(
      `Confirma retorno de ${pesoSobra}kg da sobra ao estoque?\n\nIsto criará uma nova entrada de estoque baseada nesta bobina.`
    )
    
    if (confirmed) {
      onReturnToStock(pesoSobra)
    }
  }

  const handleProductSelect = (product: Product | null) => {
    onUpdateFormData({
      produtoProducaoId: product?.id,
      produtoProducao: product?.name || ''
    })
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Status e Controle da Bobina</h3>
      </div>
      
      <div className="space-y-8">
        {/* Status Selection - Enhanced */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4">
            Status da Bobina *
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => onUpdateStatus(option.value)}
                className={cn(
                  "p-4 border-2 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer",
                  formData.status === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg`
                    : "border-gray-300 bg-white hover:border-gray-400"
                )}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <option.icon className="w-8 h-8 text-gray-600" />
                  <div>
                    <div className={cn(
                      "font-bold text-sm",
                      formData.status === option.value ? `text-${option.color}-700` : "text-gray-700"
                    )}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 transition-all',
                    formData.status === option.value 
                      ? `bg-${option.color}-500 border-${option.color}-500` 
                      : 'border-gray-300'
                  )}>
                    {formData.status === option.value && (
                      <div className="w-full h-full bg-white rounded-full scale-50" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campos condicionais para EM MÁQUINA - Enhanced */}
        {formData.status === 'em-maquina' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuração de Produção
            </h4>
            
            <div className="space-y-6">
              {/* Máquina */}
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-3">
                  Máquina Atual *
                </label>
                <select
                  value={formData.maquinaAtual || ''}
                  onChange={(e) => onUpdateFormData({ maquinaAtual: e.target.value })}
                  className="w-full p-4 text-lg border-2 border-blue-300 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                  <option value="">Selecione a máquina...</option>
                  {MAQUINAS.map(maquina => (
                    <option key={maquina} value={maquina}>
                      Máquina {maquina}
                    </option>
                  ))}
                </select>
              </div>

              {/* Produto sendo Produzido - Enhanced com Selector */}
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-3">
                  Produto sendo Produzido *
                </label>
                <ProductSelector
                  selectedProductId={formData.produtoProducaoId}
                  onProductSelect={handleProductSelect}
                  placeholder="Selecione o produto sendo produzido..."
                />
                <p className="text-xs text-blue-700 mt-2">
                  Selecione o produto específico que está sendo fabricado com esta bobina
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Campos específicos para SOBRA */}
        {formData.status === 'sobra' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="text-sm font-semibold text-yellow-800 mb-3">📏 Detalhes da Sobra</h5>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-yellow-700 mb-1">
                  Peso da Sobra (kg)
                </label>
                <input
                  type="number"
                  value={formData.pesoSobra || ''}
                  onChange={(e) => onUpdateFormData({ pesoSobra: Number(e.target.value) })}
                  className="w-full p-2 border border-yellow-300 rounded text-sm"
                  placeholder="Ex: 25"
                  min="1"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-yellow-700 mb-1">
                  Observações da Sobra
                </label>
                <input
                  type="text"
                  value={formData.obsSobra || ''}
                  onChange={(e) => onUpdateFormData({ obsSobra: e.target.value })}
                  className="w-full p-2 border border-yellow-300 rounded text-sm"
                  placeholder="Ex: Boa qualidade, aproveitável"
                />
              </div>
            </div>
            
            <div className="p-3 bg-yellow-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-800">
                  Retornar sobra ao estoque?
                </span>
                <button
                  type="button"
                  onClick={handleReturnToStock}
                  disabled={!formData.pesoSobra}
                  className="bg-green-600 text-white py-1 px-3 rounded text-xs hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Package2 className="w-3 h-3 inline mr-1" />
                  Retornar ao Estoque
                </button>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                A sobra será registrada como nova bobina em estoque
              </p>
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clipboard className="w-4 h-4 inline mr-1" />
            {formData.status === 'estoque' && 'Observações do Estoque'}
            {formData.status === 'em-maquina' && 'Observações da Produção'}
            {formData.status === 'sobra' && 'Observações da Sobra'}
            {!['estoque', 'em-maquina', 'sobra'].includes(formData.status) && 'Observações'}
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => onUpdateFormData({ observacoes: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={3}
            placeholder={
              formData.status === 'estoque' 
                ? 'Ex: Bobina nova, boa qualidade, armazenada corretamente...'
                : formData.status === 'em-maquina'
                ? 'Ex: Produção normal, sem problemas, qualidade ok...'
                : formData.status === 'sobra'
                ? 'Ex: Sobra de boa qualidade, aproveitável para pequenos pedidos...'
                : 'Observações sobre a bobina...'
            }
          />
        </div>
      </div>
    </div>
  )
}
