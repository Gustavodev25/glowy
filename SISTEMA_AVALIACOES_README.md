# 🌟 Sistema de Avaliações - Booky

Sistema completo de avaliações para empresas, incluindo backend, frontend e banco de dados.

## 📋 Funcionalidades

### ✅ Implementadas
- ✅ **Avaliações de 1 a 5 estrelas**
- ✅ **Comentários opcionais**
- ✅ **Sistema de respostas das empresas**
- ✅ **Estatísticas detalhadas**
- ✅ **Interface responsiva**
- ✅ **APIs RESTful completas**
- ✅ **Banco de dados PostgreSQL**
- ✅ **Integração com Prisma ORM**

### 🔧 Características Técnicas
- **Backend**: Next.js API Routes
- **Frontend**: React com TypeScript
- **Banco**: PostgreSQL com Prisma
- **Autenticação**: JWT Token
- **UI**: Componentes customizados com Tailwind CSS

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

1. **`avaliacoes`** - Armazena todas as avaliações
2. **`respostas_avaliacoes`** - Respostas das empresas às avaliações
3. **`relatorios_avaliacoes`** - Sistema de denúncias

### Relacionamentos
- `avaliacoes` → `empresa` (1:N)
- `avaliacoes` → `users` (cliente) (1:N)
- `avaliacoes` → `servicos` (opcional) (1:N)
- `respostas_avaliacoes` → `avaliacoes` (1:1)
- `relatorios_avaliacoes` → `avaliacoes` (1:N)

## 🚀 Instalação e Configuração

### 1. Execute o SQL no pgAdmin

```sql
-- Cole todo o código SQL fornecido no pgAdmin
-- O código cria as tabelas, índices, triggers e views
```

### 2. Atualize o Schema do Prisma

```bash
# Gere o cliente Prisma com as novas tabelas
npx prisma generate

# Execute a migração (se necessário)
npx prisma db push
```

### 3. Execute o Script de Migração (Opcional)

```bash
# Para inserir dados de exemplo
npx tsx scripts/migrate-ratings.ts
```

## 📡 APIs Disponíveis

### Avaliações

#### `GET /api/avaliacoes`
Lista avaliações de uma empresa
```javascript
// Query params
{
  empresaId: string,        // Obrigatório
  servicoId?: string,      // Opcional
  page?: number,           // Padrão: 1
  limit?: number,         // Padrão: 10
  includeRespostas?: boolean // Padrão: false
}
```

#### `POST /api/avaliacoes`
Cria nova avaliação
```javascript
// Body
{
  empresaId: string,
  servicoId?: string,
  nota: number,           // 1-5
  comentario?: string
}
```

### Respostas

#### `POST /api/avaliacoes/[id]/resposta`
Responde a uma avaliação (apenas donos da empresa)
```javascript
// Body
{
  resposta: string
}
```

#### `PUT /api/avaliacoes/[id]/resposta`
Atualiza resposta existente

#### `DELETE /api/avaliacoes/[id]/resposta`
Remove resposta (soft delete)

### Estatísticas

#### `GET /api/avaliacoes/estatisticas`
Obtém estatísticas detalhadas
```javascript
// Query params
{
  empresaId: string,      // Obrigatório
  servicoId?: string     // Opcional
}
```

## 🎨 Componente Frontend

### Uso Básico

```tsx
import Avaliacoes from '@/components/Avaliacoes';

<Avaliacoes 
  empresaId="uuid-da-empresa"
  servicoId="uuid-do-servico" // Opcional
  isOwner={false}             // Se o usuário é dono da empresa
  userId="uuid-do-usuario"    // ID do usuário logado
/>
```

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `empresaId` | `string` | ✅ | ID da empresa |
| `servicoId` | `string` | ❌ | ID do serviço (opcional) |
| `isOwner` | `boolean` | ❌ | Se pode responder avaliações |
| `userId` | `string` | ❌ | ID do usuário logado |

## 🔧 Integração com Sistema Existente

### 1. API de Empresas Atualizada

A API `/api/empresas` agora inclui:
- ✅ Avaliações reais (não mais mockadas)
- ✅ Contagem de avaliações
- ✅ Média calculada dinamicamente

### 2. Página de Showcase

A página `/showcase/[id]` agora usa o componente `Avaliacoes` real.

## 📊 Funcionalidades do Sistema

### Para Clientes
- ⭐ Avaliar empresas (1-5 estrelas)
- 💬 Deixar comentários
- 👀 Ver avaliações de outros clientes
- 📱 Interface responsiva

### Para Empresas
- 📈 Ver estatísticas detalhadas
- 💬 Responder avaliações
- 📊 Acompanhar tendências
- 🔄 Gerenciar respostas

### Para Administradores
- 🚨 Sistema de denúncias
- 📋 Moderação de conteúdo
- 📊 Relatórios completos

## 🎯 Exemplos de Uso

### 1. Listar Avaliações

```javascript
const response = await fetch('/api/avaliacoes?empresaId=123&includeRespostas=true');
const data = await response.json();

console.log(data.data.avaliacoes);
console.log(data.data.estatisticas);
```

### 2. Criar Avaliação

```javascript
const response = await fetch('/api/avaliacoes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    empresaId: '123',
    nota: 5,
    comentario: 'Excelente serviço!'
  })
});
```

### 3. Obter Estatísticas

```javascript
const response = await fetch('/api/avaliacoes/estatisticas?empresaId=123');
const data = await response.json();

console.log(`Média: ${data.data.estatisticas.media}`);
console.log(`Total: ${data.data.estatisticas.totalAvaliacoes}`);
```

## 🔒 Segurança

- ✅ **Autenticação JWT** obrigatória para criar avaliações
- ✅ **Validação de permissões** para respostas
- ✅ **Soft delete** para preservar histórico
- ✅ **Validação de dados** em todas as APIs
- ✅ **Rate limiting** (implementar se necessário)

## 📈 Performance

- ✅ **Índices otimizados** no banco de dados
- ✅ **Paginação** nas listagens
- ✅ **Agregações** para estatísticas
- ✅ **Views** para consultas complexas
- ✅ **Lazy loading** no frontend

## 🐛 Troubleshooting

### Erro: "Tabela não encontrada"
```bash
# Execute o SQL no pgAdmin primeiro
# Depois execute:
npx prisma generate
npx prisma db push
```

### Erro: "Token inválido"
```javascript
// Verifique se o token está sendo enviado corretamente
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Erro: "Empresa não encontrada"
```javascript
// Verifique se o empresaId está correto
// Use o ID real da tabela empresas
```

## 🚀 Próximos Passos

### Melhorias Futuras
- [ ] **Notificações** para novas avaliações
- [ ] **Filtros avançados** (por data, nota, etc.)
- [ ] **Exportação** de relatórios
- [ ] **Integração** com email marketing
- [ ] **Analytics** avançados
- [ ] **Sistema de badges** para empresas

### Integrações
- [ ] **WhatsApp** para notificações
- [ ] **Email** para confirmações
- [ ] **Google Analytics** para métricas
- [ ] **Social Media** para compartilhamento

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme se todas as tabelas foram criadas
3. Teste as APIs individualmente
4. Verifique a autenticação

---

**Sistema de Avaliações Booky** - Implementação completa e funcional! 🎉

