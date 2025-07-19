import React from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { NotificationContainer } from './NotificationContainer'
import { cn } from '@/utils'
import { useUIStore, useDashboardStore } from '@/stores'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { mobileMenuOpen, sidebarCollapsed } = useUIStore()
  const { refreshData, isLoading } = useDashboardStore()

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <Header onRefresh={refreshData} isLoading={isLoading} />
      
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          'fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ease-in-out',
          'md:relative md:translate-x-0 md:z-auto',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}>
          <Sidebar />
        </div>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => useUIStore.getState().toggleMobileMenu()}
          />
        )}

        <main className="flex-1 overflow-y-auto" style={{
          marginLeft: sidebarCollapsed ? '70px' : '256px',
          transition: 'margin-left 0.3s ease'
        }}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  )
}
