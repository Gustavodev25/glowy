# 🔧 Troubleshooting - Pagamento em Tempo Real

## ✅ Correções Implementadas

### 1. **Logs Detalhados Adicionados**
Agora o sistema registra logs completos em cada etapa do processo:

- ✅ **Criação do PIX**: Mostra ID e detalhes do QR Code criado
- ✅ **Webhook**: Exibe payload RAW e PARSED do AbacatePay
- ✅ **Polling**: Mostra resposta completa da API do AbacatePay
- ✅ **Atualização**: Confirma quando pagamento e assinatura são atualizados

### 2. **Normalização da Resposta da API**
O método `getPixQrCodeStatus` foi corrigido para:
- ✅ Normalizar a resposta independente do formato
- ✅ Suportar `response.data` ou `response.data.data`
- ✅ Adicionar logs detalhados da resposta completa

### 3. **Verificação Robusta de Status Pago**
O webhook e polling agora verificam múltiplos valores:
- ✅ `PAID` (maiúsculo)
- ✅ `paid` (minúsculo)
- ✅ `COMPLETED`
- ✅ `CONFIRMED`

### 4. **Busca Alternativa de Pagamento**
Se o pagamento não for encontrado pelo `abacatePayId`, o sistema:
- ✅ Tenta buscar via `metadata.subscriptionId`
- ✅ Busca o pagamento PENDING mais recente
- ✅ Registra logs detalhados de cada tentativa

---

## 🧪 Como Testar Agora

### Teste 1: Verificar Criação do PIX

1. **Gerar um pagamento PIX** no checkout
2. **Verifique os logs do servidor** (terminal onde `npm run dev` está rodando)
3. **Você deve ver**:
```
📤 Criando QR Code PIX no AbacatePay...
✅ Resposta AbacatePay: { status: 200, data: { ... } }
✅ QR Code PIX criado com sucesso!
📊 Detalhes do PIX: {
  id: 'abc123xyz',
  status: 'PENDING',
  expiresAt: '2025-10-19T...',
  amount: 9900
}
💾 Salvando pagamento no banco de dados...
✅ Pagamento salvo com sucesso!
📋 Informações importantes:
  - Payment ID: uuid-payment
  - AbacatePay PIX ID: abc123xyz
  - Subscription ID: uuid-subscription

⏰ Para testar o pagamento:
  1. Vá ao painel do AbacatePay: https://app.abacatepay.com/
  2. Navegue até 'PIX QR Codes' ou 'Pagamentos'
  3. Encontre o PIX com ID: abc123xyz
  4. Clique em 'Simular Pagamento'
  5. O webhook será disparado automaticamente!
```

4. **Copie o PIX ID** mostrado nos logs (ex: `abc123xyz`)

---

### Teste 2: Simular Pagamento no Painel do AbacatePay

1. **Acesse**: https://app.abacatepay.com/
2. **Login** com suas credenciais
3. **Navegue** até **"PIX QR Codes"** ou **"Pagamentos"**
4. **Localize** o PIX com o ID copiado anteriormente
5. **Clique** em **"Simular Pagamento"** ou **"Marcar como Pago"**

---

### Teste 3: Verificar Webhook (Método Recomendado)

**Se o webhook estiver configurado**, você verá nos logs:

```
🥑 Webhook AbacatePay recebido (RAW): {"event":"pixQrCode.paid","id":"abc123xyz",...}
🥑 Webhook AbacatePay recebido (PARSED): {
  event: 'pixQrCode.paid',
  id: 'abc123xyz',
  status: 'PAID',
  fullData: { ... }
}
✅ PIX pago! Dados completos: { ... }
🔍 Procurando pagamento com abacatePayId: abc123xyz
📋 Atualizando pagamento: uuid-payment
✅ Pagamento e assinatura atualizados com sucesso!
```

**No navegador**, a página do checkout deve:
- ✅ Mostrar toast: "Pagamento Confirmado!"
- ✅ Redirecionar para `/views/home` após 2 segundos

---

### Teste 4: Verificar Polling (Fallback se Webhook Falhar)

Se o webhook não disparar, o **polling automático** (a cada 5s) fará o trabalho:

```
Verificando status do pagamento: uuid-payment
📊 Status do PIX no AbacatePay: {
  id: 'abc123xyz',
  status: 'PAID',
  fullResponse: { ... }
}
✅ Pagamento PIX confirmado via polling!
```

**No navegador**:
- ✅ Toast: "Pagamento Confirmado!"
- ✅ Redirecionamento para `/views/home`

---

## 🐛 Problemas Comuns e Soluções

### ❌ Problema 1: "Pagamento não encontrado para PIX ID: abc123"

**Causa**: O `abacatePayId` no banco não corresponde ao ID do webhook

