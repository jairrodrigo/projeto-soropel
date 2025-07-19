import React from 'react'
import { MainLayout } from '@/components/layout'
import { DashboardPage } from '@/pages/Dashboard'
import '@/index.css'

function App() {
  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  )
}

export default App
