# 🏥 Trya Backend - HandsLab

Backend da plataforma Trya para gestão hospitalar multi-tenant, construído com **NestJS**, **Clean Architecture**, **SOLID** e **AWS Services**.

## 📋 Descrição

Sistema backend completo para gestão hospitalar com suporte a múltiplas organizações (multi-tenancy), autenticação via AWS Cognito, e arquitetura escalável baseada em princípios de Clean Architecture e SOLID.

## 🏗️ Arquitetura

- **Framework**: NestJS + TypeScript
- **Arquitetura**: Clean Architecture (Domain, Application, Infrastructure, Presentation)
- **Princípios**: SOLID
- **Autenticação**: AWS Cognito
- **Database**: DynamoDB
- **Storage**: S3
- **AI**: Amazon Bedrock
- **Multi-tenancy**: Row-level isolation

## 🚀 Quick Start

### 1. Instalação

```bash
npm install
```

### 2. Configuração

Copie o arquivo de exemplo e configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais AWS e Cognito

### 3. Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### 4. Testar

#### Opção 1: Swagger UI (Recomendado) 🎯

Abra no navegador:
```
http://localhost:3000/api/docs
```

Use a interface interativa para testar todos os endpoints!

#### Opção 2: cURL

```bash
# HTTP (padrão)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# HTTPS (se configurado)
curl -X POST https://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```

## 📚 Documentação da API (Swagger)

A API possui documentação interativa via Swagger/OpenAPI:

```
http://localhost:3000/api/docs
```

ou com HTTPS:

```
https://localhost:3000/api/docs
```

### Features do Swagger:
- 🔍 Explorar todos os endpoints
- ✅ Testar requisições diretamente no navegador
- 🔐 Autenticação JWT integrada
- 📝 Documentação completa de request/response
- 💡 Exemplos de uso

## 🔐 Endpoints da API

### Autenticação (`/api/auth`)

- `POST /login` - Login com email e senha
- `POST /complete-new-password` - Completar troca de senha (primeiro login)
- `POST /refresh` - Renovar access token
- `POST /logout` - Logout (requer autenticação)
- `GET /me` - Informações do usuário (requer autenticação)
- `GET /authorize` - URL de autorização OAuth
- `GET /callback` - Callback OAuth

### Health Check (`/api`)

- `GET /` - Hello World
- `GET /health` - Status da aplicação

## 🏢 Multi-Tenancy

A aplicação é **multi-tenant nativa**:

✅ Isolamento automático de dados por tenant  
✅ Validação de tenant em todas as rotas protegidas  
✅ Suporte a múltiplas formas de identificação de tenant  
✅ Guards de segurança automáticos  
✅ Impossível acessar dados de outro tenant  

### Login Multi-Tenant

```bash
# Com tenant no body
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital1.com",
    "password": "Password123!",
    "tenantId": "hospital1-uuid"
  }'

# Com tenant no header
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: hospital1-uuid" \
  -d '{
    "email": "doctor@hospital1.com",
    "password": "Password123!"
  }'
```

## 🛠️ Tecnologias

### Core
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem
- **Class Validator** - Validação de DTOs
- **Class Transformer** - Transformação de dados

### AWS Services
- **AWS Cognito** - Autenticação e gerenciamento de usuários
- **AWS DynamoDB** - Banco de dados NoSQL
- **AWS S3** - Armazenamento de arquivos
- **AWS Bedrock** - IA para triagem
- **AWS SES** - Envio de emails
- **AWS SNS** - Notificações

### Development
- **ESLint** - Linting
- **Prettier** - Formatação de código
- **Jest** - Testes
- **TypeScript ESLint** - Linting TypeScript

## 📁 Estrutura do Projeto

```
src/
├── config/                  # Configurações (AWS, App)
├── modules/
│   └── auth/               # Módulo de Autenticação
│       ├── domain/         # Entidades, VOs, Interfaces
│       ├── application/    # Use Cases, Mappers
│       ├── infrastructure/ # Cognito Repository
│       └── presentation/   # Controllers, DTOs, Guards
└── shared/                 # Código compartilhado
    ├── domain/             # Entidades base, Enums
    └── presentation/       # Guards, Decorators, Filters
```

