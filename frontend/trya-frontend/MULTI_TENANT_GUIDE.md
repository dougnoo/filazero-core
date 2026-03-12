# Guia do Sistema Multi-Tenant

## Visão Geral

O sistema foi refatorado para ser completamente genérico e suportar múltiplos tenants (clientes). O "Trigo" agora é apenas um dos possíveis tenants, não mais hardcoded no sistema.

## Como Funciona

### 1. Identificação do Tenant

**IMPORTANTE**: O tenant padrão é **Trigo**. Não é necessário especificar `?tenant=trigo` na URL.

Identificação do tenant:
- Sem parâmetro na URL: Usa **Trigo** (padrão) 🎯
- `?tenant=trigo` - Tema do Trigo (mesmo que sem parâmetro)
- `?tenant=empresa-exemplo` - Acessa o tema da Empresa Exemplo
- `?tenant=default` - Acessa o tema padrão Trya

**Note**: Como o Trigo é o padrão, URLs sem `?tenant=` usarão automaticamente o tema do Trigo.

### 2. Configuração de Temas

Cada tenant tem sua configuração completa de tema em `src/shared/services/themeService.ts`:

```typescript
'tenant-name': {
  id: 'tenant-name',
  name: 'Nome do Cliente',
  subdomain: 'tenant-name',
  colors: {
    primary: '#COR_PRIMARIA',
    secondary: '#COR_SECUNDARIA',
    // ... outras cores
  },
  images: {
    logo: '/caminho/para/logo.svg',
    backgroundPattern: '/caminho/para/background.png', // Opcional
  },
  typography: {
    fontFamily: 'Fonte, Inter, system-ui, sans-serif',
    // ... configurações de tipografia
  },
  layout: {
    logoPosition: 'center', // 'left' | 'center' | 'right'
    showPoweredBy: true,
    poweredByText: 'Powered by Trya',
  },
}
```

### 3. Comportamento Dinâmico

O sistema agora se adapta automaticamente baseado no tenant:

- **Background**: Se `backgroundPattern` estiver definido, usa como background. Caso contrário, mostra os padrões decorativos padrão.
- **Logo**: Sempre usa o logo definido no tema do tenant.
- **Cores**: Todas as cores são aplicadas dinamicamente.
- **Fontes**: A fonte definida no tema é aplicada em todos os elementos.
- **Layout**: Posicionamento do logo e outros elementos seguem a configuração.

## Adicionando um Novo Tenant

Para adicionar um novo tenant:

1. **Adicione a configuração no `themeService.ts`**:
```typescript
'novo-cliente': {
  id: 'novo-cliente',
  name: 'Novo Cliente',
  subdomain: 'novo-cliente',
  colors: {
    primary: '#SUA_COR_PRIMARIA',
    secondary: '#SUA_COR_SECUNDARIA',
    // ... configure todas as cores
  },
  images: {
    logo: '/logo-novo-cliente.svg',
    backgroundPattern: '/bg-novo-cliente.png', // Opcional
  },
  typography: {
    fontFamily: 'SuaFonte, Inter, system-ui, sans-serif',
    // ... configure tipografia
  },
  layout: {
    logoPosition: 'center',
    showPoweredBy: true,
    poweredByText: 'Powered by Trya',
  },
}
```

2. **Adicione os assets**:
   - Logo: `/public/logo-novo-cliente.svg`
   - Background (opcional): `/public/bg-novo-cliente.png`

3. **Teste acessando**: `/?tenant=novo-cliente`

## Exemplos de Uso

### Acessar diferentes tenants:
- `http://localhost:3000/paciente/login` - **Trigo (padrão)** ✅
- `http://localhost:3000/medico/login?tenant=empresa-exemplo` - Empresa Exemplo
- `http://localhost:3000/admin/login?tenant=default` - Tema Trya

### Tenants disponíveis:
- **`trigo`** (padrão) - Trigo Franquias (tema amarelo/bege) 🎯
- `empresa-exemplo` - Empresa Exemplo (tema verde)
- `cliente1` - Cliente 1 (tema azul)
- `exemplo` - Cliente Exemplo (tema roxo)
- `default` - Tema padrão Trya

## Benefícios da Refatoração

1. **Flexibilidade**: Qualquer cliente pode ter seu tema personalizado
2. **Escalabilidade**: Fácil adição de novos tenants
3. **Manutenibilidade**: Código mais limpo sem hardcoding
4. **Reutilização**: Mesmo código serve para todos os clientes
5. **Customização**: Cada tenant pode ter cores, fontes, logos e backgrounds únicos

## Estrutura de Arquivos

```
src/
├── shared/
│   ├── services/
│   │   └── themeService.ts    # Configurações dos temas
│   ├── types/
│   │   └── theme.ts           # Tipos TypeScript
│   └── context/
│       └── GlobalThemeContext.tsx # Contexto do tema
└── app/
    └── (unauthenticated)/
        └── [role]/
            └── login/
                └── page.tsx    # Página de login genérica
```

O sistema agora é verdadeiramente multi-tenant e pode ser facilmente expandido para novos clientes!
