# 📁 Setup do Sistema de Documentos

## 🚨 Problema Atual
O modelo `Documento` foi adicionado ao schema do Prisma, mas o Prisma Client ainda não foi regenerado porque o servidor de desenvolvimento está rodando.

## ✅ Solução Completa (Execute nesta ordem)

### Passo 1: Parar o Servidor
No terminal onde está rodando `npm run dev`, pressione:
```
Ctrl + C
```

### Passo 2: Executar a Migration SQL
Execute o arquivo `migration_documentos.sql` no seu banco PostgreSQL:

**Opção A - Via psql:**
```bash
psql -U seu_usuario -d seu_banco -f migration_documentos.sql
```

**Opção B - Via pgAdmin ou outro client:**
1. Abra o pgAdmin ou seu client SQL preferido
2. Conecte ao banco de dados
3. Abra o arquivo `migration_documentos.sql`
4. Execute o SQL

**Opção C - Via Prisma (Recomendado):**
```bash
npx prisma migrate dev --name add_documento_model
```

### Passo 3: Regenerar o Prisma Client
```bash
npx prisma generate
```

### Passo 4: Reiniciar o Servidor
```bash
npm run dev
```

## 🎉 Pronto!
Após executar esses passos, o sistema de upload de documentos estará 100% funcional!

## 🔍 Verificação
Para verificar se tudo funcionou:
1. Acesse a página de um cliente
2. Vá na aba "Documentos"
3. Clique em "Enviar Documento"
4. Selecione um arquivo e envie

## 📝 O que foi criado

### Modelo Documento
- **Campos principais**: empresaId, clienteId, agendamentoId, tipo, nome, descricao
- **Armazenamento**: url (base64 ou Cloudinary), publicId, tamanho, mimeType
- **Auditoria**: uploadedBy, createdAt
- **Relacionamentos**: Empresa, Cliente, Agendamento, User

### Tabela no Banco
- ✅ Criação da tabela `documentos`
- ✅ Foreign keys para empresas, clientes, agendamentos e users
- ✅ Índices otimizados para consultas rápidas
- ✅ Comentários explicativos

### Interface Visual
- ✅ Drawer de upload com CardIcon do design system
- ✅ Select de tipo de documento
- ✅ TextArea para descrição (500 caracteres)
- ✅ Preview do arquivo selecionado
- ✅ Card visual com ícones dinâmicos por tipo de arquivo

## 🐛 Problemas?
Se após executar os passos ainda houver erro:
1. Verifique se a tabela foi criada: `SELECT * FROM documentos;`
2. Verifique se o Prisma Client foi regenerado: veja se não há erros no console
3. Limpe o cache do Next.js: `rm -rf .next` (ou delete a pasta .next)
4. Reinicie o servidor novamente
