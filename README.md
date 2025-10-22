# Glowy - Sistema de Agendamento

Sistema completo de agendamento e gerenciamento de serviços, com suporte para múltiplos ambientes.

## 🌍 Ambientes

- **Localhost**: http://localhost:3000
- **Produção**: https://glowy-six.vercel.app

## 🗄️ Banco de Dados

Este projeto utiliza **PostgreSQL hospedado no Render** como banco de dados de produção.

### ⚠️ Importante
- O projeto está configurado para usar **SEMPRE** o banco de dados de produção
- Todas as operações (desenvolvimento e produção) apontam para o mesmo banco no Render
- Tenha cuidado ao executar migrations ou modificar dados

### 🔧 Configuração

As credenciais do banco estão no arquivo `.env`:

```env
DATABASE_URL="postgresql://glowy_user:BSF9MeJmNfsNy2K17jI989nRYGw20dCa@dpg-d3scg0mr433s73co8ur0-a.oregon-postgres.render.com/glowy"
```

## 🚀 Como Iniciar (Localhost)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar o arquivo de exemplo
cp env.example .env

# Editar o arquivo .env com suas configurações
# Certifique-se de configurar pelo menos:
# - JWT_SECRET
# - DATABASE_URL
# - ABACATEPAY_API_KEY (se usar pagamentos)
```

### 3. Configurar Banco de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrations (se necessário)
npx prisma migrate deploy

# Ou para criar novas migrations em desenvolvimento
npx prisma migrate dev
```

### 4. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Build de Produção (Local)

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm start
```

## ☁️ Deploy no Vercel (Produção)

### Configuração Rápida

1. **Configure as variáveis de ambiente no Vercel**

   Vá para [Vercel Dashboard](https://vercel.com) → Seu Projeto → Settings → Environment Variables

   Variáveis obrigatórias:
   ```
   NODE_ENV=production
   JWT_SECRET=(sua chave segura - use: openssl rand -base64 32)
   DATABASE_URL=(string de conexão PostgreSQL)
   NEXT_PUBLIC_SITE_URL=https://glowy-six.vercel.app
   NEXT_PUBLIC_API_URL=https://glowy-six.vercel.app
   NEXT_PUBLIC_APP_URL=https://glowy-six.vercel.app
   ```

2. **Faça o deploy**

   ```bash
   git push origin main
   ```

   O Vercel fará o deploy automaticamente.

### Documentação Completa

Para instruções detalhadas de configuração no Vercel, veja:
📘 **[VERCEL_SETUP.md](./VERCEL_SETUP.md)**

## 🔧 Configuração de Ambiente

### Variáveis Principais

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | ✅ | Chave secreta para JWT (gere com `openssl rand -base64 32`) |
| `DATABASE_URL` | ✅ | String de conexão PostgreSQL |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL do site (localhost ou produção) |
| `ABACATEPAY_API_KEY` | ⚠️ | Chave API do AbacatePay (se usar pagamentos) |
| `CLOUDINARY_*` | ⚠️ | Credenciais Cloudinary (se usar uploads) |

Veja todas as variáveis em **[env.example](./env.example)**

## 🛠️ Tecnologias

- **Framework**: Next.js 15.5.4
- **Banco de Dados**: PostgreSQL (Render)
- **ORM**: Prisma
- **Autenticação**: JWT com bcrypt/argon2
- **Pagamentos**: AbacatePay / Asaas
- **Upload**: Cloudinary
- **Deploy**: Vercel
- **Mapas**: Google Maps API

## 📚 Documentação Adicional

- `MIGRACAO_POSTGRESQL_RENDER.md` - Detalhes sobre a configuração do banco de dados
- `SETUP_DOCUMENTOS.md` - Sistema de documentos
- `SISTEMA_AVALIACOES_README.md` - Sistema de avaliações
- `WEBHOOK_ABACATEPAY_CONFIG.md` - Configuração de webhooks de pagamento
