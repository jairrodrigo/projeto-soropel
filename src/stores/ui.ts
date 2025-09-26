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
        
      showNotification: (_notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = { id, ..._notification }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))
        
        // Auto-remove after duration
        const duration = _notification.duration || 4000
        setTimeout(() => {
          get().removeNotification(id)
        }, duration)
      },
      
      removeNotification: (_id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== _id)
        })),
        
      openModal: (_modal) =>
        set((state) => ({
          modals: { ...state.modals, [_modal]: true }
        })),
        
      closeModal: (_modal) =>
        set((state) => ({
          modals: { ...state.modals, [_modal]: false }
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
