import React from 'react';
import { Building2, User, MapPin, Phone, Mail, Package } from 'lucide-react';
import { PedidoFormData } from '@/types/novo-pedido';
import { PRIORIDADES, MAQUINAS_DISPONIVEIS } from '@/types/novo-pedido';

interface FormSectionProps {
  formData: PedidoFormData;
  onUpdateFormData: (updates: Partial<PedidoFormData>) => void;
  hasExtractedData: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  formData,
  onUpdateFormData,
  hasExtractedData
}) => {
  const updateCliente = (field: keyof PedidoFormData['cliente'], value: string) => {
    onUpdateFormData({
      cliente: {
        ...formData.cliente,
        [field]: value
      }
    });
  };

  const updateProduto = (index: number, field: string, value: any) => {
    const produtos = [...formData.produtos];
    produtos[index] = { ...produtos[index], [field]: value };
    onUpdateFormData({ produtos });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Dados da Ordem de Produção
      </h3>

      {/* Informações Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número da Ordem
          </label>
          <input
            type="text"
            value={formData.numeroOrdem}
            onChange={(e) => onUpdateFormData({ numeroOrdem: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="OP-XXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Entrega
          </label>
          <input
            type="date"
            value={formData.dataEntrega}
            onChange={(e) => onUpdateFormData({ dataEntrega: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioridade
          </label>
          <select
            value={formData.prioridade}
            onChange={(e) => onUpdateFormData({ prioridade: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {PRIORIDADES.map((prioridade) => (
              <option key={prioridade.value} value={prioridade.value}>
                {prioridade.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-semibold text-gray-900">Dados do Cliente</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razão Social
            </label>
            <input
              type="text"
              value={formData.cliente.razaoSocial}
              onChange={(e) => updateCliente('razaoSocial', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome completo da empresa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Fantasia
            </label>
            <input
              type="text"
              value={formData.cliente.nomeFantasia}
              onChange={(e) => updateCliente('nomeFantasia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome comercial"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ
            </label>
            <input
              type="text"
              value={formData.cliente.cnpj}
              onChange={(e) => updateCliente('cnpj', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CEP
            </label>
            <input
              type="text"
              value={formData.cliente.cep}
              onChange={(e) => updateCliente('cep', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00000-000"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <input
              type="text"
              value={formData.cliente.endereco}
              onChange={(e) => updateCliente('endereco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rua, número, bairro - cidade"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={formData.cliente.telefone}
              onChange={(e) => updateCliente('telefone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={formData.cliente.email}
              onChange={(e) => updateCliente('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="contato@empresa.com"
            />
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-semibold text-gray-900">Produtos</h4>
        </div>

        {formData.produtos.length > 0 ? (
          <div className="space-y-4">
            {formData.produtos.map((produto, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      value={produto.nome}
                      onChange={(e) => updateProduto(index, 'nome', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={produto.quantidade}
                      onChange={(e) => updateProduto(index, 'quantidade', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidade
                    </label>
                    <select
                      value={produto.unidade}
                      onChange={(e) => updateProduto(index, 'unidade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="MIL">MIL</option>
                      <option value="KG">KG</option>
                      <option value="UND">UND</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máquina Sugerida
                    </label>
                    <select
                      value={produto.maquinaSugerida || ''}
                      onChange={(e) => updateProduto(index, 'maquinaSugerida', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecionar máquina</option>
                      {MAQUINAS_DISPONIVEIS.map((maquina) => (
                        <option key={maquina.id} value={maquina.nome}>
                          {maquina.nome} {maquina.tipo === 'especial' && '(Especial)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>Nenhum produto adicionado</p>
            <p className="text-sm">Capture uma ordem para extrair os produtos automaticamente</p>
          </div>
        )}
      </div>

      {/* Observações */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações
        </label>
        <textarea
          value={formData.observacoes}
          onChange={(e) => onUpdateFormData({ observacoes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Observações adicionais sobre o pedido..."
        />
      </div>

      {hasExtractedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            ✅ Dados extraídos automaticamente da ordem de produção. 
            Revise as informações antes de salvar.
          </p>
        </div>
      )}
    </div>
  );
};