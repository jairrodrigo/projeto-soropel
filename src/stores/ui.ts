import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  
  // Notifications
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }>
  
  // Modal states
  modals: {
    novaBobina: boolean
    novoPedido: boolean
    configuracoes: boolean
  }
  
  // Actions
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  showNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      notifications: [],
      modals: {
        novaBobina: false,
        novoPedido: false,
        configuracoes: false
      },
      
      // Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
        
      showNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = { id, ...notification }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))
        
        // Auto-remove after duration
        const duration = notification.duration || 4000
        setTimeout(() => {
          get().removeNotification(id)
        }, duration)
      },
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
        
      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true }
        })),
        
      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false }
        })),
        
      closeAllModals: () =>
        set({
          modals: {
            novaBobina: false,
            novoPedido: false,
            configuracoes: false
          }
        })
    }),
    { name: 'ui-store' }
  )
)
