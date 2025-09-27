import React from 'react'
import { Menu, LayoutDashboard, User, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'
import { useUIStore } from '@/stores'
import { formatTime, cn } from '@/utils'

interface HeaderProps {
  onRefresh?: () => void
  isLoading?: boolean
}

export const Header: React.FC<HeaderProps> = ({ 
  onRefresh, 
  isLoading = false 
}) => {
  const { toggleMobileMenu, showNotification } = useUIStore()
  const [currentTime, setCurrentTime] = React.useState(new Date())

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
      showNotification({
        message: '🔄 Atualizando dashboard...',
        type: 'info'
      })
    }
  }

  return (
    <header className="bg-blue-800 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo and title */}
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
            <img 
              src="/logo_soropel.png" 
              alt="Logo Soropel" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">Sistema Soropel</h1>
            <p className="text-blue-200 text-sm">Dashboard - Visão Geral</p>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-blue-700 hover:bg-blue-600 text-white"
          >
            <RefreshCw className={cn(
              'w-4 h-4 mr-2',
              isLoading && 'animate-spin'
            )} />
            <span className="hidden sm:inline">
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </span>
          </Button>

          {/* User info */}
          <div className="hidden sm:flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Operador</span>
          </div>

          {/* Current time */}
          <div className="text-sm text-blue-200">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </header>
  )
}
