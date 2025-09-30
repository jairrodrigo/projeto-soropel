import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://chhtllsprlqvjeivspxq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaHRsbHNwcmxxdmplaXZzcHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTQ0OTcsImV4cCI6MjA3NDQzMDQ5N30.qvoJ7Y53yihGkzzMxHcY8hBqiLb68kZxvR1mBpwWnAY');

async function exploreProducts() {
  console.log('🔍 Explorando produtos disponíveis...');
  
  // Buscar diferentes categorias
  const { data: categories, error: catError } = await supabase
    .from('products')
    .select('category_name')
    .neq('category_name', null)
    .limit(20);
    
  if (categories) {
    const uniqueCategories = [...new Set(categories.map(c => c.category_name))];
    console.log('📂 Categorias encontradas:');
    uniqueCategories.forEach(cat => console.log('- ' + cat));
    console.log('');
  }
  
  // Buscar quaisquer produtos  
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, soropel_code, category_name, weight_value, weight_unit')
    .limit(10);
    
  console.log('📦 Primeiros 10 produtos:');
  if (products) {
    products.forEach(p => {
      console.log('- Nome:', p.name);
      console.log('  Categoria:', p.category_name);
      console.log('  Código:', p.soropel_code);
      console.log('');
    });
  }
}

exploreProducts().catch(console.error);
