// 🗄️ Configuração Supabase - Sistema Soropel
// Configuração centralizada para toda a aplicação

import { createClient } from '@supabase/supabase-js'

// 🔧 Configurações do ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isSupabaseEnabled = import.meta.env.VITE_ENABLE_SUPABASE === 'true'

// 🛡️ Validação das variáveis de ambiente
if (isSupabaseEnabled && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('🚨 Supabase configurado mas variáveis de ambiente faltando!')
  console.error('Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env')
}

// 🚀 Cliente Supabase configurado
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'sistema-soropel@1.0.0'
    }
  }
})

// 🎯 Configurações específicas do sistema
export const config = {
  // 🗄️ Database
  database: {
    maxRetries: 3,
    timeout: 10000,
    realtime: true
  },
  
  // 📊 Features habilitadas
  features: {
    supabase: isSupabaseEnabled,
    ocr: import.meta.env.VITE_ENABLE_OCR === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  },
  
  // 🔍 Debug
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // 📱 App
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Sistema Soropel',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development'
  }
}

// 🧪 Função de teste de conexão
export const testSupabaseConnection = async () => {
  if (!isSupabaseEnabled) {
    return { success: false, error: 'Supabase não habilitado' }
  }
  
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão Supabase:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase conectado com sucesso!')
    return { success: true, data }
  } catch (err) {
    console.error('❌ Erro inesperado:', err)
    return { success: false, error: 'Erro de conexão' }
  }
}

// 📝 Log de inicialização
if (config.debug) {
  console.log('🚀 Supabase Client inicializado:', {
    url: supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : 'NOT_SET',
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
    enabled: isSupabaseEnabled,
    config: config.features
  })
}

export default supabase