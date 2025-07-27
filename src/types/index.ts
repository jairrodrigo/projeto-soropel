export * from './dashboard';
export * from './gestao-pedidos';

// Re-export common types for easy importing
export type { DashboardMetrics, Machine, Alert, Activity, User } from './dashboard';
export type { Pedido, Produto, MetricasPedidos, FiltrosPedidos, SeparacaoModal, DetalhesModal } from './gestao-pedidos';
