# 🏭 Sistema Soropel

Sistema de gestão industrial moderno para controle de produção, máquinas e bobinas de papel. Desenvolvido com foco na **produtividade**, **eficiência operacional** e **experiência do usuário**.

## 🎯 Visão Geral

O Sistema Soropel é uma aplicação web completa que centraliza e otimiza o controle de:
- **Gestão de Pedidos** - Controle completo do fluxo de produção
- **Nova Bobina** - Cadastro automatizado via OCR inteligente
- **Gestão de Máquinas** - Monitoramento em tempo real de 9 máquinas
- **Dashboard** - Métricas e indicadores de performance

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos

### Estado e Dados
- **Zustand** - Gerenciamento de estado global
- **Supabase** - Backend-as-a-Service (PostgreSQL)
- **React Router DOM** - Roteamento

### Funcionalidades Avançadas
- **OpenAI Vision API** - OCR inteligente para bobinas
- **Real-time subscriptions** - Atualizações em tempo real
- **PWA Ready** - Instalável como app nativo

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React organizados por feature
│   ├── dashboard/       # Componentes do dashboard
│   ├── gestao-maquinas/ # Gestão de máquinas
│   ├── gestao-pedidos/  # Gestão de pedidos
│   ├── nova-bobina/     # Sistema de OCR para bobinas
│   ├── novo-pedido/     # Criação de pedidos
│   ├── layout/          # Layout e navegação
│   └── ui/              # Componentes base reutilizáveis
├── hooks/               # Custom hooks
├── pages/               # Páginas principais
├── services/            # Camada de serviços (API/Supabase)
├── stores/              # Stores Zustand
├── types/               # Definições TypeScript
└── utils/               # Utilitários e helpers
```

## 🏗️ Arquitetura

### Padrões Utilizados
- **Component-Based Architecture** - Componentes modulares e reutilizáveis
- **Custom Hooks Pattern** - Lógica de negócio encapsulada
- **Service Layer Pattern** - Separação entre UI e dados
- **Store Pattern** - Estado global com Zustand
- **TypeScript First** - Tipagem rigorosa em todo o projeto

### Fluxo de Dados
```
UI Components → Custom Hooks → Services → Supabase
     ↓              ↓           ↓
   Stores ←    Real-time ←  Database
```

## 🎨 Funcionalidades Principais

### 📊 Dashboard
- **Métricas em tempo real** - Pedidos, máquinas, produção
- **Indicadores de performance** - Eficiência e metas
- **Alertas inteligentes** - Notificações críticas
- **Gráficos interativos** - Visualização de dados

### 📋 Gestão de Pedidos
- **Controle completo** - Do recebimento à entrega
- **Sistema de prioridades** - Urgente, especial, normal
- **Separação automática** - Sugestões inteligentes de máquina/bobina
- **Acompanhamento real-time** - Status atualizado automaticamente

### 🎥 Nova Bobina (OCR Inteligente)
- **Captura automática** - Câmera ou upload de imagem
- **OCR avançado** - Extração via OpenAI Vision API
- **Validação inteligente** - Auto-complete e sugestões
- **Cadastro em 30 segundos** - Processo otimizado

### ⚙️ Gestão de Máquinas
- **Monitoramento real-time** - Status de 9 máquinas
- **Controle de produção** - Progresso e eficiência
- **Planejamento semanal** - Distribuição otimizada
- **Sistema IoT** - Integração com sensores

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Chave OpenAI (para OCR)

### 1. Clone o repositório
```bash
git clone [url-do-repositorio]
cd projeto-soropel
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Aplicação
VITE_APP_NAME=Sistema Soropel
VITE_APP_VERSION=1.0.0

# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# OpenAI (para OCR)
VITE_OPENAI_API_KEY=sua_chave_openai

# URLs da API
VITE_API_URL=http://localhost:3000/api
VITE_WEBHOOK_URL=http://localhost:3000/webhook
```

### 4. Configure o banco de dados
Execute o schema SQL no Supabase:
```bash
# Importe o arquivo supabase_schema.sql no seu projeto Supabase
```

### 5. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📊 Schema do Banco de Dados

### Principais Tabelas
- **products** - Catálogo de produtos
- **customers** - Clientes
- **orders** - Pedidos de produção
- **order_items** - Itens dos pedidos
- **rolls** - Bobinas de papel
- **machines** - Máquinas de produção
- **production_records** - Registros de produção
- **operators** - Operadores das máquinas

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para produção
npm run preview      # Preview do build

# Qualidade
npm run lint         # Executa ESLint
```

## 🌟 Funcionalidades Avançadas

### OCR Inteligente
- Reconhecimento automático de etiquetas de bobinas
- Extração de dados estruturados (código, tipo, gramatura, fornecedor)
- Validação automática e sugestões inteligentes

### Real-time Updates
- Sincronização automática entre usuários
- Notificações push para eventos críticos
- Atualizações de status em tempo real

### Mobile-First Design
- Interface responsiva otimizada para mobile
- Touch-friendly controls
- PWA com capacidade offline

### Sistema IoT
- Integração com sensores das máquinas
- Coleta automática de dados de produção
- Alertas baseados em telemetria

## 📱 Páginas Principais

### 🏠 Dashboard
- Visão geral do sistema
- Métricas de produção
- Alertas e notificações

### 📋 Gestão de Pedidos
- Lista de pedidos ativos
- Sistema de filtros avançados
- Separação e distribuição

### 🎥 Nova Bobina
- Captura via câmera/upload
- OCR automático
- Cadastro simplificado

### ⚙️ Gestão de Máquinas
- Status das 9 máquinas
- Controle de produção
- Planejamento semanal

### 📦 Novo Pedido
- Criação de pedidos
- Análise de documentos
- Validação automática

## 🔒 Segurança

- **Row Level Security (RLS)** - Políticas de acesso no Supabase
- **Validação de entrada** - Sanitização de dados
- **Autenticação segura** - JWT tokens
- **HTTPS obrigatório** - Comunicação criptografada

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Conecte seu repositório ao Vercel
# Configure as variáveis de ambiente
# Deploy automático a cada push
```

### Build Manual
```bash
npm run build
# Faça upload da pasta dist/ para seu servidor
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: [seu-email]
- 💬 Issues: [link-para-issues]
- 📚 Documentação: [link-para-docs]

---

**Sistema Soropel** - Transformando a gestão industrial com tecnologia moderna 🏭✨