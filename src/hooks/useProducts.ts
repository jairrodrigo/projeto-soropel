import { useState, useEffect, useCallback } from 'react'
import { getProducts } from '@/services/productsService'
import type { Product } from '@/types/supabase'

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  searchProducts: (query: string) => void
  refreshProducts: () => Promise<void>
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async (search?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getProducts(
        { 
          active: true,
          search: search || undefined
        },
        1,
        100 // Buscar mais produtos para ter boa seleção
      )
      
      if (result.success && result.data) {
        setProducts(result.data.items)
      } else {
        setError(result.error || 'Erro ao carregar produtos')
        setProducts([])
      }
    } catch (err) {
      setError('Erro de conexão')
      setProducts([])
      console.error('Erro ao buscar produtos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchProducts = useCallback((query: string) => {
    fetchProducts(query)
  }, [fetchProducts])

  const refreshProducts = useCallback(async () => {
    await fetchProducts()
  }, [fetchProducts])

  // Carregar produtos iniciais
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    searchProducts,
    refreshProducts
  }
}
