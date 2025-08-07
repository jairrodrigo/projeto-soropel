// 🧪 Debug direto - teste das variáveis de ambiente no frontend
// Adicionar temporariamente no console do navegador

console.log('🔍 DEBUG SUPABASE FRONTEND:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
console.log('VITE_ENABLE_SUPABASE:', import.meta.env.VITE_ENABLE_SUPABASE)

// Teste da função isSupabaseAvailable
import { supabase, isSupabaseAvailable } from '../lib/supabase'
console.log('supabase client:', !!supabase)
console.log('isSupabaseAvailable():', isSupabaseAvailable())

// Teste direto de uma query
if (supabase) {
  supabase.from('products').select('id, name').limit(1)
    .then(result => {
      console.log('✅ Query direta funcionou:', result)  
    })
    .catch(error => {
      console.error('❌ Query direta falhou:', error)
    })
} else {
  console.error('❌ Cliente Supabase não foi criado!')
}
