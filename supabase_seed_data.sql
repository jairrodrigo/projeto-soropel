-- =============================================
-- DADOS INICIAIS - SISTEMA SOROPEL
-- Baseado na análise real dos códigos e categorias
-- =============================================

-- 1. INSERIR CATEGORIAS DE PRODUTOS
-- Baseado nas faixas identificadas na análise
-- =============================================

-- 2. INSERIR MÁQUINAS
-- =============================================
INSERT INTO machines (machine_number, name, machine_type, is_special) VALUES
(1, 'Máquina 1', 'normal', false),
(2, 'Máquina 2', 'normal', false),
(3, 'Máquina 3', 'normal', false),
(4, 'Máquina 4', 'normal', false),
(5, 'Máquina 5', 'normal', false),
(6, 'Máquina 6', 'normal', false),
(7, 'Máquina 7', 'normal', false),
(8, 'Máquina 8', 'normal', false),
(9, 'Máquina 9', 'especial', true);

-- 3. INSERIR PRODUTOS BASEADOS NOS CÓDIGOS REAIS
-- Faixa 1100s - Produtos Básicos (Kraft Natural/Branco)
-- =============================================
INSERT INTO products (soropel_code, category_code, category_name, name, weight_value, weight_unit, paper_type, packages_per_thousand, packages_per_bundle, units_per_bundle) VALUES
(1101, '1100s', 'Básicos Kraft', 'SACO KRAFT NATURAL 2KG', 2, 'kg', 'K NATURAL', 2, 4, 2000),
(1102, '1100s', 'Básicos Kraft', 'SACO KRAFT NATURAL 3KG', 3, 'kg', 'K NATURAL', 2, 4, 2000),
(1103, '1100s', 'Básicos Kraft', 'SACO KRAFT NATURAL 4KG', 4, 'kg', 'K NATURAL', 2, 4, 2000),
(1104, '1100s', 'Básicos Kraft', 'SACO KRAFT NATURAL 5KG', 5, 'kg', 'K NATURAL', 2, 4, 2000),
(1105, '1100s', 'Básicos Kraft', 'SACO KRAFT BRANCO 2KG', 2, 'kg', 'K BRANCO', 2, 4, 2000),
(1106, '1100s', 'Básicos Kraft', 'SACO KRAFT BRANCO 3KG', 3, 'kg', 'K BRANCO', 2, 4, 2000),
(1107, '1100s', 'Básicos Kraft', 'SACO KRAFT BRANCO 4KG', 4, 'kg', 'K BRANCO', 2, 4, 2000),
(1108, '1100s', 'Básicos Kraft', 'SACO KRAFT BRANCO 5KG', 5, 'kg', 'K BRANCO', 2, 4, 2000);

-- Faixa 2000s - Produtos Especiais (30GR)
-- =============================================
INSERT INTO products (soropel_code, category_code, category_name, name, weight_value, weight_unit, packages_per_thousand, packages_per_bundle, units_per_bundle) VALUES
(2201, '2000s', 'Especiais 30GR', 'TALHER 30GR', 30, 'gr', 2, 10, 5000),
(2202, '2000s', 'Especiais 30GR', 'PIPOCA 01 30GR', 30, 'gr', 2, 10, 5000),
(2203, '2000s', 'Especiais 30GR', 'PIPOCA 02 30GR', 30, 'gr', 2, 10, 5000),
(2204, '2000s', 'Especiais 30GR', 'PIPOCA 03 30GR', 30, 'gr', 2, 10, 5000),
(2205, '2000s', 'Especiais 30GR', 'PIPOCA 04 30GR', 30, 'gr', 2, 10, 5000),
(2206, '2000s', 'Especiais 30GR', 'MINI LANCHE', 30, 'gr', 2, 10, 5000),
(2207, '2000s', 'Especiais 30GR', 'LANCHE 30GR', 30, 'gr', 2, 10, 5000),
(2208, '2000s', 'Especiais 30GR', 'HOT DOG 30GR', 30, 'gr', 2, 10, 5000);

-- Faixa 4000s - Produtos Premium
-- =============================================
INSERT INTO products (soropel_code, category_code, category_name, name, weight_value, weight_unit, packages_per_thousand, packages_per_bundle, units_per_bundle) VALUES
(4401, '4000s', 'Premium', 'SACO MIX PREMIUM 3KG', 3, 'kg', 2, 6, 3000),
(4402, '4000s', 'Premium', 'SACO MIX PREMIUM 5KG', 5, 'kg', 2, 6, 3000),
(4403, '4000s', 'Premium', 'HAMBURGÃO ESPECIAL', 50, 'gr', 2, 8, 4000),
(4404, '4000s', 'Premium', 'VIAGEM REFORÇADO', 40, 'gr', 2, 8, 4000);

