import React, { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { DashboardPage, NovaBobinaPage } from '@/pages'
import '@/index.css'

type PageType = 'dashboard' | 'nova-bobina'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'nova-bobina':
        return <NovaBobinaPage />
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
