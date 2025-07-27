export interface Produto {
  nome: string;
  pedido: number;
  separado: number;
  estoque: number;
  progresso: number;
  unidade: 'MIL' | 'KG' | 'UND';
}

export interface Pedido {
  id: string;
  cliente: string;
  status: 'aguardando' | 'producao' | 'atrasado' | 'urgente' | 'separado' | 'finalizado';
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa';
  dataEntrega: string;
  quantidadeTotal: number;
  progresso: number;
  tipo: 'timbrado' | 'neutro';
  produtos: Produto[];
  maquinaSugerida: string;
  bobinaDisponivel: string;
  observacoes: string;
}

export interface MetricasPedidos {
  totalPedidos: number;
  emProducao: number;
  aguardando: number;
  atrasados: number;
  urgentes: number;
}

export interface FiltrosPedidos {
  busca: string;
  status: string;
  prioridade: string;
}

export interface SeparacaoModal {
  isOpen: boolean;
  pedidoId: string | null;
  produtoIndex: number | null;
}

export interface DetalhesModal {
  isOpen: boolean;
  pedido: Pedido | null;
}