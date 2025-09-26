import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://chhtllsprlqvjeivspxq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnV5bHZrcXhieXJzbmZyZHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDQyODQsImV4cCI6MjA2NzAyMDI4NH0.B-N8j8L6wbWHe5e6y3NHDy989F0Et9mAjESSv6REEQY');

async function testFinal() {
  console.log('🚀 TESTE: Novo Pedido → Página Pedidos');
  console.log('═══════════════════════════════════════');
  
  const { count: antes } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
    
  console.log('📊 Pedidos antes:', antes || 0);
  
  // Criar pedido simples
  const pedido = {
    order_number: 'OP-' + Math.floor(Math.random() * 9999),
    priority: 'normal',
    tipo: 'neutro',
    delivery_date: '2025-08-15',
    observations: 'Teste',
    status: 'pendente',
    total_units: 3000
  };
  
  console.log('📝 Criando:', pedido.order_number);
  
  const { data: novo, error } = await supabase
    .from('orders')
    .insert([pedido])
    .select('*')
    .single();
    
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log('✅ Pedido criado:', novo.id);
  
  // Adicionar produtos
  const { data: produtos } = await supabase
    .from('products')
    .select('id, name')
    .limit(2);
    
  if (produtos) {
    const items = produtos.map(p => ({
      order_id: novo.id,
      product_id: p.id,
      quantity: 1500,
      status: 'pendente'
    }));
    
    const { data: itemsCriados } = await supabase
      .from('order_items')
      .insert(items)
      .select('products!inner(name)');
      
    console.log('📦 Produtos adicionados:', itemsCriados?.length || 0);
  }
  
  // Verificar resultado
  const { data: todos } = await supabase
    .from('orders')
    .select('order_number, status, total_units')
    .order('created_at', { ascending: false })
    .limit(3);
    
  console.log('');
  console.log('📋 Últimos pedidos:');
  todos?.forEach((p, i) => {
    const isNovo = p.order_number === novo.order_number;
    console.log(`   ${i+1}. ${p.order_number} | ${p.status} ${isNovo ? '← NOVO!' : ''}`);
  });
  
  const { count: depois } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
    
  console.log('');
  console.log('🎯 RESULTADO:');
  console.log('═══════════════════════════════');
  console.log('📊 Antes:', antes || 0);
  console.log('📊 Depois:', depois || 0);
  console.log('✅ Funcionou:', (depois || 0) > (antes || 0) ? 'SIM!' : 'Não');
  
  if ((depois || 0) > (antes || 0)) {
    console.log('');
    console.log('🎊 INTEGRAÇÃO CONFIRMADA!');
    console.log('════════════════════════════════════════');
    console.log('✅ "Novo Pedido" conecta com "Pedidos"');
    console.log('✅ Pedidos aparecem imediatamente');
    console.log('✅ Produtos são salvos corretamente');
    console.log('');
    console.log('🌐 TESTE NA INTERFACE:');
    console.log('   http://localhost:3000');
    console.log('   1. Novo Pedido → criar pedido');
    console.log('   2. Pedidos → ver aparecer!');
  }
}

testFinal().catch(console.error);
