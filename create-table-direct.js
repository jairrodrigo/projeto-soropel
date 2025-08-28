// Script para criar a tabela operators diretamente no Supabase
const SUPABASE_URL = 'https://dbruylvkqxbyrsnfrdpu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnV5bHZrcXhieXJzbmZyZHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDQyODQsImV4cCI6MjA2NzAyMDI4NH0.B-N8j8L6wbWHe5e6y3NHDy989F0Et9mAjESSv6REEQY';

const SQL_CREATE_TABLE = `
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
`;

async function createOperatorsTable() {
  try {
    console.log('🚀 Criando tabela operators no Supabase...');
    
    // Usar a API REST do Supabase para executar SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        sql: SQL_CREATE_TABLE
      })
    });

    if (response.ok) {
      console.log('✅ Tabela operators criada com sucesso!');
      console.log('📊 Verificando se a tabela foi criada...');
      
      // Verificar se a tabela existe
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/operators?limit=1`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (checkResponse.ok) {
        console.log('✅ Tabela operators confirmada e acessível!');
      } else {
        console.log('⚠️ Tabela criada mas ainda não acessível via API');
      }
    } else {
      const error = await response.text();
      console.error('❌ Erro ao criar tabela:', error);
      console.log('\n📋 Execute o SQL manualmente no painel do Supabase:');
      console.log('🌐 https://supabase.com/dashboard/project/dbruylvkqxbyrsnfrdpu/sql/new');
      console.log('\n' + SQL_CREATE_TABLE);
    }
  } catch (error) {
    console.error('❌ Erro na execução:', error.message);
    console.log('\n📋 Execute o SQL manualmente no painel do Supabase:');
    console.log('🌐 https://supabase.com/dashboard/project/dbruylvkqxbyrsnfrdpu/sql/new');
    console.log('\n' + SQL_CREATE_TABLE);
  }
}

createOperatorsTable();