# 🚀 Deployment - Sistema Soropel

## 📋 Visão Geral

Este projeto utiliza **GitHub Actions** para CI/CD automatizado, executando testes e builds a cada push ou pull request.

## 🌍 Ambientes

### 🟢 **Desenvolvimento Local**
- **URL:** `http://localhost:3000`
- **Comando:** `npm run dev`

### 🔵 **GitHub Actions CI/CD**
- **Triggers:** Push e Pull Request para `main` e `develop`
- **Workflow:** Testes TypeScript + Build automático
- **Status:** ✅ Configurado

## 🔄 Workflow de Desenvolvimento

### 🆕 **Nova Feature**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade
# ... desenvolvimento ...
git add .
git commit -m "feat: Nova funcionalidade"
git push origin feature/nova-funcionalidade
# Criar Pull Request para develop
```

### 🚨 **Correção Urgente**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/correcao-urgente
# ... correção ...
git add .
git commit -m "fix: Correção urgente"
git push origin hotfix/correcao-urgente
# Criar Pull Request para main
```

## ⚙️ GitHub Actions

### 📁 **Arquivo de Configuração**
- **Local:** `.github/workflows/deploy.yml`
- **Nome:** `🚀 CI/CD Sistema Soropel`

### 🔧 **Jobs Configurados**

#### 🧪 **test-and-build**
- ✅ Checkout do código
- ✅ Setup Node.js 18
- ✅ Instalação de dependências
- ✅ Verificação TypeScript
- ✅ Build do projeto
- ✅ Análise do tamanho do build

## 🛠️ Comandos Úteis

### 🏠 **Desenvolvimento Local**
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Verificação TypeScript
npx tsc --noEmit
```

### 📊 **Monitoramento**
```bash
# Verificar status do último commit
git log --oneline -5

# Ver diferenças
git status

# Verificar branches
git branch -a
```

## 🔍 Monitoramento

### 📈 **GitHub Actions**
- **URL:** `https://github.com/jairrodrigo/projeto-soropel/actions`
- **Status:** Visível em cada commit
- **Logs:** Disponíveis para debug

### 📊 **Build Status**
- ✅ **Sucesso:** Build completo sem erros
- ❌ **Falha:** Verificar logs no GitHub Actions
- 🟡 **Em Progresso:** Aguardar conclusão

## 🎯 Próximos Passos

1. **✅ CI/CD Configurado** - GitHub Actions funcionando
2. **🔄 Workflow Estabelecido** - Branches e PRs organizados
3. **📊 Monitoramento Ativo** - Logs e status visíveis

---

## 📝 Notas Importantes

- **Branches principais:** `main` (produção) e `develop` (desenvolvimento)
- **Pull Requests:** Obrigatórios para mudanças importantes
- **Testes automáticos:** Executados a cada push
- **Build verification:** Garantia de código funcional

---

*Última atualização: 2025-01-26*
