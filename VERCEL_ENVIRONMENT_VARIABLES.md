# 🔐 Variáveis de Ambiente para Vercel - Glowy

## ⚡ Configuração Rápida

Copie e cole estas variáveis no painel de **Environment Variables** do Vercel.

---

## 📋 Variáveis Obrigatórias

### 🌐 Ambiente e URLs
```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_API_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### 🗄️ Banco de Dados PostgreSQL (Render)
```bash
DATABASE_URL=postgresql://glowy_user:BSF9MeJmNfsNy2K17jI989nRYGw20dCa@dpg-d3scg0mr433s73co8ur0-a.oregon-postgres.render.com/glowy
```

### 🔒 JWT Segurança
```bash
JWT_SECRET=sua_chave_jwt_super_segura_aqui_123456789_altere_em_producao
```
> ⚠️ **IMPORTANTE:** Gere uma nova chave segura com: `openssl rand -base64 32`

---

## 💰 Pagamentos - AbacatePay (PRINCIPAL)

### 🥑 Variáveis do AbacatePay
```bash
ABACATEPAY_API_KEY=abc_dev_s1wT52gBy1p21pRZwUG5jb3r
ABACATEPAY_WEBHOOK_SECRET=seu_secret_super_seguro_aqui
```

### 📍 Onde encontrar suas credenciais:
1. Acesse: https://dashboard.abacatepay.com/
2. Vá em **Configurações** → **API Keys**
3. Copie sua `API Key` (começa com `abc_`)
4. Em **Webhooks**, copie o `Webhook Secret`

### 🔔 Configurar Webhook no Dashboard:
- **URL do Webhook:** `https://seu-dominio.vercel.app/api/webhooks/abacatepay`
- **Eventos:** Marque todos os eventos de pagamento
- **Secret:** Use o mesmo valor de `ABACATEPAY_WEBHOOK_SECRET`

---

## 🖼️ Upload de Imagens - Cloudinary

### ☁️ Variáveis do Cloudinary
```bash
CLOUDINARY_CLOUD_NAME=dp2sdnsqf
CLOUDINARY_API_KEY=SUA_API_KEY_AQUI
CLOUDINARY_API_SECRET=SEU_API_SECRET_AQUI
```

### 📍 Onde encontrar suas credenciais:
1. Acesse: https://cloudinary.com/console
2. No Dashboard, você verá:
   - **Cloud Name:** `dp2sdnsqf` (já configurado)
   - **API Key:** Um número longo (cole no lugar de `SUA_API_KEY_AQUI`)
   - **API Secret:** Uma string alfanumérica (clique no ícone de olho para revelar)

### 🎨 Recursos utilizados:
- Upload de logos de empresas (400x400)
- Upload de banners (1200x300)
- Upload de imagens de serviços (400x400)
- Transformação automática de imagens
- Otimização de qualidade e formato

---

## 🗺️ Google Maps API

### 📍 Variável do Google Maps
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
```

### 🔧 Onde encontrar sua chave:
1. Acesse: https://console.cloud.google.com/
2. Vá em **APIs & Services** → **Credentials**
3. Crie ou copie uma **API Key**
4. Ative as seguintes APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

---

## 🔧 Variáveis Opcionais

### 📲 WhatsApp/SMS (Twilio) - Para 2FA
```bash
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```
> Necessário apenas se estiver usando autenticação 2FA via WhatsApp

### 💳 Asaas (Sistema Legado) - Opcional
```bash
ASAAS_API_KEY=$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojc5NDQwMDE5LWE2ZjMtNGQ3Mi1iMDY1LTI4NzJhNTY1OTY3Yjo6JGFhY2hfMDUyMTE0ZWMtZWJmYy00NDc1LWIxODQtNjNhMmQ0NTgzOGYx
ASAAS_WEBHOOK_TOKEN=seu_token_webhook_seguro_aqui
ASAAS_SANDBOX=true
```
> Use apenas se ainda estiver usando o Asaas

### 🐛 Debug
```bash
DEBUG=false
```

---

## 📦 Como adicionar no Vercel

### Via Dashboard:
1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Clique em **Add**
4. Cole o nome e valor de cada variável
5. Selecione os ambientes: **Production**, **Preview**, **Development**
6. Clique em **Save**

### Via Vercel CLI:
```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login
vercel login

# Adicionar variáveis
vercel env add ABACATEPAY_API_KEY
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
# ... e assim por diante
```

---

## ✅ Checklist de Configuração

- [ ] Todas as variáveis obrigatórias adicionadas
- [ ] AbacatePay configurado com API Key e Webhook Secret
- [ ] Cloudinary configurado com API Key e API Secret
- [ ] Webhook do AbacatePay configurado no dashboard
- [ ] Google Maps API Key configurada
- [ ] JWT Secret gerado com segurança
- [ ] URLs atualizadas para o domínio de produção
- [ ] Deploy realizado no Vercel
- [ ] Teste de pagamento realizado
- [ ] Teste de upload de imagens realizado

---

## 🚨 Segurança

### ⚠️ IMPORTANTE:
1. **NUNCA** commite o arquivo `.env` no Git
2. **SEMPRE** gere um novo `JWT_SECRET` para produção
3. **SEMPRE** use secrets diferentes para desenvolvimento e produção
4. **VERIFIQUE** se o arquivo `.gitignore` contém `.env*`

### 🔐 Boas Práticas:
- Use variáveis diferentes entre ambientes (dev/staging/prod)
- Rotacione secrets periodicamente
- Limite permissões das API Keys quando possível
- Monitore logs de acesso às APIs

---

## 🆘 Problemas Comuns

### ❌ Erro: "ABACATEPAY_API_KEY não encontrada"
- Verifique se a variável está adicionada no Vercel
- Certifique-se de que o deploy foi feito APÓS adicionar as variáveis
- Tente fazer um novo deploy: `vercel --prod`

### ❌ Erro: "Cloudinary upload failed"
- Verifique se todas as 3 variáveis do Cloudinary estão corretas
- Teste as credenciais no console do Cloudinary
- Verifique se o Cloud Name está correto: `dp2sdnsqf`

### ❌ Erro: "Database connection failed"
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que o banco do Render está ativo
- Execute as migrations: `npm run db:push`

---

## 📞 Suporte

- **AbacatePay:** https://abacatepay.com/docs
- **Cloudinary:** https://cloudinary.com/documentation
- **Vercel:** https://vercel.com/docs/environment-variables

---

*Última atualização: 22/10/2025*
