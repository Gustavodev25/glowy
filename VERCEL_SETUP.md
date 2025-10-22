# Configuração do Vercel para Glowy

Este guia mostra como configurar todas as variáveis de ambiente no Vercel para fazer o deploy da aplicação.

## 🚀 Passo a Passo

### 1. Acesse o Dashboard do Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login e selecione seu projeto **glowy-six**
3. Vá em **Settings** → **Environment Variables**

### 2. Configure as Variáveis de Ambiente

Adicione as seguintes variáveis (uma por vez):

#### ⚙️ Ambiente e URLs

```
NODE_ENV = production
NEXT_PUBLIC_SITE_URL = https://glowy-six.vercel.app
NEXT_PUBLIC_API_URL = https://glowy-six.vercel.app
NEXT_PUBLIC_APP_URL = https://glowy-six.vercel.app
```

#### 🗄️ Banco de Dados

```
DATABASE_URL = postgresql://glowy_user:BSF9MeJmNfsNy2K17jI989nRYGw20dCa@dpg-d3scg0mr433s73co8ur0-a.oregon-postgres.render.com/glowy
```

#### 🔐 Segurança (JWT)

**IMPORTANTE:** Gere uma nova chave JWT segura para produção:

```bash
# No terminal, execute:
openssl rand -base64 32
```

Depois adicione no Vercel:

```
JWT_SECRET = (cole a chave gerada aqui)
```

#### 💳 Pagamentos - AbacatePay

```
ABACATEPAY_API_KEY = abc_dev_s1wT52gBy1p21pRZwUG5jb3r
ABACATEPAY_WEBHOOK_SECRET = (seu secret aqui)
```

#### 💳 Pagamentos - Asaas (Opcional)

Se estiver usando Asaas, adicione:

```
ASAAS_API_KEY = (sua chave aqui)
ASAAS_WEBHOOK_TOKEN = (seu token aqui)
ASAAS_SANDBOX = true
```

#### 📱 WhatsApp/Twilio (Opcional)

Se estiver usando 2FA via WhatsApp:

```
TWILIO_ACCOUNT_SID = (seu account sid)
TWILIO_AUTH_TOKEN = (seu auth token)
TWILIO_WHATSAPP_FROM = whatsapp:+14155238886
```

#### ☁️ Cloudinary (Upload de Imagens)

```
CLOUDINARY_CLOUD_NAME = dp2sdnsqf
CLOUDINARY_API_KEY = (sua api key)
CLOUDINARY_API_SECRET = (seu api secret)
```

#### 🗺️ Google Maps

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
```

### 3. Configurações Adicionais do Vercel

#### Build & Development Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

#### Root Directory

- Deixe em branco ou configure para o diretório raiz do projeto

### 4. Faça o Deploy

Após configurar todas as variáveis:

1. Clique em **Save** para cada variável
2. Vá para a aba **Deployments**
3. Clique em **Redeploy** no último deployment
4. Aguarde o build completar

## ✅ Checklist de Verificação

Antes de fazer o deploy, verifique:

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] JWT_SECRET foi alterado para uma chave segura de produção
- [ ] URLs apontam para https://glowy-six.vercel.app
- [ ] DATABASE_URL está correto e acessível
- [ ] Chaves de API estão corretas (AbacatePay, Cloudinary, etc)

## 🐛 Resolução de Problemas

### Erro 500 no Login

**Causa:** Geralmente acontece quando:
- JWT_SECRET não está configurado
- DATABASE_URL está incorreto
- Alguma dependência não foi instalada corretamente

**Solução:**
1. Verifique se JWT_SECRET está configurado no Vercel
2. Teste a conexão com o banco de dados
3. Verifique os logs do Vercel em **Deployments** → **Functions**

### Erro de CORS

**Causa:** URLs mal configuradas

**Solução:**
1. Verifique se NEXT_PUBLIC_SITE_URL está correto
2. Certifique-se de que todas as URLs usam `https://` em produção

### Build Falha

**Causa:** Dependências faltando ou erros de TypeScript

**Solução:**
1. Execute `npm run build` localmente para verificar
2. Verifique os logs de build no Vercel
3. Certifique-se de que todas as dependências estão no package.json

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs em **Vercel Dashboard** → **Deployments** → **Functions**
2. Teste localmente com as mesmas variáveis de ambiente
3. Verifique se todas as variáveis estão salvas corretamente

## 🔄 Atualizando Variáveis

Para atualizar uma variável:

1. Vá em **Settings** → **Environment Variables**
2. Clique no ícone de editar (✏️) na variável
3. Atualize o valor
4. Salve e faça **Redeploy**

---

✨ Após seguir todos os passos, sua aplicação estará rodando em produção no Vercel!
