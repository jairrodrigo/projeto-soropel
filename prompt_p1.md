# Sistema Soropel - Especificações Funcionais das Páginas Principais

## 🎯 Visão Geral do Sistema

O Sistema Soropel é uma aplicação web para gestão de produção industrial, focada na **produtividade** e **eficiência operacional**. Controla bobinas de papel, pedidos de produção e máquinas industriais com foco na **experiência do usuário** e **automação de processos**.

**Stack Técnico**: React + TypeScript + Tailwind CSS + Zustand + Supabase

---

## 📋 PÁGINA 1: GESTÃO DE PEDIDOS

### 🎯 Objetivo Principal
**Centralizar e otimizar o controle de pedidos de produção**, permitindo separação eficiente de produtos, acompanhamento de progresso e gestão de prioridades em tempo real.

### 📊 Funcionalidades Principais

#### **1. Dashboard de Métricas Instantâneas**
- **Total de Pedidos Ativos**: Visão geral da carga de trabalho
- **Pedidos em Produção**: Status atual da linha de produção
- **Pedidos Aguardando**: Fila de trabalho pendente
- **Pedidos Atrasados**: Alertas críticos para ação imediata
- **Pedidos Urgentes**: Priorização visual para decisões rápidas

#### **2. Sistema de Filtros Inteligentes**
- **Busca Unificada**: Por cliente, número do pedido ou produto
- **Filtro por Status**: Aguardando, Produção, Atrasado, Urgente, Finalizado
- **Filtro por Prioridade**: Urgente, Alta, Média, Baixa
- **Limpeza Rápida**: Reset instantâneo de todos os filtros

#### **3. Cards de Pedidos Informativos**
```typescript
interface Pedido {
  numero: string               // "OP-1539" - Identificação única
  cliente: string              // Nome do cliente
  status: PedidoStatus         // Estado atual do pedido
  prioridade: Prioridade       // Nível de urgência
  dataEntrega: string          // Prazo de entrega
  quantidadeTotal: number      // Volume total do pedido
  progresso: number            // Porcentagem concluída
  produtos: Produto[]          // Lista de itens do pedido
  maquinaSugerida: string      // Recomendação de máquina
  bobinaDisponivel: string     // Bobina recomendada
  observacoes: string          // Notas importantes
}

interface Produto {
  nome: string                 // Nome do produto
  pedido: number              // Quantidade solicitada
  separado: number            // Quantidade já separada
  estoque: number             // Disponibilidade em estoque
  progresso: number           // Progresso individual
  unidade: 'MIL' | 'KG' | 'UND' // Unidade de medida
}
```

#### **4. Ações Produtivas por Pedido**
- **Separação Rápida**: Modal para separar produtos com validação de estoque
- **Separação em Lote**: Separar todos os produtos de um pedido simultaneamente
- **Edição Dinâmica**: Modificar dados do pedido em tempo real
- **Visualização Completa**: Modal com todos os detalhes e histórico
- **Finalização**: Marcar pedido como concluído

### 🚀 Benefícios para Produtividade
- **Redução de Erros**: Validação automática de estoque
- **Priorização Visual**: Status coloridos para decisões rápidas
- **Acompanhamento Real-time**: Progresso atualizado automaticamente
- **Otimização de Recursos**: Sugestões de máquina e bobina
- **Histórico Completo**: Rastreabilidade total do processo

---

## 🎥 PÁGINA 2: NOVA BOBINA (OCR INTELIGENTE)

### 🎯 Objetivo Principal
**Automatizar o registro de bobinas** através de reconhecimento inteligente de etiquetas, **eliminando digitação manual** e **reduzindo erros de cadastro**.

### 🤖 Funcionalidades de Automação

#### **1. Captura Inteligente de Dados**
- **Câmera Integrada**: Captura direta via webcam
- **Upload de Arquivo**: Suporte a imagens de etiquetas
- **OCR Avançado**: Reconhecimento via OpenAI Vision API
- **Extração Automática**: Código, tipo de papel, gramatura, fornecedor, peso

#### **2. Formulário Inteligente**
```typescript
interface BobinaFormData {
  codigoBobina: string          // Código único da bobina
  dataEntrada: string           // Data de entrada automática
  tipoPapel: string            // Tipo extraído via OCR
  gramatura: string            // Gramatura identificada
  largura: string              // Largura da bobina
  fornecedor: string           // Fornecedor reconhecido
  pesoInicial: number          // Peso inicial
  pesoAtual: number            // Peso atual (igual ao inicial)
  status: BobinaStatus         // Estado da bobina
  maquinaAtual?: string        // Máquina atribuída (se aplicável)
  produtoProducao?: string     // Produto em produção
  observacoes: string          // Observações adicionais
}
```

#### **3. Controle de Status Dinâmico**
- **Estoque**: Bobina disponível para uso
- **Em Máquina**: Atribuída a máquina específica com produto
- **Sobra**: Resto de produção com peso reduzido
- **Acabou**: Bobina finalizada

#### **4. Validações Inteligentes**
- **Códigos Únicos**: Verificação automática de duplicatas
- **Autocompletar**: Sugestões baseadas em histórico
- **Campos Condicionais**: Formulário adapta-se ao status selecionado
- **Validação de Peso**: Alertas para pesos inconsistentes

