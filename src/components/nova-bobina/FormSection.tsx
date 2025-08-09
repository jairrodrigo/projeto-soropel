import React from 'react'
import { Hash, Calendar, Layers, Ruler, Truck, Weight, Package, Clipboard, Check, FileText } from 'lucide-react'
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
    <div className="bg-white p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-gray-100">
      {/* Header - Mobile Enhanced */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
          <Clipboard className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3 text-purple-600" />
          Dados da Bobina
        </h3>
        <div className="flex items-center space-x-2 lg:space-x-3 bg-gray-50 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full">
          <div className={cn(
            'w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-colors',
            hasExtractedData ? 'bg-green-500' : 'bg-yellow-500'
          )} />
          <span className={cn(
            'text-xs lg:text-sm font-medium',
            hasExtractedData ? 'text-green-700' : 'text-yellow-700'
          )}>
            {hasExtractedData ? 'Dados Extraídos' : 'Aguardando Imagem'}
          </span>
        </div>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {/* Dados Básicos - Mobile Enhanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Código da Bobina */}
          <div className="md:col-span-2 xl:col-span-3">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              <Hash className="w-5 h-5 inline mr-2 text-blue-600" />
              Código da Bobina *
              {hasExtractedData && (
                <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  IA Extraído
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.codigoBobina}
                onChange={(e) => onUpdateFormData({ codigoBobina: e.target.value })}
                placeholder="Ex: 01019640013"
                className={cn(
                  "w-full p-4 text-lg border-2 rounded-xl transition-all outline-none",
                  hasExtractedData 
                    ? "border-green-300 bg-green-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 font-semibold"
                    : "border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                )}
              />
              {hasExtractedData && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
          </div>

          {/* Data de Entrada */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              <Calendar className="w-5 h-5 inline mr-2 text-green-600" />
              Data de Entrada *
              <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Automático
              </span>
            </label>
            <input
              type="date"
              value={formData.dataEntrada}
              onChange={(e) => onUpdateFormData({ dataEntrada: e.target.value })}
              className="w-full p-4 text-lg border-2 border-blue-300 rounded-xl bg-blue-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-semibold text-blue-900 cursor-pointer hover:border-blue-400"
            />
            <p className="text-xs text-blue-600 mt-2 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Data preenchida automaticamente com data atual
            </p>
          </div>

          {/* Largura */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              <Ruler className="w-5 h-5 inline mr-2 text-purple-600" />
              Largura (cm) *
              {hasExtractedData && (
                <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  IA Extraído
                </span>
              )}
            </label>
            {hasExtractedData ? (
              <div className="relative">
                <input
                  type="number"
                  value={formData.largura}
                  onChange={(e) => onUpdateFormData({ largura: e.target.value })}
                  className="w-full p-4 text-lg border-2 border-green-300 rounded-xl bg-green-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none font-semibold"
                  placeholder="Largura extraída pela IA"
                  step="0.1"
                  min="0"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ) : (
              <input
                type="number"
                value={formData.largura}
                onChange={(e) => onUpdateFormData({ largura: e.target.value })}
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                placeholder="Ex: 65.0"
                step="0.1"
                min="0"
              />
            )}
          </div>

          {/* Tipo de Papel */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              <Layers className="w-5 h-5 inline mr-2 text-purple-600" />
              Tipo de Papel *
              {hasExtractedData && (
                <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  IA Extraído
                </span>
              )}
            </label>
            {hasExtractedData ? (
              <div className="relative">
                <input
                  type="text"
                  value={formData.tipoPapel}
                  onChange={(e) => onUpdateFormData({ tipoPapel: e.target.value })}
                  className="w-full p-4 text-lg border-2 border-green-300 rounded-xl bg-green-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none font-semibold"
                  placeholder="Tipo extraído pela IA"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ) : (
              <select
                value={formData.tipoPapel}
                onChange={(e) => onUpdateFormData({ tipoPapel: e.target.value })}
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
              >
                <option value="">Selecione o tipo</option>
                {TIPOS_PAPEL.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            )}
          </div>

          {/* Gramatura */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              <Weight className="w-5 h-5 inline mr-2 text-orange-600" />
              Gramatura (g/m²) *
              {hasExtractedData && (
                <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  IA Extraído
                </span>
              )}
            </label>
            {hasExtractedData ? (
              <div className="relative">
                <input
                  type="text"
                  value={formData.gramatura}
                  onChange={(e) => onUpdateFormData({ gramatura: e.target.value })}
                  className="w-full p-4 text-lg border-2 border-green-300 rounded-xl bg-green-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none font-semibold"
                  placeholder="Gramatura extraída pela IA"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ) : (
              <select
                value={formData.gramatura}
                onChange={(e) => onUpdateFormData({ gramatura: e.target.value })}
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
              >
                <option value="">Selecione a gramatura</option>
                {GRAMATURAS.map(gram => (
                  <option key={gram} value={gram}>{gram} g/m²</option>
                ))}
              </select>
            )}
          </div>

          {/* Fornecedor */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              <Truck className="w-5 h-5 inline mr-2 text-indigo-600" />
              Fornecedor *
              {hasExtractedData && (
                <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  IA Extraído
                </span>
              )}
            </label>
            {hasExtractedData ? (
              <div className="relative">
                <input
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => onUpdateFormData({ fornecedor: e.target.value })}
                  className="w-full p-4 text-lg border-2 border-green-300 rounded-xl bg-green-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none font-semibold"
                  placeholder="Fornecedor extraído pela IA"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ) : (
              <select
                value={formData.fornecedor}
                onChange={(e) => onUpdateFormData({ fornecedor: e.target.value })}
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              >
                <option value="">Selecione o fornecedor</option>
                {FORNECEDORES.map(fornecedor => (
                  <option key={fornecedor} value={fornecedor}>{fornecedor}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Pesos - Enhanced Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Weight className="w-6 h-6 mr-2 text-blue-600" />
            Controle de Peso
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Peso Inicial */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Peso Inicial (kg) *
              </label>
              <input
                type="number"
                value={formData.pesoInicial}
                onChange={(e) => onUpdateFormData({ pesoInicial: Number(e.target.value) })}
                placeholder="Ex: 151"
                min="0"
                step="0.1"
                className="w-full p-4 text-lg border-2 border-blue-300 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            {/* Peso Atual */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Peso Atual (kg) *
              </label>
              <input
                type="number"
                value={formData.pesoAtual}
                onChange={(e) => onUpdateFormData({ pesoAtual: Number(e.target.value) })}
                placeholder="Ex: 151"
                min="0"
                step="0.1"
                className="w-full p-4 text-lg border-2 border-blue-300 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Observações - Enhanced */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            <Package className="w-5 h-5 inline mr-2 text-gray-600" />
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => onUpdateFormData({ observacoes: e.target.value })}
            placeholder="Informações adicionais sobre a bobina..."
            rows={4}
            className="w-full p-4 text-base border-2 border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all outline-none resize-none"
          />
        </div>

        {/* Data Summary - Mobile Friendly */}
        {hasExtractedData && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Dados extraídos automaticamente:
            </h4>
            <div className="text-sm text-green-800 space-y-1">
              <p>• <strong>Código:</strong> {formData.codigoBobina}</p>
              <p>• <strong>Tipo:</strong> {formData.tipoPapel}</p>
              <p>• <strong>Fornecedor:</strong> {formData.fornecedor}</p>
              <p>• <strong>Peso:</strong> {formData.pesoInicial}kg</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
