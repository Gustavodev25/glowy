# Migração do Asaas para AbacatePay

## Comandos para aplicar a migração

Execute os seguintes comandos no terminal:

```bash
# 1. Gerar a migração
npx prisma migrate dev --name rename_asaas_to_abacatepay

# 2. Aplicar a migração
npx prisma migrate deploy

# 3. Gerar o Prisma Client atualizado
npx prisma generate
```

## O que foi alterado?

### User model
- `asaasCustomerId` → `abacatePayCustomerId` (com mapping `abacatepay_customer_id`)

### Subscription model
- `asaasId` → `abacatePayId` (com mapping `abacatepay_id`)
- Adicionada lógica de cálculo automático de `nextDueDate`:
  - MONTHLY: +1 mês
  - YEARLY: +1 ano
- Campo `startDate` agora é preenchido automaticamente

### Payment model
- `asaasId` → `abacatePayId` (com mapping `abacatepay_id`)
- `pixQrCode` e `pixCopyPaste` agora são `@db.Text` para suportar strings grandes

### PaymentMethod model
- `asaasCardToken` → `abacatePayCardToken` (com mapping `abacatepay_card_token`)

## Notas Importantes

1. **Compatibilidade**: O Prisma irá renomear as colunas automaticamente usando o `@map()` directive
2. **Dados Existentes**: Dados existentes serão preservados durante a migração
3. **Rollback**: Se necessário, você pode reverter usando `npx prisma migrate resolve --rolled-back <migration_name>`

## Verificação Pós-Migração

Execute para verificar se tudo está correto:

```bash
# Verificar status das migrações
npx prisma migrate status

# Visualizar o banco de dados
npx prisma studio
```
