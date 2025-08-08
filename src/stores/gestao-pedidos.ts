import { create } from 'zustand';
import { Pedido, MetricasPedidos, FiltrosPedidos, SeparacaoModal, DetalhesModal } from '@/types';
import { mockPedidos, calculateMetricasPedidos } from '@/services/gestaoPedidosData';
import * as ordersService from '@/services/ordersService';

// 🔄 Funções de conversão entre tipos Supabase e Store - SIMPLIFICADO
const convertSupabaseStatusToStoreStatus = (
  supabaseStatus: ordersService.Order['status']
): Pedido['status'] => {
  // Mapeamento direto para os status reais do banco
  switch (supabaseStatus) {
    case 'pendente': return 'aguardando';
    case 'producao': return 'producao'; 
    case 'finalizado': return 'finalizado';
    case 'entregue': return 'finalizado';
    default: return 'aguardando';
  }
};

// 🔄 Função para converter status do frontend para o banco
const convertStoreStatusToSupabaseStatus = (
  storeStatus: Pedido['status']
): ordersService.Order['status'] => {
  switch (storeStatus) {
    case 'aguardando': return 'pendente';
    case 'producao': return 'producao';
    case 'finalizado': return 'finalizado';
    case 'separado': return 'finalizado'; // separado vira finalizado
    case 'atrasado': return 'pendente'; // atrasado vira pendente
    case 'urgente': return 'pendente'; // urgente vira pendente
    default: return 'pendente';
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
  separarProduto: (pedidoId: string, produtoIndex: number, quantidade: number) => Promise<void>;
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
      
      if (!result.error && result.data) {
        console.log('🔍 STORE DEBUG - Convertendo pedidos do Supabase:', result.data.length)
        
        // Converter dados do Supabase para formato do store
        const pedidosConvertidos = result.data.map((order): Pedido => {
          const produtos = (order.order_items || []).map((item): Produto => ({
            id: item.product?.id || '',
            nome: item.product?.name || 'Produto não encontrado',
            soropelCode: item.product?.soropel_code || 0,
            unidade: 'Sacos',
            pedido: item.quantity || 0,
            separado: item.separated_quantity || 0,
            estoque: item.quantity || 0,
            progresso: item.separated_quantity && item.quantity 
              ? Math.round((item.separated_quantity / item.quantity) * 100) 
              : 0,
            maquina: item.machine?.name || `Máquina ${item.machine?.machine_number || 'N/A'}`,
            observacoes: item.status === 'pendente' ? 'Aguardando separação' : item.status
          }));

          console.log(`🔍 STORE DEBUG - Pedido ${order.order_number}: ${produtos.length} produtos convertidos`)

          return {
            id: order.id,
            numero: order.order_number || `ID-${order.id.slice(0,8)}`,
            cliente: order.clients?.company_name || order.clients?.fantasy_name || 'Cliente não informado',
            status: convertSupabaseStatusToStoreStatus(order.status),
            prioridade: convertSupabasePriorityToStorePriority(order.priority),
            dataEntrega: order.delivery_date || new Date().toISOString().split('T')[0],
            quantidadeTotal: order.total_units || 0,
            progresso: order.progress_percentage || 0,
            tipo: order.tipo || 'neutro',
            produtos: produtos,
            maquinaSugerida: 'A definir',
            bobinaDisponivel: 'Verificar estoque',
            observacoes: order.observations || ''
          }
        });

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
  separarProduto: async (pedidoId, produtoIndex, quantidade) => {
    const state = get()
    const pedido = state.pedidos.find(p => p.id === pedidoId)
    
    if (!pedido || !pedido.produtos[produtoIndex]) {
      console.error('❌ Pedido ou produto não encontrado')
      return
    }

    const produto = pedido.produtos[produtoIndex]
    
    // Encontrar o order_item correspondente no banco
    // Como não temos order_item_id diretamente, vamos buscar pela combinação ordem + produto
    try {
      // Primeiro, vamos buscar o pedido completo do banco para ter os IDs dos order_items
      const orderResult = await ordersService.getOrderByNumber(pedido.numero)
      
      if (orderResult.error || !orderResult.data) {
        console.error('❌ Erro ao buscar pedido do banco:', orderResult.error)
        return
      }

      // Encontrar o order_item que corresponde ao produto sendo separado
      const orderItem = orderResult.data.order_items?.[produtoIndex]
      
      if (!orderItem) {
        console.error('❌ Order item não encontrado para índice:', produtoIndex)
        return
      }

      // Calcular nova quantidade separada
      const novaQuantidadeSeparada = (orderItem.separated_quantity || 0) + quantidade

      // Atualizar no banco
      const updateResult = await ordersService.updateSeparatedQuantity(
        orderItem.id, 
        novaQuantidadeSeparada
      )

      if (updateResult.error) {
        console.error('❌ Erro ao salvar separação no banco:', updateResult.error)
        return
      }

      console.log('✅ Separação salva no banco com sucesso')

      // Atualizar estado local apenas após sucesso no banco
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

    } catch (error) {
      console.error('❌ Erro na separação do produto:', error)
    }
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