# Glowy - Sistema de Agendamento

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

## 🚀 Como Iniciar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp env.example .env
   ```

3. **Executar migrations** (se necessário):
   ```bash
   npx prisma migrate deploy
   ```

4. **Gerar Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

## 📚 Documentação Adicional

- `MIGRACAO_POSTGRESQL_RENDER.md` - Detalhes sobre a configuração do banco de dados
- `SETUP_DOCUMENTOS.md` - Sistema de documentos
- `SISTEMA_AVALIACOES_README.md` - Sistema de avaliações
- `WEBHOOK_ABACATEPAY_CONFIG.md` - Configuração de webhooks de pagamento
