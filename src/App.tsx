import React, { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { DashboardPage, NovaBobinaPage, NovoPedidoPage, PedidosPage } from '@/pages'
import { GestaoMaquinasPage } from '@/pages/GestaoMaquinasPage'

type PageType = 'dashboard' | 'nova-bobina' | 'novo-pedido' | 'pedidos' | 'maquinas'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'nova-bobina':
        return <NovaBobinaPage />
      case 'novo-pedido':
        return <NovoPedidoPage />
      case 'pedidos':
        return <PedidosPage />
      case 'maquinas':
        return <GestaoMaquinasPage />
      case 'dashboard':
      default:
        return <DashboardPage />
    }
  }

  return (
    <MainLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  )
}

export default App