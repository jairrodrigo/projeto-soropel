import React from 'react';
import { X } from 'lucide-react';
import { Pedido } from '@/types';
import { formatDate, getPriorityText, getStatusText } from '@/services/gestaoPedidosData';
import { formatQuantity } from '@/utils';

interface DetalhesModalProps {
  isOpen: boolean;
  pedido: Pedido | null;
  onClose: () => void;
}

export const DetalhesModal: React.FC<DetalhesModalProps> = ({
  isOpen,
  pedido,
  onClose,
}) => {
  if (!isOpen || !pedido) {
    return null;
  }

  const getPriorityTagClass = (prioridade: string) => {
    const classes: Record<string, string> = {
      urgente: 'bg-red-100 text-red-800 border-red-200',
      alta: 'bg-orange-100 text-orange-800 border-orange-200',
      media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      baixa: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return classes[prioridade] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-xl md:rounded-xl shadow-2xl w-full md:max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Detalhes - {pedido.id}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Informações do Pedido</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Código:</strong> {pedido.numero}</p>
                <p><strong>Cliente:</strong> {pedido.cliente}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getPriorityTagClass(pedido.prioridade)}`}>
                    {getStatusText(pedido.status)}
                  </span>
                </p>
                <p>
                  <strong>Prioridade:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getPriorityTagClass(pedido.prioridade)}`}>
                    {getPriorityText(pedido.prioridade)}
                  </span>
                </p>
                <p><strong>Data de Entrega:</strong> {formatDate(pedido.dataEntrega)}</p>
                <p><strong>Tipo:</strong> {pedido.tipo}</p>
                <p><strong>Progresso:</strong> {pedido.progresso}%</p>
                <p><strong>Quantidade Total:</strong> {formatQuantity(pedido.quantidadeTotal)} Sacos</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">Recursos Sugeridos</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Máquina Sugerida:</strong> {pedido.maquinaSugerida}</p>
                <p><strong>Bobina Disponível:</strong> {pedido.bobinaDisponivel}</p>
                <p><strong>Observações:</strong> {pedido.observacoes}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Histórico de Separação</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Produto</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Pedido</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Separado</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Pendente</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">% Completo</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.produtos.map((produto, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-sm">{produto.nome}</td>
                      <td className="px-4 py-2 text-center text-sm">{formatQuantity(produto.pedido)}</td>
                      <td className="px-4 py-2 text-center text-sm font-medium text-blue-600">
                        {formatQuantity(produto.separado)}
                      </td>
                      <td className="px-4 py-2 text-center text-sm font-medium text-orange-600">
                        {formatQuantity(produto.pedido - produto.separado)}
                      </td>
                      <td className="px-4 py-2 text-center text-sm font-medium">
                        {Math.round((produto.separado / produto.pedido) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};