// Dados extraídos da ordem de produção
export interface ProcessedPedidoData {
  numeroOrdem: string;
  dataEntrega: string;
  cliente: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    endereco: string;
    cep: string;
    telefone: string;
    email: string;
  };
  produtos: {
    item: number;
    nome: string;
    unidade: 'MIL' | 'KG' | 'UND';
    quantidade: number;
  }[];
  quantidadeTotal: number;
}

// Dados do formulário de pedido
export interface PedidoFormData {
  numeroOrdem: string;
  dataEntrega: string;
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa';
  tipo: 'timbrado' | 'neutro';
  cliente: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    endereco: string;
    cep: string;
    telefone: string;
    email: string;
  };
  produtos: {
    item: number;
    nome: string;
    unidade: 'MIL' | 'KG' | 'UND';
    quantidade: number;
    maquinaSugerida?: string;
  }[];
  observacoes: string;
}

// Estados da câmera
export interface CameraState {
  isActive: boolean;
  isReady: boolean;
  hasImage: boolean;
}

// Estados do formulário
export interface FormState {
  isProcessing: boolean;
  hasExtractedData: boolean;
  currentStep: number;
}

// Dados para mapeamento de máquinas
export const MAQUINAS_DISPONIVEIS = [
  { id: '1', nome: 'Máquina 1', tipo: 'normal' },
  { id: '2', nome: 'Máquina 2', tipo: 'normal' },
  { id: '3', nome: 'Máquina 3', tipo: 'normal' },
  { id: '4', nome: 'Máquina 4', tipo: 'normal' },
  { id: '5', nome: 'Máquina 5', tipo: 'normal' },
  { id: '6', nome: 'Máquina 6', tipo: 'normal' },
  { id: '7', nome: 'Máquina 7', tipo: 'normal' },
  { id: '8', nome: 'Máquina 8', tipo: 'normal' },
  { id: '9', nome: 'Máquina 9', tipo: 'especial' }
];

// Produtos conhecidos do sistema Soropel
export const PRODUTOS_SOROPEL = [
  'Saco Mix 1kg',
  'Saco Mix 2kg', 
  'Saco Mix 3kg',
  'Saco Mix 4kg',
  'Saco Mix 5kg',
  'Hamburgão - Mono 30gr',
  'Viagem 2 - Mono 30gr',
  'KRAFT 1/2 MIX',
  'KRAFT 1/4 MIX',
  'PAPEL SEMI KRAFT'
];

// Tipos de prioridade
export const PRIORIDADES = [
  { value: 'urgente', label: 'Urgente', color: 'bg-red-600' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-600' },
  { value: 'media', label: 'Média', color: 'bg-yellow-600' },
  { value: 'baixa', label: 'Baixa', color: 'bg-blue-600' }
] as const;