-- =============================================
-- TABELA DE OPERADORES - Sistema Soropel
-- Adicionar ao schema existente do Supabase
-- =============================================

-- 8. TABELA DE OPERADORES
-- =============================================
CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- DADOS PESSOAIS
  name TEXT NOT NULL,
  cpf TEXT UNIQUE, -- CPF único, opcional
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
  machine_ids INTEGER[], -- Ex: [1, 2, 3] para máquinas 1, 2 e 3
  
  -- CONTROLE
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Operadores
CREATE INDEX idx_operators_name ON operators(name);
CREATE INDEX idx_operators_cpf ON operators(cpf);
CREATE INDEX idx_operators_role ON operators(role);
CREATE INDEX idx_operators_shift ON operators(shift);
CREATE INDEX idx_operators_active ON operators(active);
CREATE INDEX idx_operators_machine_ids ON operators USING GIN(machine_ids);

-- =============================================
-- TRIGGER PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DADOS INICIAIS (EXEMPLOS)
-- =============================================

INSERT INTO operators (name, cpf, phone, role, shift, machine_ids) VALUES
('João Silva', '12345678901', '(11) 99999-1111', 'operador', 'manha', ARRAY[1, 2, 3]),
('Maria Santos', '23456789012', '(11) 99999-2222', 'operador', 'tarde', ARRAY[4, 5, 6]),
('Carlos Oliveira', '34567890123', '(11) 99999-3333', 'supervisor', 'manha', ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9]),
('Ana Costa', '45678901234', '(11) 99999-4444', 'operador', 'noite', ARRAY[7, 8]),
('Pedro Souza', '56789012345', '(11) 99999-5555', 'tecnico', 'integral', ARRAY[9]),
('Lucia Ferreira', '67890123456', '(11) 99999-6666', 'operador', 'manha', ARRAY[1, 2]),
('Roberto Lima', '78901234567', '(11) 99999-7777', 'manutencao', 'integral', ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9]),
('Fernanda Alves', '89012345678', '(11) 99999-8888', 'operador', 'tarde', ARRAY[3, 4, 5]);

-- =============================================
-- COMENTÁRIOS DA TABELA
-- =============================================

COMMENT ON TABLE operators IS 'Tabela de operadores do sistema Soropel';
COMMENT ON COLUMN operators.name IS 'Nome completo do operador';
COMMENT ON COLUMN operators.cpf IS 'CPF do operador (único, opcional)';
COMMENT ON COLUMN operators.role IS 'Função: operador, supervisor, tecnico, manutencao';
COMMENT ON COLUMN operators.shift IS 'Turno: manha, tarde, noite, integral';
COMMENT ON COLUMN operators.machine_ids IS 'Array com IDs das máquinas que pode operar';
COMMENT ON COLUMN operators.active IS 'Se o operador está ativo no sistema';

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View: Operadores por turno
CREATE VIEW operators_by_shift AS
SELECT 
  shift,
  COUNT(*) as total_operators,
  COUNT(*) FILTER (WHERE active = true) as active_operators,
  array_agg(name ORDER BY name) FILTER (WHERE active = true) as operator_names
FROM operators
GROUP BY shift
ORDER BY shift;

-- View: Operadores por função
CREATE VIEW operators_by_role AS
SELECT 
  role,
  COUNT(*) as total_operators,
  COUNT(*) FILTER (WHERE active = true) as active_operators,
  array_agg(name ORDER BY name) FILTER (WHERE active = true) as operator_names
FROM operators
GROUP BY role
ORDER BY role;

-- View: Operadores por máquina
CREATE VIEW operators_by_machine AS
SELECT 
  machine_id,
  COUNT(*) as total_operators,
  array_agg(o.name ORDER BY o.name) as operator_names,
  array_agg(o.role ORDER BY o.name) as operator_roles
FROM operators o,
     unnest(o.machine_ids) as machine_id
WHERE o.active = true
GROUP BY machine_id
ORDER BY machine_id;

COMMENT ON VIEW operators_by_shift IS 'Operadores agrupados por turno';
COMMENT ON VIEW operators_by_role IS 'Operadores agrupados por função';
COMMENT ON VIEW operators_by_machine IS 'Operadores agrupados por máquina que podem operar';