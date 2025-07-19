import React from 'react'
import { 
  Home, 
  Camera, 
  PlusCircle, 
  ClipboardList, 
  Cog, 
  Package2, 
  BarChart, 
  Truck, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/utils'
import { useUIStore } from '@/stores'
import type { MenuItem } from '@/types'

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Home', path: '/', active: true },
  { id: 'nova-bobina', label: 'Nova Bobina', icon: 'Camera', path: '/nova-bobina', active: false },
  { id: 'novo-pedido', label: 'Novo Pedido', icon: 'PlusCircle', path: '/novo-pedido', active: false },
  { id: 'pedidos', label: 'Pedidos', icon: 'ClipboardList', path: '/pedidos', active: false },
  { id: 'maquinas', label: 'Máquinas', icon: 'Cog', path: '/maquinas', active: false },
  { id: 'estoque', label: 'Controle de Estoque', icon: 'Package2', path: '/estoque', active: false },
  { id: 'relatorios', label: 'Relatórios', icon: 'BarChart', path: '/relatorios', active: false },
  { id: 'entregas', label: 'Entregas', icon: 'Truck', path: '/entregas', active: false },
  { id: 'configuracoes', label: 'Configurações', icon: 'Settings', path: '/configuracoes', active: false }
]

const iconMap = {
  Home, Camera, PlusCircle, ClipboardList, Cog, Package2, BarChart, Truck, Settings
}

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, showNotification } = useUIStore()

  const handleMenuItemClick = (item: MenuItem) => {
    showNotification({
      message: `📱 Navegando para ${item.label}...`,
      type: 'info'
    })
  }

  return (
    <nav className={cn(
      'sidebar bg-gray-900 text-white transition-all duration-400 ease-in-out relative z-10 flex-shrink-0 h-full',
      sidebarCollapsed ? 'w-[70px] collapsed' : 'w-64'
    )}>
      <div className={cn(
        'sidebar-content h-full relative transition-all duration-400 flex flex-col',
        sidebarCollapsed ? 'w-[70px] p-1' : 'w-64 p-4'
      )}>
        
        {/* Toggle Button - NO TOPO, na linha entre sidebar e página */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 -right-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 z-50"
          title={sidebarCollapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* Menu Items Principal */}
        <div className="flex-1 pt-8">
          <ul className="space-y-0">
            {menuItems.slice(0, -1).map((item) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap]
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className={cn(
                      'sidebar-menu-item w-full flex transition-all duration-300 border-0 bg-transparent cursor-pointer group',
                      sidebarCollapsed 
                        ? 'justify-center items-center p-0 w-[48px] h-[48px] rounded-lg mx-auto min-w-[48px] max-w-[48px]' 
                        : 'justify-start space-x-3 px-3 py-2 hover:translate-x-1 rounded-lg items-center',
                      item.active 
                        ? 'active bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 text-white' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white',
                      !sidebarCollapsed && item.active && 'hover:translate-x-0.5'
                    )}
                    style={sidebarCollapsed ? {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      padding: '0',
                      margin: '0 auto',
                      position: 'relative'
                    } : undefined}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <IconComponent 
                      className={cn(
                        'flex-shrink-0 transition-colors duration-300',
                        'w-5 h-5',
                        item.active ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      )}
                      style={sidebarCollapsed ? {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        margin: '0',
                        padding: '0'
                      } : undefined}
                    />
                    <span className={cn(
                      'sidebar-text transition-opacity duration-200 whitespace-nowrap overflow-hidden',
                      sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    )}>
                      {item.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Configurações separado no final */}
        <div className="pb-4">
          {(() => {
            const configItem = menuItems[menuItems.length - 1]
            const IconComponent = iconMap[configItem.icon as keyof typeof iconMap]
            
            return (
              <button
                onClick={() => handleMenuItemClick(configItem)}
                className={cn(
                  'sidebar-menu-item w-full flex transition-all duration-300 border-0 bg-transparent cursor-pointer group',
                  sidebarCollapsed 
                    ? 'justify-center items-center p-0 w-[48px] h-[48px] rounded-lg mx-auto min-w-[48px] max-w-[48px]' 
                    : 'justify-start space-x-3 px-3 py-2 hover:translate-x-1 rounded-lg items-center',
                  configItem.active 
                    ? 'active bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 text-white' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white',
                  !sidebarCollapsed && configItem.active && 'hover:translate-x-0.5'
                )}
                style={sidebarCollapsed ? {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  padding: '0',
                  margin: '0 auto',
                  position: 'relative'
                } : undefined}
                title={sidebarCollapsed ? configItem.label : undefined}
              >
                <IconComponent 
                  className={cn(
                    'flex-shrink-0 transition-colors duration-300',
                    'w-5 h-5',
                    configItem.active ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  )}
                  style={sidebarCollapsed ? {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    margin: '0',
                    padding: '0'
                  } : undefined}
                />
                <span className={cn(
                  'sidebar-text transition-opacity duration-200 whitespace-nowrap overflow-hidden',
                  sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                )}>
                  {configItem.label}
                </span>
              </button>
            )
          })()}
        </div>
      </div>
    </nav>
  )
}
