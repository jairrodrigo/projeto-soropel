import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://chhtllsprlqvjeivspxq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaHRsbHNwcmxxdmplaXZzcHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTQ0OTcsImV4cCI6MjA3NDQzMDQ5N30.qvoJ7Y53yihGkzzMxHcY8hBqiLb68kZxvR1mBpwWnAY');

async function testOrders() {
  console.log('🔍 Testando página de Pedidos...');
  
  // Testar tabela orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      priority,
      delivery_date,
      total_units,
      tipo,
      client_id,
      clients(company_name, fantasy_name)
    `)
    .limit(5);
    
  console.log('📦 Orders Table:');
  console.log('Erro:', ordersError?.message || 'OK');
  console.log('Registros:', orders?.length || 0);
  
  if (orders && orders.length > 0) {
    console.log('Exemplo de pedido:');
    console.log('- ID:', orders[0].id);
    console.log('- Número:', orders[0].order_number);
    console.log('- Status:', orders[0].status);
    console.log('- Prioridade:', orders[0].priority);
    console.log('- Cliente:', orders[0].clients?.company_name || orders[0].clients?.fantasy_name);
  }
  
  // Testar order_items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, order_id, quantity, status')
    .limit(3);
    
  console.log('📋 Order Items:');
  console.log('Erro:', itemsError?.message || 'OK'); 
  console.log('Registros:', items?.length || 0);
}

testOrders().catch(console.error);
