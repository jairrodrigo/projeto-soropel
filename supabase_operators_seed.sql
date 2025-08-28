-- =============================================
-- DADOS INICIAIS PARA TABELA DE OPERADORES
-- =============================================

-- Inserir operadores de exemplo para testes
INSERT INTO operators (name, cpf, phone, email, role, shift, machine_ids, active) VALUES
('João Silva', '123.456.789-01', '(11) 99999-1111', 'joao.silva@soropel.com', 'operador', 'manha', ARRAY[1, 2], true),
('Maria Santos', '234.567.890-12', '(11) 99999-2222', 'maria.santos@soropel.com', 'supervisor', 'tarde', ARRAY[1, 2, 3, 4], true),
('Carlos Oliveira', '345.678.901-23', '(11) 99999-3333', 'carlos.oliveira@soropel.com', 'operador', 'noite', ARRAY[3, 4], true),
('Ana Costa', '456.789.012-34', '(11) 99999-4444', 'ana.costa@soropel.com', 'tecnico', 'integral', ARRAY[1, 2, 3, 4], true),
('Pedro Ferreira', '567.890.123-45', '(11) 99999-5555', 'pedro.ferreira@soropel.com', 'operador', 'manha', ARRAY[1], true),
('Lucia Rodrigues', '678.901.234-56', '(11) 99999-6666', 'lucia.rodrigues@soropel.com', 'lider', 'tarde', ARRAY[1, 2, 3, 4], true),
('Roberto Lima', '789.012.345-67', '(11) 99999-7777', 'roberto.lima@soropel.com', 'operador', 'noite', ARRAY[2, 3], true),
('Fernanda Alves', '890.123.456-78', '(11) 99999-8888', 'fernanda.alves@soropel.com', 'operador', 'manha', ARRAY[4], true);

-- Verificar se os dados foram inseridos corretamente
SELECT 
  name,
  role,
  shift,
  machine_ids,
  active,
  created_at
FROM operators
ORDER BY name;