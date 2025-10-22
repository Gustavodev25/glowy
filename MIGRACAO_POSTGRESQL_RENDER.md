# 🗄️ Migração para PostgreSQL no Render

## ✅ Alterações Realizadas

O projeto foi configurado para usar o banco de dados PostgreSQL hospedado no Render.

### 📝 Arquivo `env.example` Atualizado

A DATABASE_URL foi configurada permanentemente com as credenciais do Render (Produção):

```env
DATABASE_URL="postgresql://glowy_user:BSF9MeJmNfsNy2K17jI989nRYGw20dCa@dpg-d3scg0mr433s73co8ur0-a.oregon-postgres.render.com/glowy"
```

**Nota**: O projeto está configurado para usar SEMPRE o banco de produção do Render.

### 📊 Informações do Banco de Dados

- **Hostname**: `dpg-d3scg0mr433s73co8ur0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Database**: `glowy`
- **Username**: `glowy_user`
- **Password**: `BSF9MeJmNfsNy2K17jI989nRYGw20dCa`

## 🚀 Próximos Passos (Execute nesta ordem)

### 1. Atualizar o arquivo `.env` local

Abra o arquivo `.env` na raiz do projeto e atualize a linha `DATABASE_URL`:

```env
DATABASE_URL="postgresql://glowy_user:BSF9MeJmNfsNy2K17jI989nRYGw20dCa@dpg-d3scg0mr433s73co8ur0-a.oregon-postgres.render.com/glowy"
```

### 2. Executar as migrations no novo banco

Execute o seguinte comando para criar todas as tabelas no banco do Render:

```bash
npx prisma migrate deploy
```

**Ou, se estiver em desenvolvimento:**

```bash
npx prisma migrate dev
```

### 3. Regenerar o Prisma Client

```bash
npx prisma generate
```

### 4. (Opcional) Popular o banco com dados iniciais

Se você tiver um script de seed:

```bash
npm run prisma:seed
```

### 5. Reiniciar o servidor de desenvolvimento

```bash
npm run dev
```

## 🔍 Verificação

Para verificar se a conexão está funcionando:

1. **Teste a conexão do Prisma:**
   ```bash
   npx prisma db pull
   ```

2. **Acesse o Prisma Studio:**
   ```bash
   npx prisma studio
   ```

3. **Verifique no terminal do servidor:**
   - Procure por mensagens de erro relacionadas ao banco de dados
   - Teste fazendo login ou criando um registro

## 🔐 Conectar Diretamente ao Banco (Opcional)

Se precisar acessar o banco diretamente via `psql`:

```bash
PGPASSWORD=BSF9MeJmNfsNy2K17jI989nRYGw20dCa psql -h dpg-d3scg0mr433s73co8ur0-a.oregon-postgres.render.com -U glowy_user glowy
```

## ⚠️ Importante

1. **Banco de Produção**: O projeto está configurado para usar SEMPRE o banco de dados de produção no Render
2. **Cuidado com Dados**: Qualquer alteração será feita diretamente no banco de produção
3. **Migrations**: Todas as migrations existentes em `prisma/migrations/` serão aplicadas no banco de produção
4. **Segurança**: Mantenha as credenciais seguras e não as commite no git
5. **Backup**: Considere fazer backups regulares dos dados de produção

## 🐛 Troubleshooting

### Erro: "Can't reach database server"

- Verifique sua conexão com a internet
- Confirme que o servidor Render está ativo
- Verifique se não há firewall bloqueando a porta 5432

### Erro: "Authentication failed"

- Confirme que copiou corretamente a senha do DATABASE_URL
- Verifique se não há espaços extras na string de conexão

### Erro: "relation does not exist"

- Execute `npx prisma migrate deploy` para criar as tabelas
- Verifique se as migrations foram aplicadas com sucesso

## 📚 Recursos Adicionais

- [Documentação do Prisma](https://www.prisma.io/docs)
- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## ✅ Status da Migração

- ✅ Arquivo `env.example` atualizado
- ✅ Schema do Prisma já configurado para PostgreSQL
- ✅ Scripts do projeto usando variáveis de ambiente
- ⏳ **Próximo**: Atualizar `.env` e executar migrations
