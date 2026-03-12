# Como Usar o Sistema de Temas

## Visão Geral

O sistema de temas agora é completamente multi-tenant e as cores do tenant são preservadas em todas as telas.

## Persistência Automática

O tenant é automaticamente salvo no `localStorage` como `currentTenant` e persiste entre sessões.

## Usando o Tema nas Telas

### 1. Importar o Hook

```typescript
import { useTheme } from '@/shared/hooks/useTheme';
```

### 2. Usar no Componente

```typescript
function MyComponent() {
  const { theme, isLoading } = useTheme();
  
  if (isLoading) {
    return <div>Carregando</div>;
  }
  
  return (
    <button style={{ 
      backgroundColor: theme.colors.button.primary,
      color: theme.colors.button.text,
      fontFamily: theme.typography.fontFamily,
    }}>
      Botão
    </button>
  );
}
```

## Propriedades Disponíveis

### `theme.colors`
- `primary`: Cor primária do tenant
- `secondary`: Cor secundária
- `background`: Cor de fundo principal
- `backgroundSecondary`: Cor de fundo secundário
- `button.primary`: Cor do botão primário (amarelo no Trigo, etc)
- `button.primaryHover`: Cor do hover do botão
- `button.text`: Cor do texto do botão
- `border.default`: Cor da borda padrão
- `border.focus`: Cor da borda quando focada
- `text.primary`: Cor do texto principal
- `text.secondary`: Cor do texto secundário

### `theme.typography`
- `fontFamily`: Família da fonte
- `heading.fontSize`: Tamanho da fonte dos títulos
- `heading.fontWeight`: Peso da fonte dos títulos
- `body.fontSize`: Tamanho da fonte do corpo
- `body.fontWeight`: Peso da fonte do corpo

### `theme.images`
- `logo`: Caminho do logo
- `backgroundPattern`: Caminho do background (opcional)

### `theme.layout`
- `showPoweredBy`: Mostrar "Powered by"
- `poweredByText`: Texto do powered by

## Mudando o Tenant

```typescript
const { setCurrentTheme } = useTheme();

// Mudar para o tema do Trigo
setCurrentTheme('trigo');

// Mudar para o tema padrão
setCurrentTheme('default');
```

## Exemplo Completo

```typescript
'use client';

import { useTheme } from '@/shared/hooks/useTheme';
import { Button } from '@mui/material';

export default function LoginPage() {
  const { theme, isLoading, currentTheme } = useTheme();
  
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div style={{ backgroundColor: theme.colors.background }}>
      <Button
        sx={{
          backgroundColor: theme.colors.button.primary,
          color: theme.colors.button.text,
          '&:hover': {
            backgroundColor: theme.colors.button.primaryHover,
          },
          fontFamily: theme.typography.fontFamily,
        }}
      >
        Entrar
      </Button>
    </div>
  );
}
```

## Tenant Persiste Automaticamente

Uma vez definido, o tenant persiste em todas as telas através do localStorage. Se o usuário acessar sem o parâmetro `?tenant=`, o sistema carregará o último tenant usado.

## Como Funciona Internamente

1. **GlobalThemeContext**: Gerencia o estado do tema e salva no localStorage
2. **themeService**: Busca as configurações do tema por tenant
3. **applyRoleToTheme**: Mescla o tema do tenant com overrides do role (apenas layout agora)
4. **useTheme**: Hook conveniente para acessar o tema

O sistema agora **NÃO sobrescreve as cores do tenant**, permitindo que cada cliente tenha sua identidade visual preservada!
