import React, { useState, useEffect } from 'react'
import { X, Save, Package, User, Calendar, AlertCircle, Plus, Trash2, Search } from 'lucide-react'
import { Pedido } from '@/types'
import * as ordersService from '@/services/ordersService'
import * as productsService from '@/services/productsService'
import type { Product } from '@/types/supabase'

// 🔄 Função para converter status do frontend para o banco
const convertStoreStatusToSupabase = (
  storeStatus: Pedido['status']
): ordersService.Order['status'] => {
  switch (storeStatus) {
    case 'aguardando': return 'pendente';
    case 'producao': return 'producao';
    case 'finalizado': return 'finalizado';
    case 'separado': return 'finalizado'; // separado vira finalizado
    case 'atrasado': return 'pendente'; // atrasado vira pendente
    case 'urgente': return 'pendente'; // urgente vira pendente
    default: return 'pendente';
  }
};

interface EditablePedido {
  customer_name: string
  priority: 'normal' | 'especial' | 'urgente'
  delivery_date: string
  notes: string
  status: ordersService.Order['status']
}

interface ProductItem {
  id?: string // Para items existentes
  product_id: string
  product_name: string
  quantity: number
  isNew?: boolean // Para identificar novos items
}

interface ModalEditarPedidoProps {
  isOpen: boolean
  pedido: Pedido | null
  onClose: () => void
  onSave: () => void
}

