# Sistema de Tema Centralizado

Este sistema permite customizar facilmente as cores e estilos de todo o dashboard para diferentes clientes (white-label).

## 🎨 Como Usar

### 1. Tema Padrão
```typescript
import { theme } from '@/shared/theme';

// Use o tema em qualquer componente
const MyComponent = () => {
  return (
    <Box sx={{ backgroundColor: theme.primary }}>
      <Typography sx={{ color: theme.textDark }}>
        Texto com cor do tema
      </Typography>
    </Box>
  );
};
```

### 2. Customizando o Tema

#### Opção A: Modificar o arquivo principal
```typescript
// src/shared/theme/index.ts
export const theme = {
  primary: "#FF6B35",        // Laranja
  textDark: "#2C3E50",       // Azul escuro
  // ... outras cores
};
```

#### Opção B: Criar tema customizado
```typescript
// src/shared/theme/custom-theme.ts
import { theme as baseTheme } from './index';

export const customTheme = {
  ...baseTheme,
  primary: "#FF6B35",
  textDark: "#2C3E50",
  success: "#28A745",
  fontFamily: "Inter, sans-serif"
};
```

### 3. Aplicando Tema Customizado

#### Em um componente específico:
```typescript
import { customTheme } from '@/shared/theme/custom-theme';

const MyComponent = () => {
  return (
    <Box sx={{ backgroundColor: customTheme.primary }}>
      {/* conteúdo */}
    </Box>
  );
};
```

#### Globalmente (recomendado):
```typescript
// src/shared/theme/index.ts
export { customTheme as theme } from './custom-theme';
```

## 🎯 Cores Disponíveis

### Cores Primárias
- `primary`: Cor principal do sistema
- `textDark`: Texto escuro
- `textMuted`: Texto secundário

### Cores de Fundo
- `background`: Fundo principal
- `appBarBackground`: Fundo do header
- `cardBackground`: Fundo dos cards
- `backgroundSoft`: Fundo suave (com transparência)

### Cores de Status
- `success`: Verde de sucesso
- `successBackground`: Fundo verde claro
- `successSoft`: Verde suave

### Cores de Interface
- `border`: Bordas
- `softBorder`: Bordas suaves
- `avatarBackground`: Fundo do avatar
- `iconBackground`: Fundo dos ícones
- `chipBackground`: Fundo dos chips

### Cores Neutras
- `white`: Branco
- `secondary`: Cor secundária
- `secondaryHover`: Hover secundário

### Tipografia
- `fontFamily`: Família de fontes

## 📁 Estrutura de Arquivos

```
src/shared/theme/
├── index.ts          # Tema principal
├── examples.ts       # Exemplos de temas
└── README.md         # Esta documentação
```

## 🔄 Exemplos de Temas

Veja `examples.ts` para exemplos de temas para:
- **Amil**: Azul/verde
- **Unimed**: Laranja/vermelho  
- **Bradesco**: Azul escuro
- **Dark Theme**: Tema escuro

## ✨ Benefícios

1. **Centralização**: Todas as cores em um local
2. **Consistência**: Mesmo padrão em todo o sistema
3. **Customização**: Fácil adaptação para diferentes clientes
4. **Manutenibilidade**: Mudanças centralizadas
5. **TypeScript**: Tipagem forte e segura
6. **Performance**: Sem repetição de código
