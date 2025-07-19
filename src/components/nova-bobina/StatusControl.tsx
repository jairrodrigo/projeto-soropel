import React from 'react'
import { Activity, Settings, Package2, Clipboard } from 'lucide-react'
import { cn } from '@/utils'
import type { BobinaFormData, BobinaStatus } from '@/types/nova-bobina'
import { MAQUINAS } from '@/types/nova-bobina'

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
      icon: '📦',
      description: 'Disponível para uso',
      color: 'green'
    },
    {
      value: 'em-maquina' as const,
      label: 'EM MÁQUINA',
      icon: '⚙️',
      description: 'Sendo utilizada',
      color: 'blue'
    },
    {
      value: 'sobra' as const,
      label: 'SOBRA',
      icon: '📏',
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

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Status e Controle da Bobina</h3>
      
      <div className="space-y-6">
        {/* Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Activity className="w-4 h-4 inline mr-1" />
            Status da Bobina
          </label>
          
          <div className="space-y-3">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => onUpdateStatus(option.value)}
                className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{option.icon}</span>
                  <div>
                    <div className="font-medium text-base">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={() => onUpdateStatus(option.value)}
                    className="sr-only"
                  />
                  <div className={cn(
                    'status-switch w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer',
                    formData.status === option.value 
                      ? `bg-${option.color}-500` 
                      : 'bg-gray-300'
                  )}>
                    <div className={cn(
                      'status-switch-knob w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-sm',
                      formData.status === option.value ? 'left-6' : 'left-0.5'
                    )} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campos condicionais para EM MÁQUINA */}
        {formData.status === 'em-maquina' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Settings className="w-4 h-4 inline mr-1" />
                Máquina Atual
              </label>
              <select
                value={formData.maquinaAtual || ''}
                onChange={(e) => onUpdateFormData({ maquinaAtual: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Selecione a máquina...</option>
                {MAQUINAS.map(maquina => (
                  <option key={maquina} value={maquina}>
                    Máquina {maquina}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package2 className="w-4 h-4 inline mr-1" />
                Produto sendo Produzido
              </label>
              <input
                type="text"
                value={formData.produtoProducao || ''}
                onChange={(e) => onUpdateFormData({ produtoProducao: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Ex: KRAFT 1/2 MIX"
              />
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
