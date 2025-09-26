import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { 
  DashboardMetrics, 
  ProductionData, 
  Machine, 
  Alert, 
  Activity 
} from '@/types'
import { 
  refreshDashboardData,
  testDashboardConnection
} from '@/services/dashboardService'

interface DashboardState {
  // Data
  metrics: DashboardMetrics
  production: ProductionData
  machines: Machine[]
  alerts: Alert[]
  activities: Activity[]
  
  // UI State
  isLoading: boolean
  lastUpdate: Date | null
  connectionStatus: 'connecting' | 'connected' | 'error'
  
  // Actions
  updateMetrics: (metrics: Partial<DashboardMetrics>) => void
  updateProduction: (production: Partial<ProductionData>) => void
  updateMachines: (machines: Machine[]) => void
  addAlert: (alert: Alert) => void
  removeAlert: (id: string) => void
  addActivity: (activity: Activity) => void
  setLoading: (loading: boolean) => void
  refreshData: () => Promise<void>
  testConnection: () => Promise<boolean>
}

const initialMetrics: DashboardMetrics = {
  pedidosAndamento: 12,
  bobinaemUso: 8,
  maquinasAtivas: {
    ativas: 6,
    total: 9,
    eficienciaMedia: 87
  },
  sobrasHoje: 3
}

const initialProduction: ProductionData = {
  metaDiaria: 15000,
  realizado: 8450,
  porcentagem: 56,
  projecao: 15100,
  topProdutos: [
    { nome: 'KRAFT 1/2 MIX', quantidade: 2890 },
    { nome: 'KRAFT 1/4 MIX', quantidade: 2156 },
    { nome: 'PAPEL SEMI KRAFT', quantidade: 1740 }
  ]
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        metrics: initialMetrics,
        production: initialProduction,
        machines: [],
        alerts: [],
        activities: [],
        isLoading: false,
        lastUpdate: null,
        connectionStatus: 'connecting',
        
        // Actions
        updateMetrics: (newMetrics) =>
          set((state) => ({
            metrics: { ...state.metrics, ...newMetrics },
            lastUpdate: new Date()
          })),
          
        updateProduction: (newProduction) =>
          set((state) => ({
            production: { ...state.production, ...newProduction },
            lastUpdate: new Date()
          })),
          
        updateMachines: (machines) =>
          set({ machines, lastUpdate: new Date() }),
          
        addAlert: (alert) =>
          set((state) => ({
            alerts: [alert, ...state.alerts].slice(0, 10) // Keep only 10 most recent
          })),
          
        removeAlert: (id) =>
          set((state) => ({
            alerts: state.alerts.filter(alert => alert.id !== id)
          })),
          
        addActivity: (activity) =>
          set((state) => ({
            activities: [activity, ...state.activities].slice(0, 20) // Keep only 20 most recent
          })),
          
        setLoading: (loading) => set({ isLoading: loading }),
        
        refreshData: async () => {
          set({ isLoading: true })
          
          try {
            // ✅ Atualizando dados - logs removidos para console limpo
            
            // Buscar todos os dados reais do Supabase
            const dashboardData = await refreshDashboardData()
            
            // Atualizar estado com dados reais
            set({
              metrics: dashboardData.metrics || get().metrics,
              production: dashboardData.production || get().production,
              machines: dashboardData.machines || [],
              alerts: dashboardData.alerts || [],
              activities: dashboardData.activities || [],
              lastUpdate: new Date(),
              connectionStatus: 'connected',
              isLoading: false
            })
            
            // ✅ Dashboard atualizado - logs de debug removidos para console limpo
            
          } catch (error) {
            console.error('❌ Erro ao atualizar dashboard:', error)
            set({ 
              isLoading: false,
              connectionStatus: 'error'
            })
          }
        },
        
        testConnection: async () => {
          try {
            const result = await testDashboardConnection()
            set({ 
              connectionStatus: result.success ? 'connected' : 'error' 
            })
            return result.success
          } catch (error) {
            console.error('❌ Erro ao testar conexão:', error)
            set({ connectionStatus: 'error' })
            return false
          }
        }
      }),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({ 
          metrics: state.metrics, 
          production: state.production 
        })
      }
    ),
    { name: 'dashboard-store' }
  )
)
