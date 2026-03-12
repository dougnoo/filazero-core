# Sistema de Tema Dinâmico Multi-Tenant

Este sistema permite que diferentes clientes tenham temas personalizados baseados em subdomínios, com cacheamento inteligente e fallback para tema padrão.

## Estrutura

### Tipos (`types/theme.ts`)
Define as interfaces para o sistema de tema:
- `ClientTheme`: Estrutura completa do tema de um cliente
- `ThemeConfig`: Configuração geral do sistema
- `ThemeContextType`: Interface do contexto React

### Serviços (`services/themeService.ts`)
Gerencia a lógica de negócio do tema:
- Detecção automática de subdomínio
- Cache em memória e localStorage
- Fallback para tema padrão
- Integração com API

### Hooks (`hooks/useTheme.ts`)
Hook personalizado para consumir o tema:
- Estado de loading
- Tratamento de erros
- Refresh do tema

### Contexto (`context/ThemeContext.tsx`)
Contexto React para compartilhar o tema:
- Provider para toda a aplicação
- Hook para consumir o contexto

### Componentes

#### `DynamicSVG.tsx`
Componente para SVGs dinâmicos:
- `DynamicSVG`: SVG com propriedades dinâmicas
- `DynamicStrokeElement`: Elementos com stroke dinâmico
- `DynamicFillElement`: Elementos com fill dinâmico

## Como Usar

### 1. Configurar Subdomínios
O sistema detecta automaticamente o subdomínio da URL:
- `cliente1.trya.com` → tema do cliente1
- `cliente2.trya.com` → tema do cliente2
- `localhost` ou IP → tema padrão

### 2. Adicionar Novos Clientes
Edite `api/theme/[subdomain]/route.ts` para adicionar novos temas:

```typescript
const clientThemes: Record<string, ClientTheme> = {
  'novo-cliente': {
    id: 'novo-cliente',
    name: 'Novo Cliente',
    subdomain: 'novo-cliente',
    colors: {
      primary: '#FF6B6B',
      // ... outras cores
    },
    // ... resto da configuração
  },
};
```

### 3. Usar em Componentes
```tsx
import { useThemeContext } from '@/shared/context/ThemeContext';

function MeuComponente() {
  const { theme, isLoading, error } = useThemeContext();
  
  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <div style={{ color: theme.colors.text.primary }}>
      Conteúdo com tema dinâmico
    </div>
  );
}
```

### 4. Estrutura de Cores
```typescript
colors: {
  primary: string;        // Cor principal
  secondary: string;      // Cor secundária
  background: string;     // Fundo principal
  surface: string;        // Superfícies (cards, etc)
  text: {
    primary: string;      // Texto principal
    secondary: string;    // Texto secundário
    disabled: string;     // Texto desabilitado
  };
  border: {
    default: string;      // Borda padrão
    hover: string;        // Borda no hover
    focus: string;        // Borda no foco
  };
  button: {
    primary: string;      // Botão primário
    primaryHover: string; // Botão primário hover
    text: string;         // Texto do botão
  };
}
```

## Cacheamento

O sistema implementa cache em duas camadas:

1. **Memória**: Cache rápido durante a sessão
2. **localStorage**: Persistência entre sessões
3. **API**: Fallback quando não há cache

### Configuração de Cache
- Duração: 5 minutos (configurável em `themeService.ts`)
- Limpeza automática de cache expirado
- Refresh manual disponível

## API

### Endpoint: `/api/theme/[subdomain]`
- **Método**: GET
- **Resposta**: `ClientTheme`
- **Cache**: 5 minutos no header

### Exemplo de Resposta
```json
{
  "id": "cliente1",
  "name": "Cliente 1",
  "subdomain": "cliente1",
  "colors": { /* ... */ },
  "images": { /* ... */ },
  "typography": { /* ... */ },
  "layout": { /* ... */ }
}
```

## Fallbacks

O sistema possui múltiplos níveis de fallback:

1. **Tema do cliente** (API)
2. **Tema em cache** (localStorage)
3. **Tema padrão** (hardcoded)
4. **Imagens padrão** (fallbackSrc)

## Performance

- Cache inteligente reduz chamadas à API
- Lazy loading de imagens
- Otimização do MUI com Emotion
- Componentes memoizados quando necessário

## Extensibilidade

Para adicionar novas funcionalidades:

1. **Novas propriedades**: Adicione em `ClientTheme`
2. **Novos componentes**: Use `useThemeContext()`
3. **Novos estilos**: Configure em `createClientTheme()`
4. **Novas APIs**: Estenda `themeService.ts`
