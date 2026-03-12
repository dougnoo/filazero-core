# 🏥 Trya Frontend - Plataforma de Saúde Inteligente

Sistema de saúde com inteligência artificial para triagem, exames e telemedicina integrados.

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm, yarn, pnpm ou bun

### Instalação

```bash
# 1. Clone o repositório
git clone <repo-url>

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 4. Execute o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Configuração de Múltiplas APIs

O frontend Trya se conecta a duas APIs diferentes:

1. **Tenant API** (trya-backend) - Porta 3000

   - Usada por: Pacientes, Admin RH, Cliente
   - Autenticação: JWT em localStorage (chaves `accessToken` e `refreshToken`)

2. **Platform API** (platform-backend) - Porta 3001
   - Usada por: Médicos
   - Autenticação: JWT em localStorage (chave `platform_accessToken`)

#### Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env.local`:

```bash
# API Tenant (pacientes, admin-rh, cliente)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# API Platform (médicos)
NEXT_PUBLIC_PLATFORM_API_BASE_URL=http://localhost:3001
```

**Nota:** a Tenant API expõe rotas com prefixo `/api` (ex.: `GET /api/faq/topics` e `POST /api/faq/ask`).  
O frontend monta as chamadas como `${NEXT_PUBLIC_API_BASE_URL}/api/...` (se estiver usando mesma origem, pode deixar `NEXT_PUBLIC_API_BASE_URL` vazio).

#### Rodando Ambas as APIs

Para desenvolvimento local, você precisa rodar ambos os backends:

**Terminal 1 - Tenant API:**

```bash
cd handslab-trya-backend
npm run start:dev
# Rodando em http://localhost:3000
```

**Terminal 2 - Platform API:**

```bash
cd handslab-trya-platform-backend
npm run start:dev
# Rodando em http://localhost:3001
```

**Terminal 3 - Frontend:**

```bash
cd trya-frontend
npm run dev
# Rodando em http://localhost:3000 (Next.js)
```

---

## 🎯 Para Desenvolvedores Novos no Projeto

**👋 Primeira vez aqui?** Comece por aqui:

