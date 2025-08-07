import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://dbruylvkqxbyrsnfrdpu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnV5bHZrcXhieXJzbmZyZHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDQyODQsImV4cCI6MjA2NzAyMDI4NH0.B-N8j8L6wbWHe5e6y3NHDy989F0Et9mAjESSv6REEQY');

async function addMoreItems() {
  console.log('🚀 Adicionando mais produtos aos pedidos...');
  
  const { data: products } = await supabase
    .from('products')
    .select('id, name, soropel_code')
    .eq('category_name', 'Kraft Especial')
    .in('soropel_code', [1103, 1104, 1105, 1107, 1109]) // Outros produtos
    .limit(10);
    
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number');
    
  if (products && orders && products.length > 0 && orders.length > 0) {
    
    let successCount = 0;
    
    // Para cada pedido, adicionar 2-3 produtos diferentes
    for (const [orderIndex, order] of orders.entries()) {
      console.log('📋 Adicionando produtos ao pedido:', order.order_number);
      
      const productsForThisOrder = products.slice(orderIndex * 2, orderIndex * 2 + 3);
      
      for (const product of productsForThisOrder) {
        const quantityMap = {
          1103: 5000, 1104: 3000, 1105: 2000, 1107: 1500, 1109: 1000
        };
        
        const quantity = quantityMap[product.soropel_code] || 2000;
        
        const item = {
          order_id: order.id,
          product_id: product.id,
          quantity: quantity,
          status: 'pendente', // Só usar status que funciona
          separated_quantity: 0
        };
        
        console.log('  ⏳ Adicionando:', product.name, '-', quantity.toLocaleString(), 'un');
        
        const { data: result, error } = await supabase
          .from('order_items')
          .insert([item])
          .select('id');
        
        if (error) {
          console.log('    ❌ Erro:', error.message);
        } else {
          console.log('    ✅ Adicionado!');
          successCount++;
        }
      }
      
      console.log('');
    }
    
    console.log('✅ Total de produtos adicionados:', successCount);
    
    // Mostrar resultado final
    const { data: allItems } = await supabase
      .from('order_items')
      .select(`
        quantity, status,
        orders!inner(order_number),
        products!inner(name, soropel_code)
      `)
      .order('created_at', { ascending: false });
      
    console.log('');
    console.log('🎯 TODOS OS ORDER_ITEMS CRIADOS:');
    console.log('═══════════════════════════════════════════════════');
    
    if (allItems) {
      // Agrupar por pedido
      const pedidosGrouped = {};
      allItems.forEach(item => {
        const pedido = item.orders?.order_number;
        if (!pedidosGrouped[pedido]) {
          pedidosGrouped[pedido] = [];
        }
        pedidosGrouped[pedido].push(item);
      });
      
      Object.entries(pedidosGrouped).forEach(([pedido, items]) => {
        console.log('📦 PEDIDO:', pedido);
        items.forEach(item => {
          console.log('   🏷️', item.products?.name);
          console.log('   📊 Código:', item.products?.soropel_code);
          console.log('   📈 Quantidade:', item.quantity?.toLocaleString(), 'unidades');
          console.log('   ⚡ Status:', item.status);
          console.log('   ──────────────────────────────────────');
        });
        console.log('');
      });
      
      console.log('🎊 IMPLEMENTAÇÃO CONCLUÍDA!');
      console.log('═══════════════════════════════════════');
      console.log('✅ Página de Pedidos AGORA tem produtos reais!');
      console.log('🌐 Teste em: http://localhost:3000');
      console.log('📋 Menu → Pedidos');
      console.log('🏷️ Cada pedido mostra produtos específicos do catálogo Kraft Especial');
      console.log('📈 Com quantidades realistic por tipo de produto');
      console.log('');
      console.log('📊 Total final de order_items:', allItems.length);
    }
  }
}

addMoreItems().catch(console.error);