## 🔒 Segurança

### ✅ Autenticação Segura

- **HTTPS**: Obrigatório em produção (redirecionamento automático)
- **Senhas**: Enviadas via HTTPS (criptografadas em trânsito com TLS)
- **AWS Cognito**: Armazena senhas com bcrypt/scrypt
- **OTP**: Códigos de 6 dígitos com expiração de 5 minutos
- **JWT**: Access tokens + Refresh tokens com assinatura criptográfica

### 🛡️ Security Headers

Aplicados automaticamente em produção:
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Guards Globais (aplicados em ordem)

1. **JwtAuthGuard** - Valida token JWT
2. **TenantGuard** - Valida acesso ao tenant
3. **RolesGuard** - Valida permissões por role

### Roles Disponíveis

```typescript
- SUPER_ADMIN     // Acesso total ao sistema
- ADMIN           // Administrador do tenant
- DOCTOR          // Médico
- HR              // Recursos Humanos
- BENEFICIARY     // Beneficiário/Paciente (padrão)
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 🎨 Integração com Frontend React

### Setup do Axios

```typescript
// api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@trya:accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Context Provider

```typescript
// context/AuthContext.tsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signIn = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('@trya:accessToken', response.data.accessToken);
    setUser(response.data.user);
  };

  const signOut = async () => {
    const token = localStorage.getItem('@trya:accessToken');
    await api.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.removeItem('@trya:accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

Veja exemplos completos em [README_AUTH.md](./README_AUTH.md).

## 📦 Variáveis de Ambiente

```env
# Application
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:3000

# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id
COGNITO_CLIENT_SECRET=your-client-secret
COGNITO_REGION=us-east-1

# DynamoDB
DYNAMODB_TENANTS_TABLE=trya-tenants
DYNAMODB_USERS_TABLE=trya-users
# ... outras tabelas
```

Veja `.env.example` para a lista completa.

## 🐳 Docker

Este projeto está pronto para ser executado com Docker!

### Desenvolvimento

```bash
# Executar em modo desenvolvimento com hot reload
docker-compose -f docker-compose.dev.yml up
```

### Produção

```bash
# Build e executar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

Para mais detalhes, veja [DOCKER.md](./DOCKER.md).

## 🚀 Deploy

### Docker (Recomendado)

```bash
# Production
docker-compose up -d

# AWS ECS/Fargate
# Use o Dockerfile fornecido e configure no AWS Console
```

### AWS EC2/Lambda

```bash
# Build
npm run build

# Deploy para EC2, ECS ou Lambda
# Configure as variáveis de ambiente no serviço
```

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🌱 Seeds do Banco de Dados

Antes de começar a usar o sistema, é necessário popular o banco com dados iniciais:

```bash
# Executar todas as seeds (recomendado)
npm run seed:all

# Ou executar individualmente na ordem:
npm run seed:tenants              # ⚠️ OBRIGATÓRIO PRIMEIRO
npm run seed:chronic-conditions   # Condições crônicas
npm run seed:medications          # Medicamentos
npm run seed:initial-config       # Dados de exemplo
```

### ⚠️ Importante: Tenants

**Todos os usuários devem pertencer a um tenant válido.** Antes de criar usuários, execute:

```bash
npm run seed:tenants
```

**Tenants disponíveis para uso:**
- `550e8400-e29b-41d4-a716-446655440000` - Hospital Demo
- `550e8400-e29b-41d4-a716-446655440001` - Clínica Saúde
- `550e8400-e29b-41d4-a716-446655440002` - Laboratório Vida

Para mais detalhes, veja [src/database/seeds/README.md](./src/database/seeds/README.md).

## 🔧 Troubleshooting

Encontrou algum problema? Consulte o [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para soluções de problemas comuns.

## 📝 Próximos Passos

- [ ] Implementar módulo de pacientes
- [ ] Implementar módulo de prontuários
- [ ] Adicionar testes unitários e e2e
- [ ] Adicionar CI/CD