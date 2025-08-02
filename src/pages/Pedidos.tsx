import React, { useEffect } from 'react';
import { useGestaoPedidosStore, useUIStore } from '@/stores';
import {
  MetricasCards,
  FiltrosBarra,
  PedidoCard,
  SeparacaoModal,
  DetalhesModal
} from '@/components/gestao-pedidos';

export const PedidosPage: React.FC = () => {
  const {
    pedidos,
    metricas,
    filtros,
    separacaoModal,
    detalhesModal,
    isLoading,
    loadPedidos,
    updateFiltros,
    filtrarPedidos,
    filterByStatus,
    openSeparacaoModal,
    closeSeparacaoModal,
    openDetalhesModal,
    closeDetalhesModal,
    separarProduto,
    separarTodosProdutos,
    finalizarPedido,
  } = useGestaoPedidosStore();

  const { showNotification } = useUIStore();

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  const pedidosFiltrados = filtrarPedidos();

  const handleSeparar = (pedidoId: string, produtoIndex: number) => {
    openSeparacaoModal(pedidoId, produtoIndex);
  };

  const handleConfirmarSeparacao = (quantidade: number) => {
    if (separacaoModal.pedidoId && separacaoModal.produtoIndex !== null) {
      separarProduto(separacaoModal.pedidoId, separacaoModal.produtoIndex, quantidade);
    }
  };

  const handleSepararTodos = (pedidoId: string) => {
    separarTodosProdutos(pedidoId);
    // ✅ Produtos separados - feedback visual já disponível na interface
  };

  const handleFinalizar = (pedidoId: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja finalizar o pedido ${pedidoId}?`);
    if (confirmed) {
      finalizarPedido(pedidoId);
      // ✅ Pedido finalizado - feedback visual já disponível na interface
    }
  };

  const getCurrentPedido = () => {
    if (!separacaoModal.pedidoId) return null;
    return pedidos.find(p => p.id === separacaoModal.pedidoId) || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Pedidos</h1>
        <p className="text-gray-600">Controle de separação e produção</p>
      </div>

      {/* Métricas */}
      <MetricasCards metricas={metricas} onFilterByStatus={filterByStatus} />

      {/* Filtros */}
      <FiltrosBarra filtros={filtros} onUpdateFiltros={updateFiltros} />

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">Nenhum pedido encontrado</p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onSeparar={handleSeparar}
              onVerDetalhes={openDetalhesModal}
              onSepararTodos={handleSepararTodos}
              onFinalizar={handleFinalizar}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <SeparacaoModal
        isOpen={separacaoModal.isOpen}
        pedido={getCurrentPedido()}
        produtoIndex={separacaoModal.produtoIndex}
        onClose={closeSeparacaoModal}
        onConfirm={handleConfirmarSeparacao}
      />

      <DetalhesModal
        isOpen={detalhesModal.isOpen}
        pedido={detalhesModal.pedido}
        onClose={closeDetalhesModal}
      />
    </div>
  );
};