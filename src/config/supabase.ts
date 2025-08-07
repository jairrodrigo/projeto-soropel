import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Função para verificar se o Supabase está disponível
export const isSupabaseAvailable = () => {
  return supabaseUrl !== 'https://your-project-ref.supabase.co' && 
         supabaseKey !== 'your-anon-key' &&
         supabaseUrl.includes('supabase.co')
}

export default supabase
