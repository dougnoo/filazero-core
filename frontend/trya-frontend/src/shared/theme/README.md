# Multi-Tenant Theme System

Sistema de tema dinâmico baseado em MUI que carrega cores e assets por tenant.

## Arquitetura

```
src/shared/
├── theme/
│   └── createTenantTheme.ts   # Cria tema MUI a partir da config do tenant
├── context/
│   └── TenantThemeProvider.tsx # Provider que carrega tema do tenant
└── services/
    └── themeService.ts         # Busca config do tenant via API
```

## Como Usar

### Cores via sx prop (preferido)
```tsx
<Box sx={{ bgcolor: "primary.main" }}>
  <Typography>Texto</Typography>
</Box>
```

### Tokens disponíveis
| Token | Uso |
|-------|-----|
| `primary.main` | Cor primária do tenant |
| `primary.light` | Versão clara da primária |
| `primary.contrastText` | Texto sobre primária |
| `background.default` | Fundo da página |
| `background.paper` | Fundo de cards |
| `divider` | Bordas e separadores |
| `action.hover` | Estados de hover |

### Acessando tema diretamente
```tsx
import { useTheme } from "@mui/material/styles";

function Component() {
  const theme = useTheme();
  return <svg fill={theme.palette.primary.main} />;
}
```

### Assets do tenant (logo, favicon)
```tsx
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";

function Header() {
  const { assets } = useTenantAssets();
  return <img src={assets.logo} alt="Logo" />;
}
```

## Botões
Use props nativas do MUI:
```tsx
<Button variant="contained" color="primary">Enviar</Button>
<Button variant="outlined">Cancelar</Button>
```

## Ícones
Use `@mui/icons-material`:
```tsx
import SearchIcon from "@mui/icons-material/Search";
<SearchIcon color="action" />
```

## ⚠️ Não fazer
- Criar variáveis locais como `primaryColor`, `secondaryColor`
- Usar cores hardcoded
- Importar do antigo `useThemeColors`
