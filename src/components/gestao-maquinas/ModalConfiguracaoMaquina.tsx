import React, { useState, useEffect } from 'react'
import { 
  X, 
  Settings, 
  Activity, 
  Clock, 
  Wrench, 
  User, 
  AlertTriangle,
  Package,
  Users,
  Calendar,
  Target,
  Save,
  Play,
  Pause,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/utils'
import machineConfigurationService, { 
  ProductFromDB, 
  OrderForMachine, 
  MachineConfiguration 
} from '@/services/machineConfigurationService'

interface ModalConfiguracaoMaquinaProps {
  isOpen: boolean
  onClose: () => void
  machineId?: number
}

export const ModalConfiguracaoMaquina: React.FC<ModalConfiguracaoMaquinaProps> = ({
  isOpen,
  onClose,
  machineId = 1
}) => {
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dados da configuração
  const [configuration, setConfiguration] = useState<MachineConfiguration | null>(null)
  const [availableProducts, setAvailableProducts] = useState<ProductFromDB[]>([])
  const [ordersForProduct, setOrdersForProduct] = useState<OrderForMachine[]>([])
  
  // Estados da UI
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [newStatus, setNewStatus] = useState<'active' | 'maintenance' | 'stopped' | 'waiting'>('active')
  const [maintenanceReason, setMaintenanceReason] = useState('')
  const [activeTab, setActiveTab] = useState<'product' | 'status' | 'overview'>('product')

  // Carregar dados ao abrir modal
  useEffect(() => {
    if (isOpen && machineId) {
      loadMachineConfiguration()
    }
  }, [isOpen, machineId])

  // Carregar pedidos quando produto é selecionado
  useEffect(() => {
    if (selectedProductId) {
      loadOrdersForProduct(selectedProductId)
    }
  }, [selectedProductId])

  const loadMachineConfiguration = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Carregar configuração da máquina
      const configResult = await machineConfigurationService.getMachineConfiguration(machineId.toString())
      if (!configResult.success) {
        throw new Error(configResult.error)
      }
      
      setConfiguration(configResult.data!)
      setNewStatus(configResult.data!.status)
      setSelectedProductId(configResult.data!.current_product_id || '')
      setSelectedOrders(configResult.data!.assigned_orders.map(o => o.id))

      // Carregar produtos disponíveis
      const productsResult = await machineConfigurationService.getAvailableProducts()
      if (!productsResult.success) {
        throw new Error(productsResult.error)
      }
      
      setAvailableProducts(productsResult.data!)
      
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const loadOrdersForProduct = async (productId: string) => {
    try {
      const result = await machineConfigurationService.getOrdersForProduct(productId)
      if (result.success) {
        setOrdersForProduct(result.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    }
  }

  const handleSaveConfiguration = async () => {
    if (!configuration || !selectedProductId) return
    
    setSaving(true)
    setError(null)
    
    try {
      // Atualizar produto
      const productResult = await machineConfigurationService.updateMachineProduct(
        configuration.machine_id,
        selectedProductId,
        selectedOrders
      )
      
      if (!productResult.success) {
        throw new Error(productResult.error)
      }

      // Atualizar status se mudou
      if (newStatus !== configuration.status) {
        const statusResult = await machineConfigurationService.updateMachineStatus(
          configuration.machine_id,
          newStatus,
          newStatus === 'maintenance' ? maintenanceReason : undefined
        )
        
        if (!statusResult.success) {
          throw new Error(statusResult.error)
        }
      }

      alert('Configuração salva com sucesso!')
      onClose()
      
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setError(error instanceof Error ? error.message : 'Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'maintenance': return 'text-yellow-600 bg-yellow-50'
      case 'stopped': return 'text-red-600 bg-red-50'
      case 'waiting': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-600 bg-red-50 border-red-200'
      case 'especial': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <Settings className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Configuração da Máquina {machineId}</h2>
              <p className="text-blue-100 mt-1">
                {configuration ? `${configuration.current_product?.name || 'Nenhum produto'} - ${configuration.assigned_orders.length} pedidos` : 'Carregando...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            {[
              { id: 'product', label: 'Produto & Pedidos', icon: Package },
              { id: 'status', label: 'Status & Controle', icon: Activity },
              { id: 'overview', label: 'Visão Geral', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Carregando configuração...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={loadMachineConfiguration}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {/* Tab: Produto & Pedidos */}
              {activeTab === 'product' && (
                <div className="space-y-6">
                  {/* Seleção de Produto */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Produto em Produção
                    </label>
                    
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um produto...</option>
                      {availableProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Código: {product.soropel_code}) - {product.category_name}
                        </option>
                      ))}
                    </select>
                    
                    {selectedProductId && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Produto selecionado:</strong> {availableProducts.find(p => p.id === selectedProductId)?.name}
                        </p>
                        <p className="text-sm text-blue-600">
                          Categoria: {availableProducts.find(p => p.id === selectedProductId)?.category_name} | 
                          Tipo: {availableProducts.find(p => p.id === selectedProductId)?.paper_type || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pedidos do Produto */}
                  {selectedProductId && ordersForProduct.length > 0 && (
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Pedidos Disponíveis ({ordersForProduct.length})
                      </label>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {ordersForProduct.map(order => (
                          <div
                            key={order.id}
                            className={cn(
                              'p-4 border-2 rounded-lg cursor-pointer transition-all',
                              selectedOrders.includes(order.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                            onClick={() => toggleOrderSelection(order.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(order.id)}
                                    onChange={() => toggleOrderSelection(order.id)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <h4 className="font-semibold text-gray-900">
                                    Pedido #{order.order_number}
                                  </h4>
                                  <span className={cn(
                                    'px-2 py-1 rounded text-xs font-medium',
                                    getPriorityColor(order.priority)
                                  )}>
                                    {order.priority.toUpperCase()}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p><strong>Cliente:</strong> {order.customer_name}</p>
                                    <p><strong>Quantidade:</strong> {order.quantity.toLocaleString()} unidades</p>
                                  </div>
                                  <div>
                                    <p><strong>Entrega:</strong> {order.delivery_date}</p>
                                    <p className={order.days_until_delivery <= 3 ? 'text-red-600 font-medium' : ''}>
                                      <strong>Prazo:</strong> {order.days_until_delivery} dias
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Pedidos selecionados: {selectedOrders.length}</span>
                          <span>
                            Total: {ordersForProduct
                              .filter(o => selectedOrders.includes(o.id))
                              .reduce((sum, o) => sum + o.quantity, 0)
                              .toLocaleString()} unidades
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProductId && ordersForProduct.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum pedido encontrado para este produto</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Status & Controle */}
              {activeTab === 'status' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Status da Máquina
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'active', label: 'Ativa', icon: Play, colorClass: 'border-green-500 bg-green-50' },
                        { value: 'stopped', label: 'Parada', icon: Pause, colorClass: 'border-red-500 bg-red-50' },
                        { value: 'maintenance', label: 'Manutenção', icon: Wrench, colorClass: 'border-yellow-500 bg-yellow-50' },
                        { value: 'waiting', label: 'Aguardando', icon: Clock, colorClass: 'border-blue-500 bg-blue-50' }
                      ].map(status => (
                        <div
                          key={status.value}
                          onClick={() => setNewStatus(status.value as any)}
                          className={cn(
                            'p-4 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3',
                            newStatus === status.value
                              ? status.colorClass
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <status.icon className="w-6 h-6" />
                          <span className="font-medium">{status.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {newStatus === 'maintenance' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo da Manutenção
                      </label>
                      <textarea
                        value={maintenanceReason}
                        onChange={(e) => setMaintenanceReason(e.target.value)}
                        placeholder="Descreva o motivo da manutenção..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Visão Geral */}
              {activeTab === 'overview' && configuration && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Produto Atual</span>
                      </div>
                      <p className="text-blue-800">{configuration.current_product?.name || 'Nenhum'}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Pedidos Ativos</span>
                      </div>
                      <p className="text-green-800">{configuration.assigned_orders.length}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-900">Meta Produção</span>
                      </div>
                      <p className="text-purple-800">{configuration.production_goal.toLocaleString()}/dia</p>
                    </div>
                  </div>

                  {configuration.assigned_orders.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Pedidos Atribuídos</h3>
                      <div className="space-y-3">
                        {configuration.assigned_orders.map(order => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">#{order.order_number} - {order.customer_name}</p>
                              <p className="text-sm text-gray-600">{order.quantity.toLocaleString()} unidades</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Entrega: {order.delivery_date}</p>
                              <p className={cn(
                                'text-sm font-medium',
                                order.days_until_delivery <= 3 ? 'text-red-600' : 'text-gray-600'
                              )}>
                                {order.days_until_delivery} dias
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {configuration && (
              <>
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveConfiguration}
              disabled={saving || !selectedProductId}
              className={cn(
                'px-6 py-2 rounded-lg transition flex items-center gap-2',
                saving || !selectedProductId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configuração
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalConfiguracaoMaquina
