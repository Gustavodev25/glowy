# Componentes Visuais Padronizados

Esta pasta contém os componentes visuais padronizados do sistema Booky, criados para garantir consistência e facilidade de manutenção em toda a aplicação.

## Componentes Disponíveis

### Input
Componente de input padronizado com suporte a labels, validação de erro, texto de ajuda e estados de desabilitado.

**Props:**
- `label?: string` - Label do campo
- `error?: string` - Mensagem de erro
- `helpText?: string` - Texto de ajuda
- `required?: boolean` - Campo obrigatório
- `containerClassName?: string` - Classes CSS para o container

**Exemplo:**
```tsx
<Input
  label="Email"
  type="email"
  placeholder="Digite seu email"
  required
  error={errors.email}
/>
```

### Button
Componente de botão padronizado com loader integrado e múltiplas variantes.

**Props:**
- `children: React.ReactNode` - Conteúdo do botão
- `isLoading?: boolean` - Estado de carregamento
- `variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'` - Variante visual
- `size?: 'sm' | 'md' | 'lg'` - Tamanho do botão
- `fullWidth?: boolean` - Largura total

**Exemplo:**
```tsx
<Button
  variant="primary"
  isLoading={isSubmitting}
  fullWidth
  onClick={handleSubmit}
>
  Enviar
</Button>
```

### Loader
Componente de loading padronizado para usar dentro de botões ou outros componentes.

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Tamanho do loader
- `color?: 'primary' | 'white' | 'gray'` - Cor do loader
- `className?: string` - Classes CSS adicionais

**Exemplo:**
```tsx
<Loader size="md" color="primary" />
```

## Como Usar

```tsx
import { Input, Button, Loader } from '@/components/visual';

// Ou importar individualmente
import Input from '@/components/visual/Input';
import Button from '@/components/visual/Button';
import Loader from '@/components/visual/Loader';
```

## Características

- **Consistência Visual**: Todos os componentes seguem o mesmo design system
- **Acessibilidade**: Suporte completo a ARIA labels e navegação por teclado
- **Responsividade**: Adaptáveis a diferentes tamanhos de tela
- **TypeScript**: Totalmente tipados para melhor experiência de desenvolvimento
- **Tema**: Usam as cores padrão do sistema (#C5837B para primary)
