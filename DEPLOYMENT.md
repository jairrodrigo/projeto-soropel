# 🚀 **DEPLOYMENT GUIDE - SISTEMA SOROPEL**

## 🌐 **AMBIENTES CONFIGURADOS**

### **📊 ESTRUTURA PROFISSIONAL:**
```
🟢 PRODUÇÃO:  https://sistema-soropel.vercel.app
               ↑ main branch (releases estáveis)

🟡 STAGING:    https://sistema-soropel-staging.vercel.app  
               ↑ develop branch (testes antes da produção)

🔵 PREVIEWS:   URLs únicas para cada Pull Request
               ↑ feature branches (review de código)
```

## 🔄 **WORKFLOW DE DESENVOLVIMENTO**

### **🚀 PARA NOVAS FUNCIONALIDADES:**
```bash
1. git checkout develop
2. git pull origin develop
3. git checkout -b feature/nome-da-funcionalidade
4. # desenvolvimento...
5. git add . && git commit -m "feat: nova funcionalidade"
6. git push origin feature/nome-da-funcionalidade
7. # Criar PR: feature → develop
8. # Review da equipe + teste na URL de preview
9. # Merge para develop (vai para staging)
10. # Testar em staging
11. # PR develop → main (vai para produção)
```

### **🔧 PARA CORREÇÕES URGENTES:**
```bash
1. git checkout main
2. git checkout -b hotfix/correcao-urgente
3. # correção...
4. git add . && git commit -m "fix: correção crítica"
5. # PR direto para main
6. # Cherry-pick para develop
```

## ⚙️ **CONFIGURAÇÃO NO VERCEL**

### **🎯 SETUP INICIAL:**

#### **1. Conectar Repositório:**
- GitHub → Vercel Dashboard
- Import Repository: `jairrodrigo/sistema-soropel`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

#### **2. Configurar Domínios:**
```
🟢 Production Domain:  sistema-soropel.vercel.app
🟡 Staging Domain:     sistema-soropel-staging.vercel.app
```

#### **3. Branch Configuration:**
```
🟢 main → Production deployment
🟡 develop → Staging deployment  
🔵 feature/* → Preview deployments
```

#### **4. Environment Variables:**
```bash
# Production (main branch)
VITE_APP_ENVIRONMENT=production
VITE_API_URL=https://api.sistema-soropel.com
VITE_DEBUG_MODE=false

# Staging (develop branch)  
VITE_APP_ENVIRONMENT=staging
VITE_API_URL=https://staging-api.sistema-soropel.com
VITE_DEBUG_MODE=true
```

## 🤖 **CI/CD AUTOMÁTICO**

### **✅ GITHUB ACTIONS CONFIGURADO:**
- **Testes automáticos** em cada push
- **Build verification** 
- **TypeScript check**
- **Deploy automático** por branch
- **PR previews** com comentários automáticos

### **🔍 CHECKS AUTOMÁTICOS:**
```yaml
✅ TypeScript compilation
✅ Build success
✅ Bundle size analysis
✅ Code quality
```

## 📋 **COMANDOS ÚTEIS**

### **🏠 LOCAL DEVELOPMENT:**
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run type-check   # Verificar TypeScript
```

### **🌐 VERCEL CLI (opcional):**
```bash
npx vercel          # Deploy manual
npx vercel --prod   # Deploy para produção
npx vercel dev      # Desenvolvimento local com Vercel
```

## 🔐 **SECRETS NECESSÁRIOS**

### **📝 GITHUB SECRETS (para CI/CD):**
```
VERCEL_TOKEN=         # Token da sua conta Vercel
ORG_ID=              # ID da organização Vercel
PROJECT_ID=          # ID do projeto Vercel
```

### **🎯 COMO OBTER:**
1. **Vercel Token**: Settings → Tokens → Create
2. **ORG_ID**: Vercel CLI → `npx vercel link`
3. **PROJECT_ID**: Vercel CLI → `npx vercel link`

## 📊 **MONITORAMENTO**

### **🔍 LOGS & ANALYTICS:**
- **Vercel Dashboard**: Deploy logs e performance
- **GitHub Actions**: Build status e testes
- **Vercel Analytics**: Visitors e Core Web Vitals

### **🚨 ALERTAS:**
- **Failed builds** → Email notifications
- **Performance issues** → Vercel insights
- **Error tracking** → Console do browser

## 🎯 **BEST PRACTICES**

### **✅ ANTES DE FAZER MERGE:**
- ✅ Testar localmente (`npm run build`)
- ✅ Verificar TypeScript (`npx tsc --noEmit`)
- ✅ Review do código
- ✅ Testar na URL de preview
- ✅ Confirmar funcionalidades principais

### **🔄 DEPLOY STRATEGY:**
1. **Feature** → develop (staging)
2. **Test** em staging
3. **Approve** → main (production)
4. **Monitor** performance e errors

---

## 🎉 **RESULTADO FINAL**

**🌐 URLs DO PROJETO:**
- **Produção**: `https://sistema-soropel.vercel.app`
- **Staging**: `https://sistema-soropel-staging.vercel.app`
- **Previews**: URLs únicas para cada PR

**🚀 WORKFLOW PROFISSIONAL COMPLETO CONFIGURADO! 🎯**
