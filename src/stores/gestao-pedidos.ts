import { create } from 'zustand';
import { Pedido, MetricasPedidos, FiltrosPedidos, SeparacaoModal, DetalhesModal } from '@/types';
import { mockPedidos, calculateMetricasPedidos } from '@/services/gestaoPedidosData';
import * as ordersService from '@/services/ordersService';

// 🔄 Funções de conversão entre tipos Supabase e Store
const convertSupabaseStatusToStoreStatus = (
  supabaseStatus: ordersService.Order['status']
): Pedido['status'] => {
  switch (supabaseStatus) {
    case 'aguardando_producao': return 'aguardando';
    case 'em_producao': return 'producao';
    case 'em_andamento': return 'producao';
    case 'produzido': return 'separado';
    case 'separado_parcial': return 'separado';
    case 'liberado_completo': return 'finalizado';
    case 'entrega_completa': return 'finalizado';
    case 'cancelado': return 'finalizado';
    default: return 'aguardando';
  }
};

const convertSupabasePriorityToStorePriority = (
  supabasePriority: ordersService.Order['priority']
): Pedido['prioridade'] => {
  switch (supabasePriority) {
    case 'urgente': return 'urgente';
    case 'especial': return 'alta';
    case 'normal': return 'media';
    default: return 'media';
  }
};

interface GestaoPedidosState {
  // Data
  pedidos: Pedido[];
  metricas: MetricasPedidos;
  
  // Filtros
  filtros: FiltrosPedidos;
  
  // Modals
  separacaoModal: SeparacaoModal;
  detalhesModal: DetalhesModal;
  editarModal: {
    isOpen: boolean;
    pedido: Pedido | null;
  };
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  loadPedidos: () => Promise<void>;
  updateFiltros: (filtros: Partial<FiltrosPedidos>) => void;
  filtrarPedidos: () => Pedido[];
  
  // Modal actions
  openSeparacaoModal: (pedidoId: string, produtoIndex: number) => void;
  closeSeparacaoModal: () => void;
  openDetalhesModal: (pedido: Pedido) => void;
  closeDetalhesModal: () => void;
  openEditarModal: (pedido: Pedido) => void;
  closeEditarModal: () => void;
  
  // Pedido actions
  separarProduto: (pedidoId: string, produtoIndex: number, quantidade: number) => void;
  separarTodosProdutos: (pedidoId: string) => void;
  finalizarPedido: (pedidoId: string) => void;
  filterByStatus: (status: string) => void;
}

