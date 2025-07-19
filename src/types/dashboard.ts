// Dashboard Types
export interface DashboardMetrics {
  pedidosAndamento: number;
  bobinaemUso: number;
  maquinasAtivas: {
    ativas: number;
    total: number;
    eficienciaMedia: number;
  };
  sobrasHoje: number;
}

// Production Types
export interface ProductionData {
  metaDiaria: number;
  realizado: number;
  porcentagem: number;
  projecao: number;
  topProdutos: ProductionItem[];
}

export interface ProductionItem {
  nome: string;
  quantidade: number;
}

// Machine Types
export type MachineStatus = 'online' | 'offline' | 'maintenance' | 'idle';

export interface Machine {
  id: string;
  nome: string;
  status: MachineStatus;
  produto?: string;
  progresso?: number;
  tempoRestante?: string;
  observacao?: string;
}

// Alert Types
export type AlertType = 'warning' | 'error' | 'info' | 'success';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: Date;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Activity Types
export interface Activity {
  id: string;
  type: 'completed' | 'started' | 'maintenance' | 'new' | 'changed';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

// User Types
export interface User {
  id: string;
  nome: string;
  role: 'operator' | 'supervisor' | 'admin';
  email: string;
  avatar?: string;
}

// Sidebar Types
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  active?: boolean;
  badge?: number;
}

// Quick Actions Types
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}
