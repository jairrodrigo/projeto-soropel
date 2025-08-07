import React, { useState, useEffect } from 'react'
import { X, Settings, Plus, Trash2, Tag, Search, Package, AlertCircle, Save, RefreshCw } from 'lucide-react'
import * as productsService from '@/services/productsService'
import * as machineProductsService from '@/services/machineProductsService'
import type { Product } from '@/types/supabase'

interface MachineConfig {
  id: number
  uuid: string // UUID real da máquina no Supabase
  name: string
  type: 'no-print' | 'with-print' | 'special'
  assignedProducts: Product[]
  color: string
  category: string
}

interface ModalConfigurarProdutosProps {
  isOpen: boolean
  onClose: () => void
}

export const ModalConfigurarProdutos: React.FC<ModalConfigurarProdutosProps> = ({
  isOpen,
  onClose
}) => {
  // Estados
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null)
  
  // Configurações das máquinas com UUIDs reais do Supabase
  const [machineConfigs, setMachineConfigs] = useState<MachineConfig[]>([
    {
      id: 1,
      uuid: '5087712b-4725-4780-9b70-d4f50c4b6e20',
      name: 'MÁQUINA 1',
      type: 'no-print',
      assignedProducts: [],
      color: 'border-green-500 bg-gradient-to-br from-white to-green-50',
      category: 'SEM IMPRESSÃO'
    },
    {
      id: 2,
      uuid: '32a242e8-6f72-4cad-b213-8f27f4d69969',
      name: 'MÁQUINA 2',
      type: 'no-print',
      assignedProducts: [],
      color: 'border-green-500 bg-gradient-to-br from-white to-green-50',
      category: 'SEM IMPRESSÃO'
    },
    {
      id: 3,
      uuid: 'f4301074-d6a5-4bde-8a19-9fbb9a662a9a',
      name: 'MÁQUINA 3',
      type: 'no-print',
      assignedProducts: [],
      color: 'border-green-500 bg-gradient-to-br from-white to-green-50',
      category: 'SEM IMPRESSÃO'
    },
    {
      id: 4,
      uuid: 'b96cf059-a80d-4838-9a11-5738c021669b',
      name: 'MÁQUINA 4',
      type: 'no-print',
      assignedProducts: [],
      color: 'border-green-500 bg-gradient-to-br from-white to-green-50',
      category: 'SEM IMPRESSÃO'
    },
    {
      id: 5,
      uuid: '96f1edec-82a8-409e-ae5e-a621c63e8934',
      name: 'MÁQUINA 5',
      type: 'no-print',
      assignedProducts: [],
      color: 'border-green-500 bg-gradient-to-br from-white to-green-50',
      category: 'SEM IMPRESSÃO'
    },
    {
      id: 6,
      uuid: '92774af0-b764-49ff-bdee-d89fdc54671e',
      name: 'MÁQUINA 6',
      type: 'with-print',
      assignedProducts: [],
      color: 'border-blue-500 bg-gradient-to-br from-white to-blue-50',
      category: 'COM IMPRESSÃO'
    },
    {
      id: 7,
      uuid: 'bf97bda8-3b7f-484e-ab43-6cc54f9a8e10',
      name: 'MÁQUINA 7',
      type: 'with-print',
      assignedProducts: [],
      color: 'border-blue-500 bg-gradient-to-br from-white to-blue-50',
      category: 'COM IMPRESSÃO'
    },
    {
      id: 8,
      uuid: '6515d2a3-9888-440d-b0ad-808d993c842b',
      name: 'MÁQUINA 8',
      type: 'with-print',
      assignedProducts: [],
      color: 'border-blue-500 bg-gradient-to-br from-white to-blue-50',
      category: 'COM IMPRESSÃO'
    },
    {
      id: 9,
      uuid: '944d4295-f032-4866-a4bb-94a4ae3a68ca',
      name: 'MÁQUINA 9 ESPECIAL',
      type: 'special',
      assignedProducts: [],
      color: 'border-purple-500 bg-gradient-to-br from-white to-purple-50',
      category: 'ESPECIAL'
    }
  ])

  // 🔄 Carregar produtos do Supabase
  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    
    // 🧪 DEBUG TEMPORÁRIO
    console.log('🔍 DEBUG MODAL - Iniciando carregamento de produtos...')
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('VITE_ENABLE_SUPABASE:', import.meta.env.VITE_ENABLE_SUPABASE)
    
    try {
      console.log('🔍 DEBUG MODAL - Chamando productsService.getProducts...')
      const result = await productsService.getProducts(
        { active: true }, // Apenas produtos ativos
        1, 
        300 // Carregar todos os produtos
      )
      
      console.log('🔍 DEBUG MODAL - Resultado do productsService:', result)
      
      if (result.success && result.data) {
        setAvailableProducts(result.data.items)
        setFilteredProducts(result.data.items)
        console.log(`✅ ${result.data.items.length} produtos carregados do Supabase`)
      } else {
        setError('Falha ao carregar produtos do banco de dados')
        console.error('❌ Erro ao carregar produtos:', result.error)
      }
    } catch (err) {
      setError('Erro de conexão ao carregar produtos')
      console.error('❌ Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }

  // 🔍 Filtrar produtos por busca
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    
    if (!term.trim()) {
      setFilteredProducts(availableProducts)
      return
    }
    
    const filtered = availableProducts.filter(product => 
      product.name?.toLowerCase().includes(term.toLowerCase()) ||
      product.soropel_code?.toString().includes(term) ||
      product.category_name?.toLowerCase().includes(term.toLowerCase()) ||
      `${product.weight_value}${product.weight_unit}`.toLowerCase().includes(term.toLowerCase())
    )
    
    setFilteredProducts(filtered)
  }

  // ➕ Adicionar produto à máquina
  const addProductToMachine = (machineId: number, product: Product) => {
    setMachineConfigs(prev => prev.map(machine => {
      if (machine.id === machineId) {
        // Verificar se produto já está atribuído
        const alreadyAssigned = machine.assignedProducts.some(p => p.id === product.id)
        if (alreadyAssigned) {
          alert('Este produto já está atribuído a esta máquina!')
          return machine
        }
        
        return {
          ...machine,
          assignedProducts: [...machine.assignedProducts, product]
        }
      }
      return machine
    }))
    
    console.log(`✅ Produto ${product.name} adicionado à Máquina ${machineId}`)
  }

  // ➖ Remover produto da máquina
  const removeProductFromMachine = (machineId: number, productId: string) => {
    setMachineConfigs(prev => prev.map(machine => {
      if (machine.id === machineId) {
        return {
          ...machine,
          assignedProducts: machine.assignedProducts.filter(p => p.id !== productId)
        }
      }
      return machine
    }))
    
    console.log(`❌ Produto removido da Máquina ${machineId}`)
  }

  // 💾 Salvar configurações no Supabase
  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      // Preparar dados para salvamento usando UUIDs reais
      const configs = machineConfigs.map(machine => ({
        machineId: machine.uuid, // Usar UUID real em vez do número
        productIds: machine.assignedProducts.map(p => p.id)
      }))

      // Salvar no Supabase
      await machineProductsService.saveAllMachinesProductsConfig(
        configs,
        'Sistema - Configuração Manual'
      )

      console.log('✅ Configurações salvas com sucesso no Supabase!')
      alert('✅ Configurações de produtos salvas com sucesso!')
      onClose()
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
      setError('Erro ao salvar configurações. Tente novamente.')
      alert('❌ Erro ao salvar configurações. Verifique o console para detalhes.')
    } finally {
      setSaving(false)
    }
  }

  // 🔄 Carregar configurações salvas do Supabase
  const loadMachineProductsConfig = async () => {
    try {
      console.log('🔄 Carregando configurações de produtos das máquinas...')
      
      const configs = await machineProductsService.getAllMachinesProductsConfig()
      
      // Atualizar estado das máquinas com produtos carregados (usar UUID como chave)
      setMachineConfigs(prev => prev.map(machine => {
        const config = configs.find(c => c.machine_id === machine.uuid)
        return {
          ...machine,
          assignedProducts: config?.products || []
        }
      }))

      console.log('✅ Configurações carregadas:', configs)
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error)
      setError('Erro ao carregar configurações salvas')
    }
  }

  // 🔄 Carregar produtos ao abrir modal
  useEffect(() => {
    if (isOpen) {
      loadProducts()
      loadMachineProductsConfig() // Carregar configurações salvas
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-7xl h-[90%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Configurar Produtos das Máquinas
            </h2>
            {availableProducts.length > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                {availableProducts.length} produtos disponíveis
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Lista de Produtos Disponíveis */}
          <div className="w-1/3 border-r bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Produtos Disponíveis
              </h3>
              
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Lista de Produtos */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Carregando produtos...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => selectedMachineId && addProductToMachine(selectedMachineId, product)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600">
                        {product.name}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-mono">
                          #{product.soropel_code}
                        </span>
                        {product.weight_value && product.weight_unit && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {product.weight_value}{product.weight_unit}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedMachineId && (
                      <Plus className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              ))}

              {!loading && !error && filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configuração das Máquinas */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Máquinas e Produtos Atribuídos
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Clique em uma máquina para selecioná-la, depois clique nos produtos para atribuí-los
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {machineConfigs.map((machine) => (
                  <div
                    key={machine.id}
                    className={`${machine.color} border-2 rounded-xl p-4 transition-all cursor-pointer ${
                      selectedMachineId === machine.id
                        ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedMachineId(machine.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800">{machine.name}</h4>
                        <p className="text-xs text-gray-600 font-medium">{machine.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center">
                          <Tag className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </div>

                    {/* Produtos Atribuídos */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {machine.assignedProducts.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          <Package className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          Nenhum produto atribuído
                        </div>
                      ) : (
                        machine.assignedProducts.map((product) => (
                          <div
                            key={product.id}
                            className="bg-white/70 rounded-lg p-2 flex items-center justify-between group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-600 font-mono">
                                #{product.soropel_code}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeProductFromMachine(machine.id, product.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedMachineId ? (
              <span className="text-blue-600 font-medium">
                Máquina {selectedMachineId} selecionada - Clique nos produtos para atribuir
              </span>
            ) : (
              'Selecione uma máquina para começar a atribuir produtos'
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
