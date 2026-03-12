# Módulo de Beneficiários

## 📋 Estrutura

```
beneficiarios/
├── page.tsx                     # Página principal de listagem
├── types/
│   └── beneficiary.ts          # Interfaces e tipos TypeScript
├── services/
│   └── beneficiaryService.ts   # Service layer para API
├── constants/
│   └── beneficiary.constants.ts # Constantes e configurações
└── utils/
    └── beneficiaryHelpers.ts   # Funções auxiliares e validações
```

## 🚀 Como usar

### 1. Configurar variáveis de ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 2. Endpoints da API esperados

O service espera os seguintes endpoints:

- `GET /api/users/beneficiaries` - Lista paginada de beneficiários
- `GET /api/users/beneficiaries/:id` - Busca um beneficiário por ID
- `POST /api/users/beneficiaries` - Cria um novo beneficiário
- `PUT /api/users/beneficiaries/:id` - Atualiza um beneficiário
- `DELETE /api/users/beneficiaries/:id` - Remove um beneficiário
- `PATCH /api/users/beneficiaries/:id/status` - Altera status (ativo/inativo)

## 📝 Tipos principais

### `Beneficiary`
```typescript
{
  id: string;
  name: string;
  cpf: string;
  email: string;
  active: boolean;
  phone?: string;
  dateOfBirth?: string;
  address?: BeneficiaryAddress;
  createdAt?: string;
  updatedAt?: string;
}
```

### `BeneficiariesResponse`
```typescript
{
  data: Beneficiary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}
```

## 🛠️ Helpers disponíveis

- `formatCPF()` - Formata CPF para xxx.xxx.xxx-xx
- `validateCPF()` - Valida CPF com dígitos verificadores
- `formatPhone()` - Formata telefone
- `formatDate()` - Formata data para pt-BR
- `validateEmail()` - Valida e-mail
- E mais...

## 🎨 Customização

As cores e estilos podem ser ajustados em:
- `constants/beneficiary.constants.ts` - Mensagens, validações, opções
- `page.tsx` - Estilos dos componentes MUI

## 🔒 Autenticação

O service usa automaticamente o token do localStorage:
- `auth_token` - Token de acesso
- `refresh_token` - Token de refresh

Certifique-se de que o usuário está autenticado antes de acessar esta página.

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique o console do navegador para erros
2. Confirme que a API está rodando e acessível
3. Valide as variáveis de ambiente
4. Use os dados mockados para testar a interface