### 🚀 Benefícios para Produtividade
- **95% Menos Digitação**: OCR preenche automaticamente os campos
- **Zero Erros de Transcrição**: Eliminação de erros manuais
- **Cadastro em 30 segundos**: Processo otimizado
- **Rastreabilidade Completa**: Histórico desde a entrada
- **Integração Automática**: Sincronização com sistema de máquinas

---

## ⚙️ PÁGINA 3: GESTÃO DE MÁQUINAS

### 🎯 Objetivo Principal
**Monitorar e controlar as 9 máquinas de produção** em tempo real, **otimizando eficiência** e **minimizando tempo de parada**.

### 📊 Funcionalidades de Controle

#### **1. Dashboard de Performance**
- **Máquinas Ativas**: Quantas estão operando vs. total
- **Eficiência Média**: Performance geral da linha
- **Produção Atual**: Volume produzido vs. meta diária
- **Alertas Críticos**: Problemas que requerem atenção imediata

#### **2. Controle Individual por Máquina**
```typescript
interface Machine {
  id: number                    // Número da máquina (1-9)
  name: string                  // Nome identificador
  status: MachineStatus         // Estado operacional
  currentProduct: string        // Produto sendo produzido
  progress: number              // Progresso do pedido atual
  targetProduction: number      // Meta de produção
  currentProduction: number     // Produção atual
  efficiency: number            // Eficiência percentual
  timeRemaining: string         // Tempo estimado para conclusão
  operator?: string             // Operador responsável
  
  // Integração com outros sistemas
  bobina?: BobinaInfo          // Bobina atual em uso
  pedidoAtivo?: PedidoInfo     // Pedido sendo executado
}
```

#### **3. Ações de Controle Rápido**
- **Iniciar/Pausar**: Controle direto do status da máquina
- **Trocar Produto**: Configuração rápida de novo produto
- **Atribuir Operador**: Designação de responsável
- **Configurar Meta**: Ajuste de produção esperada
- **Registrar Manutenção**: Agendar ou executar manutenção

#### **4. Modais de Configuração Avançada**

**Modal de Configuração da Máquina:**
- Seleção de produto atual
- Definição de meta de produção
- Atribuição de operador
- Configuração de parâmetros

**Modal de Planejamento Semanal:**
- Distribuição automática de pedidos
- Otimização de carga de trabalho
- Previsão de entregas
- Balanceamento de máquinas

**Modal de Sistema IoT:**
- Status de conectividade em tempo real
- Leituras de sensores
- Alertas automáticos
- Histórico de performance

### 🚀 Benefícios para Produtividade
- **Visibilidade Total**: Status de todas as máquinas em uma tela
- **Controle Centralizado**: Ações rápidas sem sair da interface
- **Otimização Automática**: Sugestões de distribuição de carga
- **Manutenção Preditiva**: Alertas antes de problemas críticos
- **Eficiência Maximizada**: Monitoramento contínuo de performance

---

## 🔧 FUNCIONALIDADES TRANSVERSAIS

### 📱 Experiência Mobile-First
- **Interface Responsiva**: Funciona perfeitamente em tablets e smartphones
- **Touch Optimized**: Botões e controles otimizados para toque
- **Offline Capability**: Funcionalidades básicas disponíveis sem internet
- **PWA Ready**: Instalável como aplicativo nativo

### ⚡ Performance e Eficiência
- **Carregamento Rápido**: Interface otimizada para velocidade
- **Updates em Tempo Real**: Sincronização automática via WebSocket
- **Cache Inteligente**: Dados frequentes armazenados localmente
- **Lazy Loading**: Carregamento sob demanda de componentes

### 🔄 Integração e Automação
- **Supabase Real-time**: Sincronização automática entre usuários
- **OpenAI Vision**: OCR inteligente para automação
- **Sistema IoT**: Integração com sensores das máquinas
- **Notificações Push**: Alertas importantes em tempo real

### 📊 Analytics e Relatórios
- **Métricas de Produtividade**: KPIs automáticos
- **Relatórios Automáticos**: Geração de relatórios diários/semanais
- **Histórico Completo**: Rastreabilidade de todas as operações
- **Exportação de Dados**: Relatórios em PDF/Excel

---

## 🎯 FLUXOS DE TRABALHO OTIMIZADOS

### 📋 Fluxo: Novo Pedido → Produção
1. **Recebimento**: Pedido registrado no sistema
2. **Análise Automática**: Sistema sugere máquina e bobina
3. **Separação**: Operador separa produtos via interface
4. **Atribuição**: Pedido direcionado para máquina otimizada
5. **Produção**: Acompanhamento em tempo real
6. **Finalização**: Conclusão automática com relatório

### 🎥 Fluxo: Nova Bobina → Estoque
1. **Captura**: Foto da etiqueta via câmera
2. **OCR**: Extração automática de dados
3. **Validação**: Confirmação dos dados extraídos
4. **Registro**: Bobina adicionada ao estoque
5. **Disponibilização**: Bobina disponível para produção

### ⚙️ Fluxo: Controle de Máquinas
1. **Monitoramento**: Status contínuo de todas as máquinas
2. **Detecção**: Alertas automáticos de problemas
3. **Ação**: Intervenção rápida via interface
4. **Otimização**: Redistribuição automática de carga
5. **Relatório**: Análise de performance

---

## 🏗️ ARQUITETURA TÉCNICA FOCADA EM PRODUTIVIDADE

### 📁 Estrutura Modular