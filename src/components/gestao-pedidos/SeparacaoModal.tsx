import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Pedido, Produto } from '@/types';
import { useUIStore } from '@/stores';
import { formatQuantityForInput, parseQuantityFromInput, formatQuantity } from '@/utils';

interface SeparacaoModalProps {
  isOpen: boolean;
  pedido: Pedido | null;
  produtoIndex: number | null;
  onClose: () => void;
  onConfirm: (quantidade: number) => void;
}

export const SeparacaoModal: React.FC<SeparacaoModalProps> = ({
  isOpen,
  pedido,
  produtoIndex,
  onClose,
  onConfirm,
}) => {
  const [quantidade, setQuantidade] = useState<string>('');
  const { showNotification } = useUIStore();

  const produto = pedido && produtoIndex !== null ? pedido.produtos[produtoIndex] : null;
  const pendente = produto ? produto.pedido - produto.separado : 0;
  const maxQuantidade = produto ? Math.min(pendente, produto.estoque) : 0;

  useEffect(() => {
    if (isOpen) {
      setQuantidade('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const qtd = parseQuantityFromInput(quantidade);
    
    if (!qtd || qtd <= 0) {
      showNotification({ message: 'Digite uma quantidade válida!', type: 'error' });
      return;
    }
    
    if (qtd > pendente) {
      showNotification({ message: 'Quantidade maior que o pendente!', type: 'error' });
      return;
    }
    
    if (produto && qtd > produto.estoque) {
      showNotification({ message: 'Quantidade maior que o estoque disponível!', type: 'error' });
      return;
    }
    
    onConfirm(qtd);
    onClose();
    // ✅ Produto separado - feedback visual já disponível no modal
  };

  if (!isOpen || !pedido || !produto) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-xl md:rounded-xl shadow-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Separar Produto</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 text-base">{produto.nome}</h4>
              <p className="text-sm text-blue-700">Pedido: {pedido.numero} - {pedido.cliente}</p>
              <p className="text-sm text-blue-600">
                Pendente: {formatQuantity(pendente)}
              </p>
            </div>
            
            <div>
              <input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                step="0.5"
                max={formatQuantityForInput(maxQuantidade)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 2,5 ou 8 (em milhares)"
              />
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleConfirm}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Confirmar Separação
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};