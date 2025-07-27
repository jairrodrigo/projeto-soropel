import React from 'react';
import { PackagePlus, Eye, Package, Check } from 'lucide-react';
import { Pedido } from '@/types';
import { formatDate, isAtrasado, getPriorityText } from '@/services/gestaoPedidosData';

interface PedidoCardProps {
  pedido: Pedido;
  onSeparar: (pedidoId: string, produtoIndex: number) => void;
  onVerDetalhes: (pedido: Pedido) => void;
  onSepararTodos: (pedidoId: string) => void;
  onFinalizar: (pedidoId: string) => void;
}

export const PedidoCard: React.FC<PedidoCardProps> = ({
  pedido,
  onSeparar,
  onVerDetalhes,
  onSepararTodos,
  onFinalizar,
}) => {
  const isOrderAtrasado = isAtrasado(pedido.dataEntrega);
  const dataEntregaClass = isOrderAtrasado ? 'text-red-600 font-bold' : 'text-gray-600';

  const getStatusBorderClass = (status: string) => {
    const borders: Record<string, string> = {
      urgente: 'border-l-red-500',
      producao: 'border-l-green-500',
      aguardando: 'border-l-yellow-500',
      separado: 'border-l-blue-500',
      atrasado: 'border-l-red-600',
      finalizado: 'border-l-gray-500',
    };
    return borders[status] || 'border-l-gray-500';
  };

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
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 ${getStatusBorderClass(pedido.status)}`}>
      {/* Cabeçalho do Card */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-gray-900">{pedido.id}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityTagClass(pedido.prioridade)}`}>
              {getPriorityText(pedido.prioridade)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{pedido.quantidadeTotal.toFixed(3)} MIL</p>
            <p className={`text-sm ${dataEntregaClass}`}>
              Entrega: {formatDate(pedido.dataEntrega)}
              {isOrderAtrasado && ' ⚠️'}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-medium text-gray-800">{pedido.cliente}</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">{pedido.progresso}%</span>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${pedido.progresso}%` }}
              />
            </div>
          </div>
        </div>
      </div>      {/* Corpo do Card - Lista de Produtos Mobile */}
      <div className="p-6">
        <div className="space-y-3">
          {pedido.produtos.map((produto, index) => {
            const pendente = produto.pedido - produto.separado;
            const isDisabled = pendente <= 0;

            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                {/* Informações do produto na parte superior */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-1">{produto.nome}</div>
                  <div className="text-xs text-gray-500 mb-3">{produto.unidade}</div>
                  
                  <div className="flex flex-col gap-1 text-xs">
                    <div>
                      <span className="text-gray-500">Pedido:</span>
                      <span className="font-semibold ml-2">{produto.pedido.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Separado:</span>
                      <span className="font-semibold text-blue-600 ml-2">{produto.separado.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pendente:</span>
                      <span className="font-semibold text-orange-600 ml-2">{pendente.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Botão "+ Separar" na parte inferior */}
                <button
                  onClick={() => onSeparar(pedido.id, index)}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    isDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  }`}
                  title="Separar Produto"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>+ Separar</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rodapé do Card */}
      <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onVerDetalhes(pedido)}
            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition flex items-center justify-center gap-2 font-semibold"
          >
            <Eye className="w-4 h-4" />
            Ver Detalhes
          </button>
          <button
            onClick={() => onSepararTodos(pedido.id)}
            disabled={pedido.progresso === 100}
            className={`w-full px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 font-semibold ${
              pedido.progresso === 100
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Separar Todos
          </button>
          <button
            onClick={() => onFinalizar(pedido.id)}
            disabled={pedido.progresso < 100}
            className={`w-full px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 font-semibold ${
              pedido.progresso < 100
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
            }`}
          >
            <Check className="w-4 h-4" />
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};