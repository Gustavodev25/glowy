# 🥑 Configuração do Webhook AbacatePay

## 📋 O que foi implementado

Agora o sistema tem **2 formas** de detectar quando um pagamento é confirmado:

### 1. **Webhook (Recomendado)** ⚡
O AbacatePay notifica sua aplicação automaticamente quando um pagamento é confirmado.

### 2. **Polling (Backup)** 🔄
A página de checkout verifica o status do pagamento a cada 5 segundos.

---

## 🔧 Como Configurar o Webhook

### Passo 1: Expor sua aplicação (Desenvolvimento)

Se estiver testando localmente, use **ngrok** para expor sua aplicação:

```bash
# Instalar ngrok (se ainda não tiver)
npm install -g ngrok

# Expor a porta 3000
ngrok http 3000
```

Você receberá uma URL tipo: `https://abc123.ngrok.io`

### Passo 2: Configurar no Painel do AbacatePay

1. Acesse: https://app.abacatepay.com/
2. Vá em **Configurações** → **Webhooks**
3. Clique em **Novo Webhook**
4. Preencha:

**URL do Webhook:**
```
https://sua-url.ngrok.io/api/webhooks/abacatepay
```
ou em produção:
```
https://seudominio.com/api/webhooks/abacatepay
```

**Eventos a serem monitorados:**
- ✅ `pixQrCode.paid` - PIX QR Code pago
- ✅ `billing.paid` - Billing (cartão) pago
- ✅ `billing.cancelled` - Billing cancelado
- ✅ `billing.expired` - Billing expirado

5. Salve o webhook

---

## 🧪 Como Testar

### Teste 1: Simular Pagamento PIX (via AbacatePay Dashboard)

1. Crie um pagamento PIX no checkout
2. Copie o ID do PIX que aparece nos logs do servidor
3. No painel do AbacatePay, vá em **Pagamentos PIX**
4. Encontre o pagamento pelo ID
5. Clique em **Simular Pagamento**
6. O webhook será disparado automaticamente!

### Teste 2: Simular via API (Dev Mode)

Use a API do AbacatePay para simular:

```bash
curl -X POST https://api.abacatepay.com/v1/pixQrCode/{id}/simulate-payment \
  -H "Authorization: Bearer abc_dev_..." \
  -H "Content-Type: application/json"
```

### Teste 3: Polling Manual

Mesmo sem webhook configurado, o sistema verifica o status a cada 5 segundos quando o QR Code está sendo exibido.

---

## 📊 Fluxo Completo de Pagamento PIX

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário clica em "Finalizar Compra" (PIX)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. API cria QR Code PIX no AbacatePay                     │
│    POST /api/payments/create-pix                           │
│    - Salva subscription (status: pending)                  │
│    - Salva payment (status: PENDING)                       │
│    - Retorna QR Code                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. QR Code é exibido na tela                              │
│    - Polling inicia (verifica a cada 5s)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Usuário paga o PIX                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────┴──────────────────┐
         ↓                                      ↓
┌──────────────────────┐           ┌──────────────────────┐
│ Webhook (instantâneo)│    OU     │ Polling (5s depois)  │
│                      │           │                      │
│ AbacatePay envia     │           │ Frontend consulta    │
│ POST /webhooks/      │           │ GET /payments/:id/   │
│ abacatepay           │           │ status               │
└──────────────────────┘           └──────────────────────┘
         ↓                                      ↓
         └──────────────────┬──────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Sistema atualiza status                                 │
│    - Payment.status = "RECEIVED"                           │
│    - Payment.paymentDate = now()                           │
│    - Subscription.status = "active"                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend detecta mudança                                │
│    - Mostra toast de sucesso                               │
│    - Redireciona para /views/home                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problema: "Aguardando confirmação..." não muda

**Causa:** Webhook não configurado E polling não está funcionando

**Solução:**
1. Verifique se a rota `/api/payments/[id]/status` existe
2. Abra o console do navegador e veja se há erros
3. Verifique os logs do servidor para ver se o polling está chegando

### Problema: Webhook não está sendo recebido

**Causa:** URL não está acessível ou evento não configurado

**Solução:**
1. Teste se a URL está acessível: `curl https://sua-url/api/webhooks/abacatepay`
2. Verifique se selecionou o evento `pixQrCode.paid` no painel
3. Veja os logs do ngrok: `ngrok http 3000 --log=stdout`

### Problema: Status não muda mesmo após simular pagamento

**Causa:** Campo `abacatePayId` não está preenchido no banco

**Solução:**
1. Verifique no banco de dados:
```sql
SELECT id, "abacatePayId", status FROM payments ORDER BY "createdAt" DESC LIMIT 5;
```
2. O campo `abacatePayId` deve estar preenchido com o ID do PIX

---

## 📝 Logs para Debug

### No servidor (console):

```
✅ QR Code PIX criado: { id: 'abc123', status: 'PENDING' }
📊 Status do PIX no AbacatePay: { id: 'abc123', status: 'PAID' }
✅ Pagamento PIX confirmado via polling!
```

ou quando via webhook:

```
🥑 Webhook AbacatePay recebido: { event: 'pixQrCode.paid', id: 'abc123' }
✅ PIX pago! ID: abc123
📋 Atualizando pagamento: payment-uuid
✅ Pagamento e assinatura atualizados com sucesso!
```

### No navegador (console):

```
Verificando status do pagamento...
Status atual: PENDING
Verificando novamente em 5 segundos...
Status atual: RECEIVED
Pagamento confirmado! Redirecionando...
```

---

## 🚀 Produção

Em produção, configure o webhook com a URL real:

```
https://seudominio.com/api/webhooks/abacatepay
```

E remova os logs de debug se desejar.

---

## ✅ Checklist de Implementação

- [x] Webhook criado em `/api/webhooks/abacatepay`
- [x] Rota de status criada em `/api/payments/[id]/status`
- [x] Polling configurado no frontend (5 segundos)
- [x] Eventos do AbacatePay mapeados:
  - [x] `pixQrCode.paid`
  - [x] `billing.paid`
  - [x] `billing.cancelled`
  - [x] `billing.expired`
- [ ] Webhook configurado no painel do AbacatePay
- [ ] Testado em desenvolvimento com ngrok
- [ ] Testado em produção

---

Agora seu sistema está pronto para detectar pagamentos automaticamente! 🎉
