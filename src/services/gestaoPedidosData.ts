import { Pedido, MetricasPedidos } from '@/types';

export const mockPedidos: Pedido[] = [
  {
    id: 'OP-1621',
    cliente: 'EMBALSUL LTDA',
    status: 'aguardando',
    prioridade: 'alta',
    dataEntrega: '2025-01-28',
    quantidadeTotal: 20.000,
    progresso: 0,
    tipo: 'timbrado',
    produtos: [
      { nome: 'Saco Mix 1kg', pedido: 12.000, separado: 0, estoque: 15.000, progresso: 0, unidade: 'MIL' },
      { nome: 'Saco Mix 3kg', pedido: 8.000, separado: 0, estoque: 10.000, progresso: 0, unidade: 'MIL' }
    ],
    maquinaSugerida: 'Máquina 3',
    bobinaDisponivel: 'Bobina A2 - 500kg',
    observacoes: 'Cliente preferencial - priorizar entrega'
  },
  {
    id: 'OP-1609',
    cliente: 'PONTO DE BALA',
    status: 'urgente',
    prioridade: 'urgente',
    dataEntrega: '2025-01-26',
    quantidadeTotal: 17.000,
    progresso: 68,
    tipo: 'neutro',
    produtos: [
      { nome: 'Saco Mix 2kg', pedido: 2.000, separado: 1.700, estoque: 5.000, progresso: 85, unidade: 'MIL' },
      { nome: 'Saco Mix 4kg', pedido: 8.000, separado: 5.200, estoque: 12.000, progresso: 65, unidade: 'MIL' },
      { nome: 'Saco Mix 5kg', pedido: 2.000, separado: 1.000, estoque: 3.000, progresso: 50, unidade: 'MIL' },
      { nome: 'Hamburgão - Mono 30gr', pedido: 5.000, separado: 1.500, estoque: 8.000, progresso: 30, unidade: 'MIL' }
    ],
    maquinaSugerida: 'Máquina 9',
    bobinaDisponivel: 'Bobina B1 - 300kg',
    observacoes: 'URGENTE - Cliente ligou cobrando entrega'
  },
  {
    id: 'OP-1540',
    cliente: 'DIL DOCES',
    status: 'producao',
    prioridade: 'alta',
    dataEntrega: '2025-01-29',
    quantidadeTotal: 15.000,
    progresso: 85,
    tipo: 'timbrado',
    produtos: [
      { nome: 'Viagem 2 - Mono 30gr', pedido: 5.000, separado: 4.250, estoque: 6.000, progresso: 85, unidade: 'MIL' },
      { nome: 'Saco Mix 4kg', pedido: 10.000, separado: 8.500, estoque: 12.000, progresso: 85, unidade: 'MIL' }
    ],
    maquinaSugerida: 'Máquina 9',
    bobinaDisponivel: 'Bobina C3 - 400kg',
    observacoes: 'Máquina 9 necessária para setup especial'
  },
  {
    id: 'OP-1622',
    cliente: 'DOCE MANIA',
    status: 'producao',
    prioridade: 'media',
    dataEntrega: '2025-01-30',
    quantidadeTotal: 7.500,
    progresso: 40,
    tipo: 'neutro',
    produtos: [
      { nome: 'Hamburgão - Mono 30gr', pedido: 7.500, separado: 3.000, estoque: 8.000, progresso: 40, unidade: 'MIL' }
    ],
    maquinaSugerida: 'Máquina 5',
    bobinaDisponivel: 'Bobina A1 - 200kg',
    observacoes: 'Produção normal'
  },
  {
    id: 'OP-1623',
    cliente: 'PADARIA CENTRAL',
    status: 'atrasado',
    prioridade: 'alta',
    dataEntrega: '2025-01-25',
    quantidadeTotal: 21.000,
    progresso: 10,
    tipo: 'timbrado',
    produtos: [
      { nome: 'Saco Mix 2kg', pedido: 15.000, separado: 1.500, estoque: 5.000, progresso: 10, unidade: 'MIL' },
      { nome: 'Viagem 2 - Mono 30gr', pedido: 6.000, separado: 600, estoque: 6.000, progresso: 10, unidade: 'MIL' }
    ],
    maquinaSugerida: 'Máquina 7',
    bobinaDisponivel: 'Bobina D2 - 600kg',
    observacoes: 'ATRASADO - Acelerar produção'
  }
];

export const calculateMetricasPedidos = (pedidos: Pedido[]): MetricasPedidos => {
  return {
    totalPedidos: pedidos.length,
    emProducao: pedidos.filter(p => p.status === 'producao').length,
    aguardando: pedidos.filter(p => p.status === 'aguardando').length,
    atrasados: pedidos.filter(p => p.status === 'atrasado').length,
    urgentes: pedidos.filter(p => p.prioridade === 'urgente' || p.status === 'urgente').length,
  };
};

export const getPriorityText = (prioridade: string): string => {
  const texts: Record<string, string> = {
    urgente: 'URGENTE',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa'
  };
  return texts[prioridade] || 'Normal';
};

export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    aguardando: 'Aguardando',
    producao: 'Em Produção',
    atrasado: 'Atrasado',
    urgente: 'Urgente',
    separado: 'Separado',
    finalizado: 'Finalizado'
  };
  return texts[status] || status;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const isAtrasado = (dataEntrega: string): boolean => {
  return new Date(dataEntrega) < new Date() && new Date().getHours() > 0;
};