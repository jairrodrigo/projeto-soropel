import React from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { NotificationContainer } from './NotificationContainer'
import { cn } from '@/utils'
import { useUIStore, useDashboardStore } from '@/stores'

interface MainLayoutProps {
  children: React.ReactNode
  currentPage?: string
  onPageChange?: (page: string) => void
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentPage = 'dashboard',
  onPageChange 
}) => {
  const { mobileMenuOpen, sidebarCollapsed } = useUIStore()
  const { refreshData, isLoading } = useDashboardStore()

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <Header onRefresh={refreshData} isLoading={isLoading} />
      
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          'transition-all duration-300 ease-in-out flex-shrink-0',
          'fixed md:relative top-0 left-0 h-screen z-50',
          'md:translate-x-0 md:z-auto',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}>
          <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
        </div>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => useUIStore.getState().toggleMobileMenu()}
          />
        )}

        <main className="flex-1 overflow-y-auto">
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
