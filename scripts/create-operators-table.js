// 🗄️ Script para criar tabela operators no Supabase
// Execute com: node scripts/create-operators-table.js

// Configurações do Supabase (hardcoded para este script)
const supabaseUrl = 'https://chhtllsprlqvjeivspxq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnV5bHZrcXhieXJzbmZyZHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDQyODQsImV4cCI6MjA2NzAyMDI4NH0.B-N8j8L6wbWHe5e6y3NHDy989F0Et9mAjESSv6REEQY'

const createOperatorsTableSQL = `
-- =============================================
-- TABELA DE OPERADORES - Sistema Soropel
-- =============================================

CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- DADOS PESSOAIS
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  
  -- FUNÇÃO E TURNO
  role TEXT NOT NULL DEFAULT 'operador' CHECK (
    role IN ('operador', 'supervisor', 'tecnico', 'manutencao')
  ),
  shift TEXT NOT NULL DEFAULT 'manha' CHECK (
    shift IN ('manha', 'tarde', 'noite', 'integral')
  ),
  
  -- MÁQUINAS QUE PODE OPERAR (ARRAY DE IDs)
  machine_ids INTEGER[],
  
  -- CONTROLE
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_operators_name ON operators(name);
CREATE INDEX IF NOT EXISTS idx_operators_cpf ON operators(cpf);
CREATE INDEX IF NOT EXISTS idx_operators_role ON operators(role);
CREATE INDEX IF NOT EXISTS idx_operators_shift ON operators(shift);
CREATE INDEX IF NOT EXISTS idx_operators_active ON operators(active);
CREATE INDEX IF NOT EXISTS idx_operators_machine_ids ON operators USING GIN(machine_ids);

-- TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`

async function createOperatorsTable() {
  try {
    console.log('🚀 Testando se a tabela operators já existe...')
    
    // Testar se a tabela já existe fazendo uma query simples
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/operators?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      }
    })
    
    if (testResponse.ok) {
      console.log('✅ Tabela operators já existe!')
      return true
    }
    
    if (testResponse.status === 404) {
      console.log('❌ Tabela operators não existe')
      console.log('📋 SQL para executar manualmente no painel do Supabase:')
      console.log('\n' + '='.repeat(60))
      console.log(createOperatorsTableSQL)
      console.log('='.repeat(60) + '\n')
      console.log('🌐 Acesse: https://supabase.com/dashboard/project/dbruylvkqxbyrsnfrdpu/sql/new')
      console.log('📝 Cole o SQL acima e execute')
      return false
    }
    
    const errorText = await testResponse.text()
    console.error('❌ Erro ao testar tabela:', testResponse.status, errorText)
    return false
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err)
    return false
  }
}

// Executar script
createOperatorsTable().then(success => {
  if (success) {
    console.log('🎉 Script executado com sucesso!')
    process.exit(0)
  } else {
    console.log('💥 Falha na execução do script')
    console.log('ℹ️  Tente executar o SQL manualmente no painel do Supabase')
    process.exit(1)
  }
})