-- Faixa 5000s - Timbrados
-- =============================================
INSERT INTO products (soropel_code, category_code, category_name, name, weight_value, weight_unit, paper_type, packages_per_thousand, packages_per_bundle, units_per_bundle) VALUES
(5501, '5000s', 'Timbrados', 'TIMBRADO 2KG BRANCO AP', 2, 'kg', 'K BRANCO', 2, 5, 2500),
(5502, '5000s', 'Timbrados', 'TIMBRADO 3KG BRANCO AP', 3, 'kg', 'K BRANCO', 2, 5, 2500),
(5503, '5000s', 'Timbrados', 'TIMBRADO 4KG BRANCO AP', 4, 'kg', 'K BRANCO', 2, 5, 2500),
(5504, '5000s', 'Timbrados', 'TIMBRADO 5KG BRANCO AP', 5, 'kg', 'K BRANCO', 2, 5, 2500),
(5505, '5000s', 'Timbrados', 'TIMBRADO 2KG NATURAL AP', 2, 'kg', 'K NATURAL', 2, 5, 2500),
(5506, '5000s', 'Timbrados', 'TIMBRADO 3KG NATURAL AP', 3, 'kg', 'K NATURAL', 2, 5, 2500),
(5507, '5000s', 'Timbrados', 'TIMBRADO 4KG NATURAL AP', 4, 'kg', 'K NATURAL', 2, 5, 2500),
(5508, '5000s', 'Timbrados', 'TIMBRADO 5KG NATURAL AP', 5, 'kg', 'K NATURAL', 2, 5, 2500);

-- 4. INSERIR CLIENTES DE EXEMPLO
-- =============================================
INSERT INTO customers (name, cnpj, phone, city, state) VALUES
('PONTO DE BALA LTDA', '12.345.678/0001-90', '(15) 3234-5678', 'Sorocaba', 'SP'),
('DIL DOCES INDUSTRIA', '98.765.432/0001-10', '(15) 3876-5432', 'Votorantim', 'SP'),
('DOCERIA REGIONAL', '11.222.333/0001-44', '(15) 3555-1234', 'Itu', 'SP'),
('DISTRIBUIDORA CENTRO OESTE', '22.333.444/0001-55', '(15) 3666-7890', 'Sorocaba', 'SP');

-- 5. INSERIR PEDIDOS DE EXEMPLO (BASEADOS NOS DADOS REAIS)
-- =============================================
INSERT INTO orders (order_number, customer_id, status, priority, order_date, delivery_date, notes) VALUES
(
  'OP-1609',
  (SELECT id FROM customers WHERE cnpj = '12.345.678/0001-90'),
  'em_producao',
  'normal',
  CURRENT_DATE - INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '5 days',
  'Pedido urgente para entrega da semana'
),
(
  'OP-1540',
  (SELECT id FROM customers WHERE cnpj = '98.765.432/0001-10'),
  'aguardando_producao',
  'especial',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '7 days',
  'Cliente premium - prioridade especial'
);

-- 6. INSERIR ITENS DOS PEDIDOS
-- =============================================
-- Itens do OP-1609 (PONTO DE BALA)
INSERT INTO order_items (order_id, product_id, quantity, machine_id, status) VALUES
(
  (SELECT id FROM orders WHERE order_number = 'OP-1609'),
  (SELECT id FROM products WHERE soropel_code = 1101),
  1000,
  1,
  'em_producao'
),
(
  (SELECT id FROM orders WHERE order_number = 'OP-1609'),
  (SELECT id FROM products WHERE soropel_code = 2202),
  500,
  2,
  'pendente'
);

-- Itens do OP-1540 (DIL DOCES)
INSERT INTO order_items (order_id, product_id, quantity, machine_id, status) VALUES
(
  (SELECT id FROM orders WHERE order_number = 'OP-1540'),
  (SELECT id FROM products WHERE soropel_code = 1103),
  2000,
  3,
  'pendente'
),
(
  (SELECT id FROM orders WHERE order_number = 'OP-1540'),
  (SELECT id FROM products WHERE soropel_code = 5501),
  1500,
  4,
  'pendente'
);

-- 7. INSERIR BOBINAS DE EXEMPLO
-- =============================================
INSERT INTO rolls (roll_code, supplier, paper_type, width, weight, status, machine_id) VALUES
('BOB-2025-001', 'Fornecedor A', 'K NATURAL', 120.0, 80.0, 'em_maquina', 1),
('BOB-2025-002', 'Fornecedor A', 'K BRANCO', 120.0, 80.0, 'estoque', NULL),
('BOB-2025-003', 'Fornecedor B', 'K NATURAL', 150.0, 90.0, 'em_maquina', 2),
('BOB-2025-004', 'Fornecedor B', 'K BRANCO', 150.0, 90.0, 'estoque', NULL),
('BOB-2025-005', 'Fornecedor C', 'K NATURAL', 100.0, 75.0, 'sobra', NULL);

-- =============================================
-- VIEWS ÚTEIS PARA O SISTEMA
-- =============================================

-- View: Resumo de pedidos
CREATE VIEW orders_summary AS
SELECT 
  o.order_number,
  o.status,
  o.priority,
  c.name as customer_name,
  COUNT(oi.id) as total_items,
  SUM(oi.quantity) as total_quantity,
  o.order_date,
  o.delivery_date
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.priority, c.name, o.order_date, o.delivery_date;

-- View: Produtos por categoria
CREATE VIEW products_by_category AS
SELECT 
  category_code,
  category_name,
  COUNT(*) as product_count,
  MIN(soropel_code) as min_code,
  MAX(soropel_code) as max_code
FROM products
WHERE active = true
GROUP BY category_code, category_name
ORDER BY category_code;

-- View: Status das máquinas
CREATE VIEW machines_status AS
SELECT 
  m.machine_number,
  m.name,
  m.status,
  m.is_special,
  r.roll_code as current_roll,
  COUNT(oi.id) as pending_orders
FROM machines m
LEFT JOIN rolls r ON m.id = r.machine_id AND r.status = 'em_maquina'
LEFT JOIN order_items oi ON m.id = oi.machine_id AND oi.status = 'pendente'
GROUP BY m.id, m.machine_number, m.name, m.status, m.is_special, r.roll_code
ORDER BY m.machine_number;
