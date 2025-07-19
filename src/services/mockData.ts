import type { Machine, Alert, Activity } from '@/types'

export const mockMachines: Machine[] = [
  {
    id: 'maq-1',
    nome: 'Máquina 1',
    status: 'online',
    produto: 'KRAFT 1/2 MIX',
    progresso: 67,
    tempoRestante: '2h 15min',
    observacao: 'BOB-2025-143'
  },
  {
    id: 'maq-2', 
    nome: 'Máquina 2',
    status: 'online',
    produto: 'KRAFT 1/4 MIX',
    progresso: 89,
    tempoRestante: '35min',
    observacao: 'BOB-2025-145'
  },
  {
    id: 'maq-3',
    nome: 'Máquina 3', 
    status: 'offline',
    observacao: 'Manutenção preventiva - Retorno: 16:30'
  },
  {
    id: 'maq-4',
    nome: 'Máquina 4',
    status: 'online',
    produto: 'PAPEL SEMI KRAFT',
    progresso: 23,
    tempoRestante: '4h 20min',
    observacao: 'BOB-2025-147'
  },
  {
    id: 'maq-5',
    nome: 'Máquina 5',
    status: 'maintenance',
    observacao: 'Troca de bobina - Retorno: 5min'
  },
  {
    id: 'maq-6',
    nome: 'Máquina 6',
    status: 'online',
    produto: 'KRAFT REVISTA',
    progresso: 45,
    tempoRestante: '3h 10min',
    observacao: 'BOB-2025-149'
  },
  {
    id: 'maq-7',
    nome: 'Máquina 7',
    status: 'idle',
    observacao: 'Aguardando novo pedido - Disponível'
  },
  {
    id: 'maq-8',
    nome: 'Máquina 8',
    status: 'online',
    produto: 'MIX ESPECIAL',
    progresso: 78,
    tempoRestante: '1h 30min',
    observacao: 'BOB-2025-151'
  },
  {
    id: 'maq-9',
    nome: 'Máquina 9',
    status: 'online',
    produto: 'TOALHA AMERICANA',
    progresso: 94,
    tempoRestante: '25min',
    observacao: 'BOB-2025-152'
  }
]

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'Estoque Baixo - MONO32',
    message: 'Apenas 23% do estoque disponível • Reabastecer em 2 dias',
    timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 min ago
  },
  {
    id: 'alert-2',
    type: 'info',
    title: 'Manutenção Programada - Máquina 7',
    message: 'Agendada para amanhã às 08:00 • Duração estimada: 2h',
    timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1h ago
  },
  {
    id: 'alert-3',
    type: 'error',
    title: 'Prazo Apertado - PED-2025-089',
    message: 'Entrega hoje às 18:00 • Atraso de 2h na produção',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 min ago
  },
  {
    id: 'alert-4',
    type: 'success',
    title: 'Controle de Qualidade - Lote Aprovado',
    message: 'KRAFT 1/4 MIX - Batch #2025-156 • 100% de aprovação',
    timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 min ago
  }
]

export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'completed',
    title: 'Pedido PED-2025-034 finalizado na Máquina 2',
    description: '17:05 - KRAFT 1/4 MIX • 1.975 mil produzidos',
    timestamp: new Date(Date.now() - 7 * 60 * 1000),
    icon: 'check'
  },
  {
    id: 'act-2', 
    type: 'new',
    title: 'Nova bobina BOB-2025-156 registrada',
    description: '16:45 - MIX38 • 180g • Fornecedor: IRANI',
    timestamp: new Date(Date.now() - 27 * 60 * 1000),
    icon: 'plus'
  },
  {
    id: 'act-3',
    type: 'changed',
    title: 'Máquina 5 - Troca de bobina realizada',
    description: '16:30 - BOB-2025-143 → BOB-2025-156',
    timestamp: new Date(Date.now() - 42 * 60 * 1000),
    icon: 'rotate-ccw'
  },
  {
    id: 'act-4',
    type: 'started',
    title: 'Máquina 9 iniciou nova produção',
    description: '16:15 - TOALHA AMERICANA • Linha diferenciada',
    timestamp: new Date(Date.now() - 57 * 60 * 1000),
    icon: 'settings'
  }
]
