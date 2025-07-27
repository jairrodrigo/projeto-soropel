-- =============================================
-- RLS POLICIES - SISTEMA SOROPEL
-- Row Level Security para todas as tabelas
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES PARA PRODUTOS
-- =============================================

-- Todos podem visualizar produtos ativos
CREATE POLICY "products_public_read" ON products
    FOR SELECT USING (active = true);

-- Apenas usuários autenticados podem inserir/atualizar produtos
CREATE POLICY "products_authenticated_write" ON products
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- POLICIES PARA CLIENTES
-- =============================================

-- Leitura: usuários autenticados
CREATE POLICY "customers_authenticated_read" ON customers
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Escrita: usuários autenticados
CREATE POLICY "customers_authenticated_write" ON customers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- POLICIES PARA MÁQUINAS
-- =============================================

-- Todos podem ver máquinas ativas
CREATE POLICY "machines_public_read" ON machines
    FOR SELECT USING (active = true);

-- Apenas usuários autenticados podem modificar
CREATE POLICY "machines_authenticated_write" ON machines
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- POLICIES PARA PEDIDOS
-- =============================================

-- Leitura: usuários autenticados
CREATE POLICY "orders_authenticated_read" ON orders
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Escrita: usuários autenticados
CREATE POLICY "orders_authenticated_write" ON orders
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- POLICIES PARA ITENS DO PEDIDO
-- =============================================

-- Leitura: usuários autenticados
CREATE POLICY "order_items_authenticated_read" ON order_items
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Escrita: usuários autenticados
CREATE POLICY "order_items_authenticated_write" ON order_items
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- POLICIES PARA BOBINAS
-- =============================================

-- Leitura: usuários autenticados
CREATE POLICY "rolls_authenticated_read" ON rolls
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Escrita: usuários autenticados
CREATE POLICY "rolls_authenticated_write" ON rolls
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- POLICIES PARA REGISTROS DE PRODUÇÃO
-- =============================================

-- Leitura: usuários autenticados
CREATE POLICY "production_authenticated_read" ON production_records
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Escrita: usuários autenticados
CREATE POLICY "production_authenticated_write" ON production_records
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para calcular fardos necessários
CREATE OR REPLACE FUNCTION calculate_bundles_needed(
    product_id UUID,
    quantity INTEGER
) RETURNS INTEGER AS $$
DECLARE
    units_per_bundle INTEGER;
BEGIN
    SELECT p.units_per_bundle INTO units_per_bundle
    FROM products p
    WHERE p.id = product_id;
    
    IF units_per_bundle IS NULL OR units_per_bundle = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN CEIL(quantity::DECIMAL / units_per_bundle);
END;
$$ LANGUAGE plpgsql;

-- Função para calcular pacotes necessários
CREATE OR REPLACE FUNCTION calculate_packages_needed(
    product_id UUID,
    quantity INTEGER
) RETURNS INTEGER AS $$
DECLARE
    packages_per_thousand INTEGER;
BEGIN
    SELECT p.packages_per_thousand INTO packages_per_thousand
    FROM products p
    WHERE p.id = product_id;
    
    IF packages_per_thousand IS NULL OR packages_per_thousand = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN CEIL((quantity::DECIMAL / 1000) * packages_per_thousand);
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automaticamente bundles e packages
CREATE OR REPLACE FUNCTION auto_calculate_bundles_packages()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bundles_needed := calculate_bundles_needed(NEW.product_id, NEW.quantity);
    NEW.packages_needed := calculate_packages_needed(NEW.product_id, NEW.quantity);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_bundles_packages
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_bundles_packages();
