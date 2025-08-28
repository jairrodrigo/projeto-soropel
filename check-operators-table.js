// Script para verificar se a tabela operators existe no Supabase
const SUPABASE_URL = 'https://dbruylvkqxbyrsnfrdpu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnV5bHZrcXhieXJzbmZyZHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDQyODQsImV4cCI6MjA2NzAyMDI4NH0.B-N8j8L6wbWHe5e6y3NHDy989F0Et9mAjESSv6REEQY';

async function checkOperatorsTable() {
  try {
    console.log('🔍 Verificando se a tabela operators existe...');
    
    // Tentar acessar a tabela operators
    const response = await fetch(`${SUPABASE_URL}/rest/v1/operators?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Tabela operators existe e está acessível!');
      console.log(`📊 Registros encontrados: ${data.length}`);
      
      if (data.length > 0) {
        console.log('👥 Operadores cadastrados:');
        data.forEach((op, index) => {
          console.log(`   ${index + 1}. ${op.name} (${op.role}) - ${op.shift}`);
        });
      } else {
        console.log('📝 Tabela vazia - pronta para receber dados');
      }
      
      return true;
    } else {
      const error = await response.json();
      
      if (error.code === '42P01') {
        console.log('❌ Tabela operators não existe ainda');
        console.log('\n📋 Para criar a tabela, execute o SQL no painel do Supabase:');
        console.log('🌐 https://supabase.com/dashboard/project/dbruylvkqxbyrsnfrdpu/sql/new');
        console.log('\n💡 Copie e cole o SQL que foi fornecido anteriormente');
      } else {
        console.log('⚠️ Erro ao verificar tabela:', error.message);
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    return false;
  }
}

checkOperatorsTable().then(exists => {
  if (exists) {
    console.log('\n🎉 Sistema pronto para gerenciar operadores!');
  } else {
    console.log('\n⏳ Aguardando criação da tabela operators...');
  }
});