export const useGestaoPedidosStore = create<GestaoPedidosState>((set, get) => ({
  // Initial state
  pedidos: [],
  metricas: {
    totalPedidos: 0,
    emProducao: 0,
    aguardando: 0,
    atrasados: 0,
    urgentes: 0,
  },
  filtros: {
    busca: '',
    status: '',
    prioridade: '',
  },
  separacaoModal: {
    isOpen: false,
    pedidoId: null,
    produtoIndex: null,
  },
  detalhesModal: {
    isOpen: false,
    pedido: null,
  },
  editarModal: {
    isOpen: false,
    pedido: null,
  },
  isLoading: false,

  // Actions
  loadPedidos: async () => {
    set({ isLoading: true });
    try {
      // Buscar pedidos reais do Supabase
      const result = await ordersService.getOrders();
      
      if (result.success && result.data) {
        // Converter dados do Supabase para formato do store
        const pedidosConvertidos = result.data.map((order): Pedido => ({
          id: order.order_number || order.id,
          cliente: order.customer_name || 'Cliente não informado',
          status: convertSupabaseStatusToStoreStatus(order.status),
          prioridade: convertSupabasePriorityToStorePriority(order.priority),
          dataEntrega: order.delivery_date || new Date().toISOString().split('T')[0],
          quantidadeTotal: order.total_quantity || 0,
          progresso: 0, // TODO: calcular baseado nos order_items
          tipo: order.tipo || 'neutro',
          produtos: [], // TODO: buscar order_items separadamente
          maquinaSugerida: 'A definir',
          bobinaDisponivel: 'Verificar estoque',
          observacoes: order.notes || ''
        }));

        set({
          pedidos: pedidosConvertidos,
          metricas: calculateMetricasPedidos(pedidosConvertidos),
          isLoading: false,
        });
      } else {
        console.warn('Falha ao carregar pedidos, usando dados simulados:', result.error);
        // Fallback para dados simulados
        set({
          pedidos: mockPedidos,
          metricas: calculateMetricasPedidos(mockPedidos),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      // Fallback para dados simulados
      set({
        pedidos: mockPedidos,
        metricas: calculateMetricasPedidos(mockPedidos),
        isLoading: false,
      });
    }
  },

  updateFiltros: (novosFiltros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...novosFiltros }
    }));
  },

  filtrarPedidos: () => {
    const { pedidos, filtros } = get();
    
    return pedidos.filter(pedido => {
      const matchBusca = !filtros.busca || 
        pedido.id.toLowerCase().includes(filtros.busca.toLowerCase()) || 
        pedido.cliente.toLowerCase().includes(filtros.busca.toLowerCase());
      
      const matchStatus = !filtros.status || pedido.status === filtros.status;
      const matchPrioridade = !filtros.prioridade || pedido.prioridade === filtros.prioridade;

      return matchBusca && matchStatus && matchPrioridade;
    });
  },

  filterByStatus: (status) => {
    set((state) => ({
      filtros: { 
        ...state.filtros, 
        status: status === 'todos' ? '' : status 
      }
    }));
  },

  // Modal actions
  openSeparacaoModal: (pedidoId, produtoIndex) => {
    set({
      separacaoModal: {
        isOpen: true,
        pedidoId,
        produtoIndex,
      }
    });
  },

  closeSeparacaoModal: () => {
    set({
      separacaoModal: {
        isOpen: false,
        pedidoId: null,
        produtoIndex: null,
      }
    });
  },

  openDetalhesModal: (pedido) => {
    set({
      detalhesModal: {
        isOpen: true,
        pedido,
      }
    });
  },

  closeDetalhesModal: () => {
    set({
      detalhesModal: {
        isOpen: false,
        pedido: null,
      }
    });
  },

  openEditarModal: (pedido) => {
    set({
      editarModal: {
        isOpen: true,
        pedido,
      }
    });
  },

  closeEditarModal: () => {
    set({
      editarModal: {
        isOpen: false,
        pedido: null,
      }
    });
  },

  // Pedido actions
  separarProduto: (pedidoId, produtoIndex, quantidade) => {
    set((state) => {
      const novosPedidos = state.pedidos.map(pedido => {
        if (pedido.id === pedidoId) {
          const novosProdutos = [...pedido.produtos];
          const produto = novosProdutos[produtoIndex];
          
          // Update produto
          produto.separado += quantidade;
          produto.estoque -= quantidade;
          produto.progresso = Math.round((produto.separado / produto.pedido) * 100);
          
          // Update pedido progress
          const totalSeparado = novosProdutos.reduce((sum, p) => sum + p.separado, 0);
          const novoProgresso = Math.round((totalSeparado / pedido.quantidadeTotal) * 100);
          
          return {
            ...pedido,
            produtos: novosProdutos,
            progresso: novoProgresso
          };
        }
        return pedido;
      });
      
      return {
        pedidos: novosPedidos,
        metricas: calculateMetricasPedidos(novosPedidos),
      };
    });
  },

  separarTodosProdutos: (pedidoId) => {
    set((state) => {
      const novosPedidos = state.pedidos.map(pedido => {
        if (pedido.id === pedidoId) {
          const novosProdutos = pedido.produtos.map(produto => {
            const pendente = produto.pedido - produto.separado;
            const disponivel = Math.min(pendente, produto.estoque);
            
            return {
              ...produto,
              separado: produto.separado + disponivel,
              estoque: produto.estoque - disponivel,
              progresso: 100
            };
          });
          
          return {
            ...pedido,
            produtos: novosProdutos,
            progresso: 100
          };
        }
        return pedido;
      });
      
      return {
        pedidos: novosPedidos,
        metricas: calculateMetricasPedidos(novosPedidos),
      };
    });
  },

  finalizarPedido: (pedidoId) => {
    set((state) => {
      const novosPedidos = state.pedidos.map(pedido => 
        pedido.id === pedidoId 
          ? { ...pedido, status: 'finalizado' as const }
          : pedido
      );
      
      return {
        pedidos: novosPedidos,
        metricas: calculateMetricasPedidos(novosPedidos),
      };
    });
  },
}));