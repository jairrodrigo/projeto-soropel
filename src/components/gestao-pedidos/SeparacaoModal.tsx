import React, { useState, useEffect } from 'react';
import { X, Package, Hash, Plus, Minus } from 'lucide-react';
import { Pedido, Produto } from '@/types';
import { useUIStore } from '@/stores';
import { formatQuantityForPackagesInput, parsePackagesFromInput, formatQuantityAsPackages, formatQuantityForInput, parseQuantityFromInput } from '@/utils';

interface SeparacaoModalProps {
  isOpen: boolean;
  pedido: Pedido | null;
  produtoIndex: number | null;
  onClose: () => void;
  onConfirmSeparar: (quantidade: number) => void;
  onConfirmRetirar: (quantidade: number) => void;
}

export const SeparacaoModal: React.FC<SeparacaoModalProps> = ({
  isOpen,
  pedido,
  produtoIndex,
  onClose,
  onConfirmSeparar,
  onConfirmRetirar,
}) => {
  const [quantidade, setQuantidade] = useState<string>('');
  const [modoOperacao, setModoOperacao] = useState<'separar' | 'retirar'>('separar');
  const [modoUnidade, setModoUnidade] = useState<'pacotes' | 'unidades'>('pacotes');
  const { showNotification } = useUIStore();

  const produto = pedido && produtoIndex !== null ? pedido.produtos[produtoIndex] : null;
  const pendente = produto ? produto.pedido - produto.separado : 0;
  const separado = produto ? produto.separado : 0;
  const maxQuantidade = modoOperacao === 'separar' 
    ? Math.min(pendente, produto?.estoque || 0)
    : separado;

  useEffect(() => {
    if (isOpen) {
      setQuantidade('');
      setModoOperacao('separar'); // Reset para separar por padrão
      setModoUnidade('pacotes'); // Reset para pacotes por padrão
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const qtd = modoUnidade === 'pacotes' 
      ? parsePackagesFromInput(quantidade)
      : parseQuantityFromInput(quantidade);
    
    if (!qtd || qtd <= 0) {
      showNotification({ message: 'Digite uma quantidade válida!', type: 'error' });
      return;
    }
    
    const limite = modoOperacao === 'separar' ? pendente : separado;
    const tipoLimite = modoOperacao === 'separar' ? 'pendente' : 'separado';
    const modo = modoUnidade === 'pacotes' ? 'pacotes' : 'unidades';
    
    if (qtd > limite) {
      showNotification({ 
        message: `Quantidade maior que o ${tipoLimite} em ${modo}!`, 
        type: 'error' 
      });
      return;
    }
    
    // Chamar a função correta baseada no modo de operação
    if (modoOperacao === 'separar') {
      onConfirmSeparar(qtd);
    } else {
      onConfirmRetirar(qtd);
    }
    
    onClose();
  };

  if (!isOpen || !pedido || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full md:max-w-md max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-gray-200 rounded-t-2xl md:rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Gerenciar Produto</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-4 md:p-6 pb-6 md:pb-6">
          <div className="space-y-4 md:space-y-4">
            {/* Toggle de Operação (Separar/Retirar) */}
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Tipo de Operação:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setModoOperacao('separar');
                    setQuantidade('');
                  }}
                  disabled={pendente <= 0}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-3 md:py-2 rounded-lg font-medium text-sm md:text-base transition ${
                    modoOperacao === 'separar'
                      ? 'bg-blue-600 text-white'
                      : pendente <= 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Separar</span>
                  <span className="sm:hidden">+</span>
                </button>
                <button
                  onClick={() => {
                    setModoOperacao('retirar');
                    setQuantidade('');
                  }}
                  disabled={separado <= 0}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-3 md:py-2 rounded-lg font-medium text-sm md:text-base transition ${
                    modoOperacao === 'retirar'
                      ? 'bg-orange-600 text-white'
                      : separado <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span className="hidden sm:inline">Retirar</span>
                  <span className="sm:hidden">-</span>
                </button>
              </div>
            </div>

            {/* Toggle de Unidade (Pacotes/Unidades) */}
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Unidade de Medida:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setModoUnidade('pacotes');
                    setQuantidade('');
                  }}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-3 md:py-2 rounded-lg font-medium text-sm md:text-base transition ${
                    modoUnidade === 'pacotes'
                      ? (modoOperacao === 'separar' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white')
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Pacotes</span>
                </button>
                <button
                  onClick={() => {
                    setModoUnidade('unidades');
                    setQuantidade('');
                  }}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-3 md:py-2 rounded-lg font-medium text-sm md:text-base transition ${
                    modoUnidade === 'unidades'
                      ? (modoOperacao === 'separar' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white')
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span className="hidden sm:inline">Unidades</span>
                  <span className="sm:hidden">Un.</span>
                </button>
              </div>
            </div>
            {/* Informações do Produto */}
            <div className={`p-3 md:p-4 rounded-lg ${modoOperacao === 'separar' ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <h4 className={`font-semibold text-sm md:text-base ${modoOperacao === 'separar' ? 'text-blue-900' : 'text-orange-900'}`}>
                {produto.nome}
              </h4>
              <p className={`text-xs md:text-sm ${modoOperacao === 'separar' ? 'text-blue-700' : 'text-orange-700'} mt-1`}>
                Pedido: {pedido.numero} - {pedido.cliente}
              </p>
              <div className="mt-2 space-y-1">
                {modoOperacao === 'separar' ? (
                  <div className={`text-xs md:text-sm ${modoOperacao === 'separar' ? 'text-blue-600' : 'text-orange-600'}`}>
                    <strong>Pendente:</strong>
                    <div className="mt-1">
                      <span className="text-base md:text-lg font-bold">{formatQuantityAsPackages(pendente)} pacotes</span>
                      <span className="text-xs md:text-sm ml-2">({pendente.toLocaleString('pt-BR')})</span>
                    </div>
                  </div>
                ) : (
                  <div className={`text-xs md:text-sm ${modoOperacao === 'separar' ? 'text-blue-600' : 'text-orange-600'}`}>
                    <strong>Separado:</strong>
                    <div className="mt-1">
                      <span className="text-base md:text-lg font-bold">{formatQuantityAsPackages(separado)} pacotes</span>
                      <span className="text-xs md:text-sm ml-2">({separado.toLocaleString('pt-BR')})</span>
                    </div>
                  </div>
                )}
                {modoUnidade === 'pacotes' && (
                  <p className={`text-xs ${modoOperacao === 'separar' ? 'text-blue-500' : 'text-orange-500'}`}>
                    💡 1 pacote = 500 unidades
                  </p>
                )}
              </div>
            </div>
            
            {/* Campo de Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade a {modoOperacao === 'separar' ? 'Separar' : 'Retirar'} ({modoUnidade}):
              </label>
              <input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                step={modoUnidade === 'pacotes' ? '0.1' : '1'}
                max={modoUnidade === 'pacotes' 
                  ? formatQuantityForPackagesInput(maxQuantidade)
                  : formatQuantityForInput(maxQuantidade)
                }
                className={`w-full px-4 py-4 md:py-3 text-lg md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  modoOperacao === 'separar' 
                    ? 'focus:ring-blue-500' 
                    : 'focus:ring-orange-500'
                }`}
                placeholder={
                  modoUnidade === 'pacotes' 
                    ? "Ex: 4 ou 2.5"
                    : "Ex: 2000 ou 1.5"
                }
              />
              <div className="mt-2 space-y-1">
                {modoUnidade === 'unidades' && (
                  <p className="text-xs text-gray-500">
                    💡 Digite em milhares: 2 = 2000 unidades, 1.5 = 1500 unidades
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {modoUnidade === 'pacotes' ? 'Número de pacotes' : 'Em milhares de unidades'}
                </p>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex flex-col gap-3 pt-2 md:pt-4">
              <button
                onClick={handleConfirm}
                className={`w-full py-4 md:py-3 px-4 rounded-lg transition font-semibold text-base md:text-sm text-white ${
                  modoOperacao === 'separar'
                    ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'
                }`}
              >
                <span className="hidden md:inline">
                  Confirmar {modoOperacao === 'separar' ? 'Separação' : 'Retirada'} em {modoUnidade === 'pacotes' ? 'Pacotes' : 'Unidades'}
                </span>
                <span className="md:hidden">
                  {modoOperacao === 'separar' ? 'Confirmar Separação' : 'Confirmar Retirada'}
                </span>
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-300 text-gray-700 py-4 md:py-3 px-4 rounded-lg hover:bg-gray-400 active:bg-gray-500 transition font-semibold text-base md:text-sm"
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