**Solução**:
1. Verifique os logs da criação do PIX
2. Compare o **AbacatePay PIX ID** salvo no banco
3. Execute no banco de dados:
```sql
SELECT id, "abacatePayId", status, "createdAt" 
FROM payments 
WHERE method = 'PIX' 
ORDER BY "createdAt" DESC 
LIMIT 5;
```
4. O `abacatePayId` deve corresponder ao ID do webhook

---

### ❌ Problema 2: Webhook não está sendo recebido

**Causa**: URL do webhook não configurada ou inacessível

**Solução**:

#### Desenvolvimento Local (com ngrok):
```bash
# Terminal 1: Rodar a aplicação
npm run dev

# Terminal 2: Expor com ngrok
ngrok http 3000
```

**Copie a URL do ngrok** (ex: `https://abc123.ngrok.io`)

**Configure no painel do AbacatePay**:
- URL: `https://abc123.ngrok.io/api/webhooks/abacatepay`
- Eventos: `pixQrCode.paid`, `billing.paid`, `billing.cancelled`, `billing.expired`

#### Testar se a URL está acessível:
```bash
curl https://sua-url.ngrok.io/api/webhooks/abacatepay
```

Você deve receber: `{"error":"Método não permitido"}` (isso é esperado para GET)

---

### ❌ Problema 3: Status permanece "PENDING" mesmo após simular

**Causa**: Status retornado pela API está em formato diferente

**Verificação**:
1. Veja os logs do polling:
```
📊 Status do PIX no AbacatePay: {
  id: 'abc123',
  status: 'PENDING',  <-- Verifique este valor
  fullResponse: { ... }
}
```

2. Se o status estiver diferente de `PAID`, verifique no painel do AbacatePay se:
   - O pagamento foi realmente marcado como pago
   - A API está retornando o status correto

---

### ❌ Problema 4: Polling funciona, mas webhook não

**Causa**: Webhook não configurado ou URL incorreta

**Solução**:
1. Acesse o painel do AbacatePay
2. Vá em **Configurações → Webhooks**
3. Verifique se há um webhook cadastrado
4. Edite e teste o webhook:
   - Clique em "Testar Webhook"
   - Verifique se retorna status 200

---

## 📊 Verificar Status no Banco de Dados

```sql
-- Ver últimos pagamentos
SELECT 
  p.id,
  p."abacatePayId",
  p.status,
  p."paymentDate",
  p."createdAt",
  s.status as subscription_status
FROM payments p
LEFT JOIN subscriptions s ON p."subscriptionId" = s.id
WHERE p.method = 'PIX'
ORDER BY p."createdAt" DESC
LIMIT 10;
```

**Status esperados**:
- `PENDING` → Aguardando pagamento
- `RECEIVED` → Pagamento confirmado (via webhook ou polling)

---

## 🔍 Logs Importantes

### Criação do PIX
```
📤 Criando QR Code PIX no AbacatePay...
✅ QR Code PIX criado com sucesso!
📊 Detalhes do PIX: { id: '...', status: 'PENDING' }
💾 Salvando pagamento no banco de dados...
✅ Pagamento salvo com sucesso!
```

### Webhook Recebido
```
🥑 Webhook AbacatePay recebido (RAW): ...
🥑 Webhook AbacatePay recebido (PARSED): ...
✅ PIX pago! Dados completos: ...
🔍 Procurando pagamento com abacatePayId: ...
📋 Atualizando pagamento: ...
✅ Pagamento e assinatura atualizados com sucesso!
```

### Polling (Fallback)
```
📊 Status do PIX no AbacatePay: { status: 'PAID' }
✅ Pagamento PIX confirmado via polling!
```

---

## ✅ Checklist de Verificação

- [ ] Aplicação rodando: `npm run dev`
- [ ] ngrok expondo a porta 3000 (desenvolvimento)
- [ ] Webhook configurado no painel do AbacatePay
- [ ] URL do webhook acessível
- [ ] Eventos `pixQrCode.paid` selecionados no webhook
- [ ] Pagamento PIX criado com sucesso (verificar logs)
- [ ] `abacatePayId` salvo corretamente no banco
- [ ] Simulação de pagamento feita no painel
- [ ] Logs mostrando webhook recebido OU polling confirmado
- [ ] Página redireciona após confirmação

---

## 🚀 Próximos Passos (Produção)

1. **Remover logs de debug** (opcional, para produção)
2. **Configurar webhook** com URL de produção
3. **Testar webhook** em produção
4. **Monitorar logs** de pagamentos reais

---

## 📞 Suporte

Se o problema persistir após seguir este guia:

1. **Capture os logs completos** do servidor
2. **Verifique o status no banco de dados**
3. **Verifique o status no painel do AbacatePay**
4. **Compare os IDs** entre sistema e AbacatePay

---

**Última atualização**: 2025-10-19