1. **Leia este README** para entender a estrutura do projeto
2. **Consulte o [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** para exemplos práticos e código pronto
3. **Explore componentes existentes** como referência
4. **Use os hooks e serviços** já disponíveis (`useAuth`, `useThemeColors`, etc.)

**💡 Dica**: O projeto já tem muita coisa pronta! Sempre verifique se já existe algo antes de criar do zero.

---

## 📖 Guia para Desenvolvedores

### 🎯 Como Começar a Desenvolver uma Feature

#### 1. **Entenda a Estrutura do Projeto**

O projeto usa **Next.js 15** com **App Router**. A estrutura principal é:

```
src/
├── app/                          # Rotas e páginas (Next.js App Router)
│   ├── (authenticated)/          # Rotas que precisam de login
│   │   ├── paciente/             # Dashboard do paciente
│   │   ├── admin-rh/             # Dashboard do admin RH
│   │   └── medico/               # Dashboard do médico
│   ├── (unauthenticated)/        # Rotas públicas (login, etc)
│   └── api/                      # API Routes do Next.js
├── shared/                       # Código compartilhado entre todas as páginas
│   ├── components/               # Componentes reutilizáveis
│   ├── hooks/                    # Hooks customizados
│   ├── services/                 # Serviços de API e lógica
│   ├── context/                  # Contextos React
│   └── utils/                    # Funções utilitárias
└── layout/                       # Layouts reutilizáveis
```

#### 2. **Decida Onde Colocar Seu Código**

**✅ Coloque na pasta da página específica se:**

- O código é usado apenas em uma página/módulo
- Exemplo: `src/app/(authenticated)/paciente/components/PatientCard.tsx`

**✅ Coloque em `shared/` se:**

- O código é usado em múltiplas páginas
- Exemplo: `src/shared/hooks/useAuth.ts`

#### 3. **Use os Hooks e Serviços Disponíveis**

O projeto já tem vários hooks e serviços prontos:

```typescript
// Autenticação
import { useAuth } from "@/shared/hooks/useAuth";
const { user, isAuthenticated, login, logout } = useAuth();

// Temas e cores dinâmicas
import { useThemeColors } from "@/shared/hooks/useThemeColors";
const theme = useThemeColors();
// Use: theme.primary, theme.textDark, theme.background, etc.

// Chat/Triagem
import { useChat } from "@/shared/hooks/useChat";
const { messages, sendMessage } = useChat();
```

#### 4. **Siga os Padrões do Projeto**

- **Componentes**: Use Material-UI (MUI) para componentes base
- **Estilização**: Use `sx` prop do MUI com cores do tema (`useThemeColors`)
- **Tipos**: Sempre defina tipos TypeScript
- **Nomenclatura**: Use PascalCase para componentes, camelCase para funções

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas Detalhada

```
src/
├── app/
│   ├── (authenticated)/              # Rotas autenticadas
│   │   ├── layout.tsx                # Layout com navbar
│   │   ├── page.tsx                  # Redireciona por role
│   │   ├── paciente/                 # Dashboard do Paciente
│   │   │   ├── page.tsx               # Página principal
│   │   │   ├── components/           # Componentes específicos
│   │   │   │   ├── PatientCard.tsx
│   │   │   │   ├── ServicesGrid.tsx
│   │   │   │   └── ...
│   │   │   ├── triagem/              # Triagem com IA
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── chat/         # Componentes de chat
│   │   │   │       └── sidebar/      # Sidebar da triagem
│   │   │   └── onboarding/           # Fluxo de onboarding
│   │   ├── admin-rh/                 # Dashboard Admin RH
│   │   │   ├── page.tsx
│   │   │   └── beneficiarios/        # Módulo de beneficiários
│   │   │       ├── page.tsx
│   │   │       ├── [id]/page.tsx
│   │   │       ├── services/         # Services específicos
│   │   │       ├── types/            # Types específicos
│   │   │       └── components/       # Componentes específicos
│   │   └── medico/                   # Dashboard do Médico
│   ├── (unauthenticated)/            # Rotas públicas
│   │   ├── login/
│   │   ├── first-access/
│   │   └── password-reset/
│   └── api/                          # API Routes
│       └── auth/
│           └── login/
├── shared/                           # Código compartilhado
│   ├── components/                   # Componentes reutilizáveis
│   │   ├── ProtectedRoute.tsx
│   │   ├── DynamicSVG.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks/                        # Hooks reutilizáveis
│   │   ├── useAuth.ts                # Autenticação
│   │   ├── useTheme.ts               # Tema
│   │   ├── useThemeColors.ts         # Cores do tema
│   │   ├── useChat.ts                # Chat/Triagem
│   │   └── useTenant.tsx             # Multi-tenant
│   ├── services/                     # Services globais
│   │   ├── api.ts                    # Cliente HTTP base
│   │   ├── authService.ts            # Autenticação
│   │   ├── themeService.ts           # Temas multi-tenant
│   │   ├── chatService.ts            # Chat/IA
│   │   └── audioService.ts           # Áudio
│   ├── context/                      # Contextos React
│   │   ├── GlobalThemeContext.tsx
│   │   └── ThemeContext.tsx
│   ├── types/                        # Tipos globais
│   │   ├── user.ts
│   │   ├── theme.ts
│   │   └── chat.ts
│   └── utils/                        # Utilitários
│       ├── roleRedirect.ts
│       └── tenantUtils.ts
└── layout/                           # Layouts
    ├── AuthenticatedLayout/
    └── UnauthenticatedLayout/
```

---

## 🎨 Sistema de Temas e Cores

### Como Usar Cores Dinâmicas

O projeto tem um sistema de temas multi-tenant. **Sempre use `useThemeColors()`** para cores:

```typescript
import { useThemeColors } from "@/shared/hooks/useThemeColors";

function MeuComponente() {
  const theme = useThemeColors();

  return (
    <Box
      sx={{
        bgcolor: theme.background, // Fundo principal
        color: theme.textDark, // Texto principal
        border: `1px solid ${theme.softBorder}`, // Borda
      }}
    >
      <Button
        sx={{
          bgcolor: theme.primary, // Cor primária do tema
          color: theme.white, // Texto branco
        }}
      >
        Clique aqui
      </Button>
    </Box>
  );
}
```

### Cores Disponíveis

```typescript
theme.primary; // Cor primária do tenant
theme.secondary; // Cor secundária
theme.textDark; // Texto principal (#041616)
theme.textMuted; // Texto secundário (#4A6060)
theme.background; // Fundo principal
theme.cardBackground; // Fundo de cards (#FFFFFF)
theme.softBorder; // Bordas suaves
theme.avatarBackground; // Fundo de avatares
theme.backgroundSoft; // Fundo suave com opacidade
theme.white; // Branco (#FFFFFF)
theme.success; // Verde de sucesso
theme.successSoft; // Verde suave
```

### Multi-Tenancy

O sistema detecta automaticamente o tenant:

- **Subdomínio**: `amil.trya.com` → tema da Amil
- **Query param**: `?tenant=trigo` → tema do Trigo
- **Padrão**: Sem tenant → tema padrão Trya

---

## 🔐 Autenticação e Rotas

### Sistema de Autenticação Dual

O projeto possui **dois sistemas de autenticação independentes**:

#### 1. Autenticação Tenant (Pacientes, Admin RH, Cliente)

**API:** `NEXT_PUBLIC_API_BASE_URL` (porta 3000)  
**Storage:** localStorage com chaves `accessToken` e `refreshToken`  
**Hook:** `useAuth()`  
**Rotas de Login:** `/login`, `/first-access`, `/password-reset`

```typescript
import { useAuth } from "@/shared/hooks/useAuth";

function MeuComponente() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Faça login</div>;

  return <div>Olá, {user?.name}!</div>;
}
```

**Fluxo de Autenticação:**

1. Usuário acessa `/login`
2. Submete email e senha
3. API retorna `accessToken` e `refreshToken`
4. Tokens são armazenados em localStorage
5. Redirecionamento automático por role:
   - `PATIENT` → `/paciente`
   - `ADMIN_RH` → `/admin-rh`
   - `CLIENT` → `/cliente`

#### 2. Autenticação Platform (Médicos)

**API:** `NEXT_PUBLIC_PLATFORM_API_BASE_URL` (porta 3001)  
**Storage:** localStorage com chave `platform_accessToken`  
**Hook:** `usePlatformAuth()`  
**Rotas de Login:** `/medico/login`, `/medico/first-access`, `/medico/password-reset`

```typescript
import { usePlatformAuth } from "@/shared/hooks/usePlatformAuth";

function MeuComponenteMedico() {
  const { user, isAuthenticated, isLoading } = usePlatformAuth();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Faça login</div>;

  return <div>Olá, Dr(a). {user?.name}!</div>;
}
```

**Fluxo de Autenticação:**

1. Médico acessa `/medico/login`
2. Submete email e senha
3. **Se primeiro acesso (status 428):**
   - Session é armazenada em sessionStorage
   - Redireciona para `/medico/first-access`
   - Médico insere OTP e nova senha
   - Sistema verifica OTP e completa definição de senha
   - Token é armazenado em localStorage
4. **Se login normal:**
   - API retorna `accessToken`
   - Token é armazenado em localStorage
5. Redirecionamento para `/medico` (dashboard)

**Fluxo de Recuperação de Senha (Médicos):**

1. Médico acessa `/medico/password-reset`
2. Insere email
3. Sistema envia OTP por email
4. Médico insere OTP e nova senha
5. Sistema confirma e redireciona para `/medico/login`

### Isolamento de Contextos

Os dois sistemas de autenticação são **completamente isolados**:

- **Tokens diferentes:** `accessToken/refreshToken` vs `platform_accessToken`
- **APIs diferentes:** porta 3000 vs porta 3001
- **Hooks diferentes:** `useAuth()` vs `usePlatformAuth()`
- **Rotas diferentes:** `/login` vs `/medico/login`
- **Layouts diferentes:** `AuthenticatedLayout` vs `PlatformAuthenticatedLayout`

Isso permite que um usuário esteja autenticado em ambos os contextos simultaneamente sem conflitos.

### Rotas Protegidas vs Públicas

**Rotas Públicas** (não precisam de login):

- `/login` - Login tenant
- `/first-access` - Primeiro acesso tenant
- `/password-reset/*` - Recuperação de senha tenant
- `/medico/login` - Login platform (médicos)
- `/medico/first-access` - Primeiro acesso platform (médicos)
- `/medico/password-reset` - Recuperação de senha platform (médicos)

**Rotas Protegidas por Tenant API:**

- `/paciente/*` - Dashboard do paciente
- `/admin-rh/*` - Dashboard admin RH
- `/cliente/*` - Dashboard cliente

**Rotas Protegidas por Platform API:**

- `/medico/*` - Dashboard médico (exceto rotas de login)

### Proteção de Rotas

Cada módulo usa seu próprio layout com verificação de autenticação:

**Tenant Modules:**

```typescript
// src/app/(authenticated)/layout.tsx
import AuthenticatedLayout from "@/layout/AuthenticatedLayout";

export default function AuthenticatedRootLayout({ children }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
```

**Platform Module (Médico):**

```typescript
// src/app/(authenticated)/medico/layout.tsx
import PlatformAuthenticatedLayout from "@/layout/PlatformAuthenticatedLayout";

export default function MedicoLayout({ children }) {
  return <PlatformAuthenticatedLayout>{children}</PlatformAuthenticatedLayout>;
}
```

---

## 📱 Principais Funcionalidades

### 1. Dashboard do Paciente (`/paciente`)

**Componentes principais:**

- `PatientCard` - Card com informações do plano
- `PatientHistoryCard` - Histórico médico (condições, medicamentos, alergias)
- `ClinicalHistoryCard` - Histórico clínico
- `ServicesGrid` - Grid de serviços (Triagem, Rede credenciada, etc)
- `WelcomeSection` - Banner de boas-vindas

**Como adicionar um novo serviço:**

1. Edite `src/app/(authenticated)/paciente/components/ServicesGrid.tsx`
2. Adicione o serviço no array `services`
3. Crie a rota correspondente se necessário

### 2. Triagem Inteligente (`/paciente/triagem`)

**Componentes principais:**

- `ChatHeader` - Cabeçalho do chat
- `ChatInput` - Input de mensagens (texto, áudio, arquivo)
- `ChatMessage` - Mensagens de texto
- `AudioMessage` - Mensagens de áudio
- `FileAttachment` - Anexos
- `TriageResultCard` - Resultado da triagem

**Sidebar:**

- `PatientCard` - Dados do paciente
- `Steps` - Etapas da triagem
- `HealthDataCards` - Dados de saúde
- `ValidationCard` - Validação médica
- `HistoryList` - Histórico de triagens

**Como funciona:**

- Usa o hook `useChat` para gerenciar mensagens
- Integra com API de IA via `chatService`
- Detecta automaticamente resultado da triagem

### 3. Admin RH (`/admin-rh`)

**Módulo de Beneficiários:**

- Listagem paginada
- Criação/edição de beneficiários
- Integração com operadoras e planos

**Estrutura:**

```
admin-rh/beneficiarios/
├── page.tsx              # Listagem
├── [id]/page.tsx         # Detalhes
├── services/             # Services de API
├── types/                # Types TypeScript
├── components/           # Componentes
└── utils/                # Utilitários
```

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Material-UI 7** - Biblioteca de componentes
- **Tailwind CSS 4** - Framework CSS utilitário
- **JWT** - Autenticação

---

## 📝 Padrões de Código

### Componentes

```typescript
"use client"; // Sempre use 'use client' para componentes interativos

import { Box, Button } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

interface MeuComponenteProps {
  title: string;
  onClick?: () => void;
}

export function MeuComponente({ title, onClick }: MeuComponenteProps) {
  const theme = useThemeColors();

  return (
    <Box
      sx={{
        bgcolor: theme.cardBackground,
        p: 2,
        borderRadius: "8px",
      }}
    >
      <Button
        onClick={onClick}
        sx={{
          bgcolor: theme.primary,
          color: theme.white,
        }}
      >
        {title}
      </Button>
    </Box>
  );
}
```

### Services

```typescript
import { api } from "./api";

export interface MeuTipo {
  id: string;
  name: string;
}

export const meuService = {
  async getAll(): Promise<MeuTipo[]> {
    const response = await api.get<MeuTipo[]>("/meu-endpoint");
    return response.data;
  },

  async getById(id: string): Promise<MeuTipo> {
    const response = await api.get<MeuTipo>(`/meu-endpoint/${id}`);
    return response.data;
  },
};
```

### Hooks Customizados

```typescript
import { useState, useEffect } from "react";
import { meuService } from "../services/meuService";

export function useMeuHook() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await meuService.getAll();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading };
}
```

---

## 🚦 Fluxo de Desenvolvimento

### 1. Criar uma Nova Página

**Para o Dashboard do Paciente:**

```bash
# 1. Criar a pasta
mkdir -p src/app/(authenticated)/paciente/minha-pagina

# 2. Criar page.tsx
touch src/app/(authenticated)/paciente/minha-pagina/page.tsx

# 3. Adicionar no ServicesGrid se necessário
```

**Para o Admin RH:**

```bash
# 1. Criar estrutura completa
mkdir -p src/app/(authenticated)/admin-rh/meu-modulo/{components,services,types,utils}

# 2. Criar page.tsx
touch src/app/(authenticated)/admin-rh/meu-modulo/page.tsx
```

### 2. Criar um Componente Reutilizável

Se o componente será usado em múltiplas páginas:

```bash
# Criar em shared/components
touch src/shared/components/MeuComponente.tsx
```

### 3. Criar um Hook Customizado

```bash
# Criar em shared/hooks
touch src/shared/hooks/useMeuHook.ts
```

### 4. Criar um Service

**Se for específico de uma página:**

```bash
# Criar na pasta da página
touch src/app/(authenticated)/paciente/services/meuService.ts
```

**Se for global:**

```bash
# Criar em shared/services
touch src/shared/services/meuService.ts
```

---

## 🎯 Exemplos Práticos

### Exemplo 1: Criar um Card Simples

```typescript
"use client";

import { Box, Typography } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

interface MeuCardProps {
  title: string;
  content: string;
}

export function MeuCard({ title, content }: MeuCardProps) {
  const theme = useThemeColors();

  return (
    <Box
      sx={{
        bgcolor: theme.cardBackground,
        borderRadius: "8px",
        p: 3,
        border: `1px solid ${theme.softBorder}`,
      }}
    >
      <Typography
        sx={{
          fontSize: "16px",
          fontWeight: 600,
          color: theme.textDark,
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          color: theme.textMuted,
        }}
      >
        {content}
      </Typography>
    </Box>
  );
}
```

### Exemplo 2: Criar um Formulário

```typescript
"use client";

import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

export function MeuFormulario() {
  const theme = useThemeColors();
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de submit
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{
          bgcolor: theme.primary,
          color: theme.white,
        }}
      >
        Enviar
      </Button>
    </Box>
  );
}
```

### Exemplo 3: Buscar Dados da API

```typescript
"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { api } from "@/shared/services/api";

interface MeusDados {
  id: string;
  name: string;
}

export function MinhaLista() {
  const theme = useThemeColors();
  const [data, setData] = useState<MeusDados[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get<MeusDados[]>("/meu-endpoint");
        setData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      {data.map((item) => (
        <Box key={item.id}>{item.name}</Box>
      ))}
    </Box>
  );
}
```

---

## 📚 Documentação Adicional

- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** ⭐ - **Guia rápido com exemplos práticos** (comece aqui!)
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Configuração de ambiente
- [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md) - Guia de multi-tenancy
- [src/shared/README.md](./src/shared/README.md) - Sistema de temas
- [src/app/(authenticated)/paciente/triagem/README.md](<./src/app/(authenticated)/paciente/triagem/README.md>) - Triagem
- [src/app/(authenticated)/admin-rh/beneficiarios/README.md](<./src/app/(authenticated)/admin-rh/beneficiarios/README.md>) - Beneficiários

---

## ❓ Dúvidas Frequentes

### Onde coloco meu código?

- **Específico de uma página** → pasta da página
- **Usado em múltiplas páginas** → `shared/`

### Como uso cores?

- **Sempre use** `useThemeColors()` para cores dinâmicas
- **Nunca use** cores hardcoded (exceto `#FFFFFF` para branco)

### Como autentico usuários?

- Use o hook `useAuth()` que já gerencia tudo
- O middleware protege rotas automaticamente

### Como adiciono uma nova rota?

- Crie uma pasta em `app/(authenticated)/` ou `app/(unauthenticated)/`
- Crie um arquivo `page.tsx` dentro da pasta
- A rota será automaticamente `/nome-da-pasta`

### Como faço requisições à API?

- Use `api` de `@/shared/services/api`
- Ele já tem interceptors configurados para tokens

---

## 🐛 Troubleshooting

### Erro de autenticação

- Verifique se o token está sendo salvo nos cookies
- Verifique se a API está retornando o token corretamente

### Cores não aparecem

- Certifique-se de usar `useThemeColors()` e não cores hardcoded
- Verifique se o tema está sendo carregado corretamente

### Rotas não funcionam

- Verifique se está usando `'use client'` em componentes interativos
- Verifique se a pasta está no lugar correto (`authenticated` vs `unauthenticated`)

---

**💡 Dica**: Sempre consulte os componentes existentes como referência antes de criar algo novo!
