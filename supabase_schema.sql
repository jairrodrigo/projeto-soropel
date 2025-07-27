-- =============================================
-- SCHEMA SUPABASE - SISTEMA SOROPEL
-- Baseado em análise real dos dados 2025
-- 424 códigos únicos de produtos
-- =============================================

-- 1. TABELA DE PRODUTOS (CORE)
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- CÓDIGO SOROPEL (SISTEMA REAL)
  soropel_code INTEGER NOT NULL UNIQUE, -- 1101-10148
  
  -- CATEGORIA BASEADA NAS FAIXAS IDENTIFICADAS  
  category_code TEXT NOT NULL, -- '1100s', '2000s', '4000s', '5000s', '8000s', '10000s'
  category_name TEXT, -- 'Básicos', 'Premium', 'Especiais', etc.
  
  -- INFORMAÇÕES DO PRODUTO
  name TEXT NOT NULL,
  description TEXT,
  
  -- ESPECIFICAÇÕES TÉCNICAS
  weight_value DECIMAL,
  weight_unit TEXT CHECK (weight_unit IN ('kg', 'gr')),
  
  -- DIMENSÕES
  width DECIMAL,
  height DECIMAL,
  paper_type TEXT, -- 'K NATURAL', 'K BRANCO', etc.
  
  -- SISTEMA DE EMBALAGEM (BASEADO NA PLANILHA)
  packages_per_thousand INTEGER DEFAULT 2,
  packages_per_bundle INTEGER,
  units_per_bundle INTEGER,
  
  -- CONTROLE
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE CLIENTES
-- =============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- DADOS BÁSICOS
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  
  -- ENDEREÇO
  address TEXT,
  city TEXT,
  state TEXT,
  zipcode TEXT,
  
  -- CONTROLE
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE MÁQUINAS
-- =============================================
CREATE TABLE machines (
  id SERIAL PRIMARY KEY,
  
  -- INFORMAÇÕES DA MÁQUINA
  name TEXT NOT NULL, -- 'Máquina 1', 'Máquina 2', etc.
  machine_number INTEGER NOT NULL UNIQUE, -- 1, 2, 3... 9
  
  -- TIPO E CAPACIDADE
  machine_type TEXT DEFAULT 'normal', -- 'normal', 'especial'
  is_special BOOLEAN DEFAULT false, -- Máquina 9 é especial
  
  -- STATUS
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'manutencao', 'parada')),
  
  -- CONTROLE
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE PEDIDOS (ORDERS)
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- NÚMERO DO PEDIDO/OP
  order_number TEXT NOT NULL UNIQUE, -- 'OP-1609', 'OP-1540', etc.
  
  -- CLIENTE
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT, -- Para casos onde não há cadastro completo
  
  -- STATUS DO PEDIDO (BASEADO NA PLANILHA)
  status TEXT NOT NULL DEFAULT 'aguardando_producao' CHECK (
    status IN (
      'aguardando_producao',
      'em_producao', 
      'produzido',
      'produzido_parcial',
      'separado_parcial',
      'cancelado',
      'em_andamento',
      'liberado_completo',
      'liberado_parcial',
      'entrega_completa',
      'entrega_parcial'
    )
  ),
  
  -- PRIORIDADE
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'especial', 'urgente')),
  
  -- DATAS
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  
  -- OBSERVAÇÕES
  notes TEXT,
  
  -- CONTROLE
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE ITENS DO PEDIDO
-- =============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- RELACIONAMENTOS
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  -- QUANTIDADES
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  bundles_needed INTEGER, -- Calculado automaticamente
  packages_needed INTEGER, -- Calculado automaticamente
  
  -- PRODUÇÃO
  machine_id INTEGER REFERENCES machines(id),
  
  -- STATUS DO ITEM
  status TEXT DEFAULT 'pendente' CHECK (
    status IN ('pendente', 'em_producao', 'concluido', 'cancelado')
  ),
  
  -- CONTROLE
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE BOBINAS
-- =============================================
CREATE TABLE rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IDENTIFICAÇÃO DA BOBINA
  roll_code TEXT NOT NULL UNIQUE, -- Código identificador
  supplier TEXT, -- Fornecedor
  
  -- ESPECIFICAÇÕES
  paper_type TEXT NOT NULL,
  width DECIMAL NOT NULL,
  weight DECIMAL, -- Gramatura
  length DECIMAL, -- Metros
  
  -- STATUS DA BOBINA
  status TEXT DEFAULT 'estoque' CHECK (
    status IN ('estoque', 'em_maquina', 'sobra', 'acabou')
  ),
  
  -- LOCALIZAÇÃO
  machine_id INTEGER REFERENCES machines(id), -- Se estiver em máquina
  
  -- DATAS
  received_date DATE DEFAULT CURRENT_DATE,
  installation_date DATE,
  
  -- CONTROLE
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE PRODUÇÃO
-- =============================================
CREATE TABLE production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- RELACIONAMENTOS
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  roll_id UUID REFERENCES rolls(id),
  
  -- QUANTIDADES PRODUZIDAS
  quantity_produced INTEGER NOT NULL,
  quantity_approved INTEGER DEFAULT 0,
  quantity_rejected INTEGER DEFAULT 0,
  
  -- TIMING
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  
  -- OBSERVAÇÕES
  notes TEXT,
  quality_issues TEXT,
  
  -- CONTROLE
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Produtos
CREATE INDEX idx_products_soropel_code ON products(soropel_code);
CREATE INDEX idx_products_category ON products(category_code);
CREATE INDEX idx_products_active ON products(active);

-- Clientes
CREATE INDEX idx_customers_cnpj ON customers(cnpj);
CREATE INDEX idx_customers_name ON customers(name);

-- Máquinas
CREATE INDEX idx_machines_number ON machines(machine_number);
CREATE INDEX idx_machines_status ON machines(status);

-- Pedidos
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(order_date);

-- Itens do Pedido
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_machine ON order_items(machine_id);

-- Bobinas
CREATE INDEX idx_rolls_code ON rolls(roll_code);
CREATE INDEX idx_rolls_status ON rolls(status);
CREATE INDEX idx_rolls_machine ON rolls(machine_id);

-- Produção
CREATE INDEX idx_production_order_item ON production_records(order_item_id);
CREATE INDEX idx_production_machine ON production_records(machine_id);
CREATE INDEX idx_production_date ON production_records(created_at);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rolls_updated_at BEFORE UPDATE ON rolls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
