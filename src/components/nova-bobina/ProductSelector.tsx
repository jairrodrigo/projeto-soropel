import React, { useState, useEffect, useRef } from 'react'
import { Search, Package, X, Check } from 'lucide-react'
import { cn } from '@/utils'
import { useProducts } from '@/hooks/useProducts'
import type { Product } from '@/types/supabase'

interface ProductSelectorProps {
  selectedProductId?: string
  onProductSelect: (product: Product | null) => void
  disabled?: boolean
  placeholder?: string
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProductId,
  onProductSelect,
  disabled = false,
  placeholder = "Selecione o produto sendo produzido..."
}) => {
  const { products, loading, error, searchProducts } = useProducts()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Encontrar produto selecionado
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId)
      setSelectedProduct(product || null)
    } else {
      setSelectedProduct(null)
    }
  }, [selectedProductId, products])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focar no input quando abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    searchProducts(query)
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    onProductSelect(product)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = () => {
    setSelectedProduct(null)
    onProductSelect(null)
    setSearchQuery('')
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.soropel_code.toString().includes(searchQuery)
  )

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full p-4 text-left border-2 rounded-xl transition-all duration-200 flex items-center justify-between",
          disabled 
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : selectedProduct
              ? "bg-green-50 border-green-300 text-green-900 hover:border-green-400"
              : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        )}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Package className={cn(
            "w-5 h-5 flex-shrink-0",
            selectedProduct ? "text-green-600" : "text-gray-400"
          )} />
          <div className="min-w-0 flex-1">
            {selectedProduct ? (
              <div>
                <div className="font-semibold text-base truncate">
                  {selectedProduct.name}
                </div>
                <div className="text-sm text-gray-600">
                  Código: {selectedProduct.soropel_code} • {selectedProduct.category_name}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {selectedProduct && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleClear()
                }
              }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              aria-label="Limpar produto selecionado"
            >
              <X className="w-4 h-4" />
            </span>
          )}
          <Search className={cn(
            "w-5 h-5 transition-transform",
            isOpen ? "rotate-180" : "",
            disabled ? "text-gray-300" : "text-gray-500"
          )} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar por nome ou código..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>

          {/* Products List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Carregando produtos...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <X className="w-5 h-5 mx-auto mb-2" />
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Package className="w-5 h-5 mx-auto mb-2" />
                {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="w-full p-4 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-50 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {selectedProduct?.id === product.id ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center space-x-3">
                        <span>Código: {product.soropel_code}</span>
                        <span>•</span>
                        <span>{product.category_name}</span>
                        {product.weight_value && (
                          <>
                            <span>•</span>
                            <span>{product.weight_value}{product.weight_unit}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
