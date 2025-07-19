import React from 'react'
import { Hash, Calendar, Layers, Ruler, Truck, Weight, Package } from 'lucide-react'
import { cn } from '@/utils'
import type { BobinaFormData, FormState } from '@/types/nova-bobina'
import { TIPOS_PAPEL, FORNECEDORES, GRAMATURAS } from '@/types/nova-bobina'

interface FormSectionProps {
  formData: BobinaFormData
  formState: FormState
  onUpdateFormData: (updates: Partial<BobinaFormData>) => void
}

export const FormSection: React.FC<FormSectionProps> = ({
  formData,
  formState,
  onUpdateFormData
}) => {
  const { hasExtractedData } = formState

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Dados da Bobina</h3>
        <div className="flex items-center space-x-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            hasExtractedData ? 'bg-green-500' : 'bg-yellow-500'
          )} />
          <span className={cn(
            'text-sm',
            hasExtractedData ? 'text-green-600' : 'text-yellow-600'
          )}>
            {hasExtractedData ? 'Dados Extraídos' : 'Aguardando Imagem'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Dados Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Código da Bobina
            </label>
            <input
              type="text"
              value={formData.codigoBobina}
              onChange={(e) => onUpdateFormData({ codigoBobina: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="Será extraído automaticamente"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data de Entrada
            </label>
            <input
              type="date"
              value={formData.dataEntrada}
              onChange={(e) => onUpdateFormData({ dataEntrada: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Tipo, Gramatura e Fornecedor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Layers className="w-4 h-4 inline mr-1" />
              Tipo de Papel
            </label>
            <input
              type="text"
              value={formData.tipoPapel}
              onChange={(e) => onUpdateFormData({ tipoPapel: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Digite ou selecione..."
              list="tipos-papel-list"
              autoComplete="off"
            />
            <datalist id="tipos-papel-list">
              {TIPOS_PAPEL.map(tipo => (
                <option key={tipo} value={tipo} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4 inline mr-1" />
              Gramatura (g/m²)
            </label>
            <input
              type="text"
              value={formData.gramatura}
              onChange={(e) => onUpdateFormData({ gramatura: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Ex: 45, 52, 65..."
              list="gramaturas-list"
              autoComplete="off"
            />
            <datalist id="gramaturas-list">
              {GRAMATURAS.map(gramatura => (
                <option key={gramatura} value={gramatura} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Truck className="w-4 h-4 inline mr-1" />
              Fornecedor
            </label>
            <input
              type="text"
              value={formData.fornecedor}
              onChange={(e) => onUpdateFormData({ fornecedor: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Digite ou selecione..."
              list="fornecedores-list"
              autoComplete="off"
            />
            <datalist id="fornecedores-list">
              {FORNECEDORES.map(fornecedor => (
                <option key={fornecedor} value={fornecedor} />
              ))}
            </datalist>
          </div>
        </div>
        {/* Peso Inicial e Atual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Weight className="w-4 h-4 inline mr-1" />
              Peso Inicial (kg)
            </label>
            <input
              type="number"
              value={formData.pesoInicial || ''}
              onChange={(e) => onUpdateFormData({ pesoInicial: Number(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="180"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Peso Atual (kg)
            </label>
            <input
              type="number"
              value={formData.pesoAtual || ''}
              onChange={(e) => onUpdateFormData({ pesoAtual: Number(e.target.value) })}
              className={cn(
                'w-full p-3 border border-gray-300 rounded-lg',
                formData.status === 'estoque' && 'bg-gray-50'
              )}
              placeholder="Será atualizado automaticamente"
              min="0"
              step="0.1"
              readOnly={formData.status === 'estoque'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
