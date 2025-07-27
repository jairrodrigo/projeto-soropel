export * from './dashboard';
export * from './gestao-pedidos';
export * from './novo-pedido';

// Re-export common types for easy importing
export type { DashboardMetrics, Machine, Alert, Activity, User } from './dashboard';
export type { Pedido, Produto, MetricasPedidos, FiltrosPedidos, SeparacaoModal, DetalhesModal } from './gestao-pedidos';
export type { PedidoFormData, ProcessedPedidoData, CameraState, FormState } from './novo-pedido';