export const ModalEditarPedido: React.FC<ModalEditarPedidoProps> = ({
  isOpen,
  pedido,
  onClose,
  onSave
}) => {
  // Estados do formulário
  const [formData, setFormData] = useState<EditablePedido>({
    customer_name: '',
    priority: 'normal',
    delivery_date: '',
    notes: '',
    status: 'aguardando_producao'
  })

  // Estados dos produtos
  const [productItems, setProductItems] = useState<ProductItem[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Estados de controle
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'products'>('info')

  // Inicializar dados quando o modal abre
  useEffect(() => {
    if (isOpen && pedido) {
      setFormData({
        customer_name: pedido.cliente,
        priority: convertPriorityToService(pedido.prioridade),
        delivery_date: pedido.dataEntrega,
        notes: pedido.observacoes || '',
        status: convertStatusToService(pedido.status)
      })

      // Converter produtos para format editável
      const items: ProductItem[] = pedido.produtos.map((produto, index) => ({
        id: `existing_${index}`, // Placeholder - em produção seria o ID real
        product_id: `product_${index}`, // Placeholder - seria o product_id real
        product_name: produto.nome,
        quantity: produto.pedido
      }))
      setProductItems(items)

      loadAvailableProducts() // Carrega todos os produtos
    }
  }, [isOpen, pedido])

  // Carregar produtos disponíveis (todos os produtos, depois filtrar client-side)
  const loadAvailableProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 LOADING ALL PRODUCTS - Start')
      
      // Carregar TODOS os produtos ativos (igual ao modal de configurar produtos)
      const result = await productsService.getProducts(
        { active: true }, // Apenas produtos ativos
        1, 
        300 // Carregar todos os produtos
      )
      
      console.log('🔍 LOADING ALL PRODUCTS - Result:', result)
      
      if (result.success && result.data && result.data.items) {
        const products = Array.isArray(result.data.items) ? result.data.items : []
        console.log('🔍 LOADING ALL PRODUCTS - Products found:', products.length)
        
        setAvailableProducts(products) // Guardar todos os produtos
        setFilteredProducts(products) // Inicialmente mostrar todos
      } else {
        console.warn('⚠️ No products data:', result)
        setAvailableProducts([])
        setFilteredProducts([])
      }
    } catch (error) {
      console.error('❌ Error loading products:', error)
      setError('Erro ao carregar produtos')
      setAvailableProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Filtrar produtos conforme o usuário digita (client-side igual ao modal de configurar)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(availableProducts) // Mostrar todos se não há busca
      return
    }
    
    // Filtro client-side igual ao modal de configurar produtos
    const filtered = availableProducts.filter(product => 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.soropel_code?.toString().includes(searchTerm) ||
      product.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${product.weight_value}${product.weight_unit}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredProducts(filtered)
  }, [searchTerm, availableProducts])

  // Conversores de tipos
  const convertPriorityToService = (priority: string): 'normal' | 'especial' | 'urgente' => {
    switch (priority) {
      case 'urgente': return 'urgente'
      case 'alta': return 'especial'
      default: return 'normal'
    }
  }

  const convertStatusToService = (status: string): ordersService.Order['status'] => {
    switch (status) {
      case 'producao': return 'em_producao'
      case 'separado': return 'produzido'
      case 'finalizado': return 'entrega_completa'
      default: return 'aguardando_producao'
    }
  }

  // Handlers do formulário
  const handleInputChange = (field: keyof EditablePedido, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handlers dos produtos
  const addProduct = (product: Product) => {
    const newItem: ProductItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: 1000, // Quantidade padrão
      isNew: true
    }
    setProductItems(prev => [...prev, newItem])
  }

  const updateProductQuantity = (index: number, quantity: number) => {
    setProductItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    )
  }

  const removeProduct = (index: number) => {
    setProductItems(prev => prev.filter((_, i) => i !== index))
  }

  // Salvar alterações
  const handleSave = async () => {
    if (!pedido) return

    setSaving(true)
    setError(null)

    try {
      // 1. Atualizar dados principais do pedido
      console.log('🔍 DEBUG - Dados sendo enviados para updateOrder:', {
        pedidoId: pedido.id,
        dadosUpdate: {
          priority: formData.priority,
          delivery_date: formData.delivery_date,
          observations: formData.notes,
          status: convertStoreStatusToSupabase(formData.status)
        }
      })
      
      const updateResult = await ordersService.updateOrder(pedido.id, {
        // client_id: deixar como está, será implementado quando necessário
        priority: formData.priority,
        delivery_date: formData.delivery_date,
        observations: formData.notes, // notes -> observations
        status: convertStoreStatusToSupabase(formData.status) // Converter status
        // Removido customer_name que não existe na tabela
      })

      console.log('🔍 DEBUG - Resultado do updateOrder:', updateResult)

      if (updateResult.error) {
        throw new Error(updateResult.error || 'Erro ao atualizar pedido')
      }

      // 2. Em uma implementação real, atualizaria os order_items aqui
      // Por ora, simular sucesso
      
      onSave() // Recarregar dados na página
      onClose() // Fechar modal
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }
  // Proteção contra renderização sem dados
  if (!isOpen || !pedido) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-xl md:rounded-xl shadow-2xl w-full md:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Editar Pedido</h3>
              <p className="text-sm text-gray-600 mt-1">Código: {pedido.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Informações
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Produtos ({productItems.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o nome do cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Entrega *
                  </label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="especial">Especial</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="aguardando_producao">Aguardando Produção</option>
                    <option value="em_producao">Em Produção</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="produzido">Produzido</option>
                    <option value="entrega_completa">Entrega Completa</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações sobre o pedido..."
                />
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Buscar Produtos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adicionar Produto
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar produtos por nome, código ou peso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {loading && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Lista de produtos disponíveis */}
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Carregando produtos...
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <>
                      {searchTerm && (
                        <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
                          {filteredProducts.length} produto(s) encontrado(s) para "{searchTerm}"
                        </div>
                      )}
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addProduct(product)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">Código: {product.soropel_code}</div>
                        </button>
                      ))}
                    </>
                  ) : searchTerm ? (
                    <div className="p-4 text-center text-gray-500">
                      Nenhum produto encontrado para "{searchTerm}"
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Digite para buscar produtos
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de produtos do pedido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produtos do Pedido
                </label>
                <div className="space-y-3">
                  {productItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.product_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.isNew && <span className="text-green-600 font-medium">NOVO • </span>}
                          Quantidade: {item.quantity.toLocaleString()} unidades
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                        <button
                          onClick={() => removeProduct(index)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {productItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum produto adicionado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-2">
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-3 md:justify-end">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.customer_name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}