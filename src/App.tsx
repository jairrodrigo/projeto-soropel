import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { 
  DashboardPage, 
  NovaBobinaPage, 
  NovoPedidoPage, 
  PedidosPage 
} from '@/pages'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/nova-bobina" element={<NovaBobinaPage />} />
            <Route path="/novo-pedido" element={<NovoPedidoPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
          </Routes>
        </MainLayout>
      </div>
    </Router>
  )
}
