# Trya Platform API

<p align="center">
  API de administração da plataforma Trya - Sistema de gestão de saúde corporativa
</p>

<p align="center">
  <a href="#sobre">Sobre</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#pré-requisitos">Pré-requisitos</a> •
  <a href="#instalação">Instalação</a> •
  <a href="#uso">Uso</a> •
  <a href="#documentação-da-api">Documentação da API</a> •
  <a href="#testes">Testes</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 📋 Sobre

A **Trya Platform API** é um sistema backend robusto desenvolvido para gerenciar a plataforma de saúde corporativa Trya. O sistema oferece funcionalidades completas de administração, incluindo gestão de usuários, corretoras, empresas e um sistema de fila de aprovação de consultas médicas.

Na fila de aprovação, médicos revisam atendimentos completos de pacientes (beneficiários) que incluem: resumos de conversas e análises iniciais gerados por IA, exames médicos enviados pelos pacientes, dados da sessão e associação com a empresa (tenant).

### Arquitetura

O projeto segue os princípios da **Clean Architecture** com separação clara de responsabilidades em quatro camadas:

- **Domain** - Entidades de negócio, objetos de valor, interfaces e erros
- **Application** - Casos de uso e orquestração da lógica de negócio
- **Infrastructure** - Serviços externos, repositórios e mapeadores
- **Presentation** - Controllers, DTOs, guards e decorators

---

## ✨ Funcionalidades

### Autenticação e Autorização

- ✅ Autenticação via AWS Cognito com tokens JWT
- ✅ Controle de acesso baseado em roles (RBAC)
- ✅ Três níveis de permissão: Super Admin, Admin e Doctor
- ✅ Refresh token para renovação de sessão
- ✅ Recuperação de senha com código OTP
- ✅ Troca de senha obrigatória no primeiro acesso

### Gestão de Usuários

- ✅ CRUD completo de usuários administradores
- ✅ CRUD completo de médicos com perfil especializado
- ✅ Persistência dual (AWS Cognito + PostgreSQL)
- ✅ Ativação/desativação de usuários
- ✅ Atualização de perfil com validações específicas por role
- ✅ Listagem paginada com filtros

### Gestão de Corretoras e Empresas

- ⏳ CRUD de corretoras (brokers)
- ⏳ CRUD de empresas (tenants)
- ⏳ Associação entre empresas e corretoras
- ⏳ Validações de dados e regras de negócio

### Sistema de Módulos

- ⏳ Configuração de módulos disponíveis na plataforma
- ⏳ Gestão de funcionalidades e capacidades

### Fila de Aprovação de Consultas Médicas

- ✅ Criação de solicitações de aprovação via API (integração com trya-backend)
- ⏳ Revisão de consultas completas de pacientes (beneficiários)
- ⏳ Visualização de resumos de conversas e análises iniciais gerados por IA
- ⏳ Acesso a exames médicos enviados pelos pacientes
- ⏳ Dados de sessão e associação com empresa (tenant)
- ⏳ Aprovação/rejeição de consultas por médicos
- ⏳ Filtros por status (pendente, aprovado, rejeitado)
- ⏳ Histórico de decisões com notas
- ⏳ Trilha de auditoria completa

### Recursos Técnicos

- ✅ Documentação interativa com Swagger/OpenAPI
- ✅ Sistema de notificações via AWS SES (emails transacionais)
- ✅ Armazenamento híbrido (PostgreSQL + DynamoDB)
- ✅ Migrations automáticas com TypeORM
- ✅ Seeds para dados iniciais
- ✅ Containerização com Docker
- ✅ Validação automática de DTOs
- ✅ Tratamento centralizado de exceções
- ✅ Logs estruturados
- ✅ Headers de segurança (HSTS, CSP, etc.)

---

## 🚀 Tecnologias

### Core

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript

### Database & Storage

- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional principal
- **[TypeORM](https://typeorm.io/)** - ORM com suporte a migrations
- **[AWS DynamoDB](https://aws.amazon.com/dynamodb/)** - Banco NoSQL para dados de sessão e cache

### AWS Services

- **[AWS Cognito](https://aws.amazon.com/cognito/)** - Autenticação e gerenciamento de usuários
- **[AWS DynamoDB](https://aws.amazon.com/dynamodb/)** - Banco de dados NoSQL para dados de alta performance
- **[AWS SES](https://aws.amazon.com/ses/)** - Serviço de envio de emails transacionais
- **[AWS S3](https://aws.amazon.com/s3/)** - Armazenamento de arquivos (futuro)

### Libraries

- `@nestjs/jwt` - Autenticação JWT
- `@nestjs/passport` - Estratégias de autenticação
- `@nestjs/swagger` - Documentação OpenAPI
- `class-validator` - Validação de DTOs
- `class-transformer` - Transformação de objetos
- `jwks-rsa` - Validação de tokens JWT

### DevOps

- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers
- **[ESLint](https://eslint.org/)** - Linting
- **[Prettier](https://prettier.io/)** - Formatação de código
- **[Jest](https://jestjs.io/)** - Testing framework

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ou 22+ (LTS recomendado)
- **npm** ou **pnpm** (gerenciador de pacotes)
- **Docker** 20.10+ e **Docker Compose** 2.0+ (para setup containerizado)
- **PostgreSQL** 14+ (se executar localmente sem Docker)
- **Conta AWS** com User Pool do Cognito configurado
- **AWS CLI** (opcional, para autenticação via AWS SSO)

---

## 🔧 Instalação

### Opção 1: Docker (Recomendado)

A forma mais rápida de começar é usando Docker Compose:

#### Modo Desenvolvimento

```bash
# 1. Clone o repositório
git clone <repository-url>
cd handslab-trya-platform-backend

# 2. Copie o arquivo de ambiente
cp .env.example .env

# 3. Configure as variáveis de ambiente (veja seção Configuração)
nano .env

# 4. Inicie a aplicação com hot reload
docker-compose -f docker-compose.dev.yml up
```

A API estará disponível em `http://localhost:3000` com documentação Swagger em `http://localhost:3000/api/docs`

#### Modo Produção

```bash
# 1. Configure o .env para produção
cp .env.example .env
nano .env

# 2. Inicie a aplicação
docker-compose up -d

# 3. Visualize os logs
docker-compose logs -f app
```

### Opção 2: Instalação Local

#### 1. Instalar Dependências

```bash
npm install
# ou
pnpm install
```

#### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

**Opções de Autenticação AWS:**

Opção 1 - AWS SSO (Recomendado para desenvolvimento):

```bash
AWS_PROFILE=meu-perfil-sso
```

Opção 2 - Chaves de Acesso IAM:

```bash
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
```

**API Key para Integrações:**

Gere uma API Key segura para autenticar integrações externas (ex: Trya Backend):

```bash
# Gerar API Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicionar no .env
TRYA_PLATFORM_API_KEY=sua-api-key-gerada
```

**Configuração Opcional:**

```bash
# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

#### 3. Configurar Banco de Dados

**Se estiver usando Docker:**

Execute migrations e seeds dentro do container:

```bash
# Executar migrations
docker-compose -f docker-compose.dev.yml exec app npm run typeorm:migration:run

# Criar usuários iniciais
docker-compose -f docker-compose.dev.yml exec app npm run seed:initial
```

**Se estiver rodando localmente:**

Certifique-se de que o PostgreSQL está rodando e execute:

```bash
# Executar migrations
npm run typeorm:migration:run

# Criar usuários iniciais
npm run seed:initial
```

O script de seed criará três usuários:

- Super Admin: `superadmin@tryaplatform.com`
- Admin: `admin@tryaplatform.com`
- Doctor: `doctor@tryaplatform.com`

**Importante:** Você precisará criar esses usuários no AWS Cognito e atualizar o `cognito_id` no banco de dados.

#### 4. Configurar AWS SES (Envio de Emails)

Para enviar emails transacionais (OTP, boas-vindas, etc.), configure o SES:

**Passo 1: Verificar email no AWS SES**

```bash
# Via AWS Console:
# 1. Acesse: https://console.aws.amazon.com/ses/
# 2. Certifique-se de estar na região US-EAST-1
# 3. Menu lateral → "Verified identities" → "Create identity"
# 4. Selecione "Email address"
# 5. Digite seu email (ex: seu-email@skopia.com.br)
# 6. Clique em "Create identity"
# 7. Acesse sua caixa de entrada e clique no link de verificação

# Via AWS CLI:
aws ses verify-email-identity \
  --email-address seu-email@skopia.com.br \
  --region us-east-1
```

**Passo 2: Configurar variável de ambiente**

```bash
# No arquivo .env, adicione:
NOTIFICATION_PROVIDER=ses
AWS_SES_FROM_EMAIL=seu-email@skopia.com.br
```

**Modo Desenvolvimento (Opcional):**

Para desenvolvimento sem configurar SES, use o modo console (emails aparecem no log):

```bash
NOTIFICATION_PROVIDER=console
```

**Nota:** O SES inicia em modo sandbox (limite de 200 emails/dia para endereços verificados). Para produção, solicite acesso via AWS Console → SES → "Request production access".

#### 5. Iniciar a Aplicação

```bash
# Desenvolvimento com hot reload
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

---

## 🎯 Uso

### Comandos Disponíveis

#### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
npm run start:dev

# Iniciar em modo debug
npm run start:debug

# Build para produção
npm run build

# Iniciar em modo produção
npm run start:prod
```

#### Qualidade de Código

```bash
# Executar linting e correção automática
npm run lint

# Formatar código com Prettier
npm run format
```

#### Database

**Desenvolvimento Local:**

```bash
# Executar migrations pendentes
npm run typeorm:migration:run

# Gerar nova migration
npm run typeorm:migration:generate -- src/database/migrations/NomeDaMigration

# Reverter última migration
npm run typeorm:migration:revert

# Criar usuários iniciais
npm run seed:initial

# Executar todos os seeds
npm run seed:all
```

**Desenvolvimento com Docker:**

```bash
# Executar migrations no container
docker-compose -f docker-compose.dev.yml exec app npm run typeorm:migration:run

# Gerar nova migration no container
docker-compose -f docker-compose.dev.yml exec app npm run typeorm:migration:generate -- src/database/migrations/NomeDaMigration

# Reverter última migration no container
docker-compose -f docker-compose.dev.yml exec app npm run typeorm:migration:revert

# Criar usuários iniciais no container
docker-compose -f docker-compose.dev.yml exec app npm run seed:initial

# Executar todos os seeds no container
docker-compose -f docker-compose.dev.yml exec app npm run seed:all
```

#### Docker

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up          # Iniciar
docker-compose -f docker-compose.dev.yml up -d       # Iniciar em background
docker-compose -f docker-compose.dev.yml down        # Parar
docker-compose -f docker-compose.dev.yml logs -f app # Ver logs

# Produção
docker-compose up -d                                 # Iniciar
docker-compose down                                  # Parar
docker-compose logs -f app                           # Ver logs
docker-compose exec app sh                           # Acessar shell do container
```

### Usando AWS SSO

Se estiver usando AWS SSO para autenticação:

```bash
# 1. Configurar perfil SSO
aws configure sso

# 2. Definir AWS_PROFILE no .env
AWS_PROFILE=meu-perfil-sso

# 3. Fazer login antes de executar a aplicação
aws sso login --profile meu-perfil-sso
```

---

## 📚 Documentação da API

### Swagger UI

Após iniciar a aplicação, acesse a documentação interativa completa em:

```
http://localhost:3000/api/docs
```

A interface Swagger oferece:

- ✅ Teste interativo de todos os endpoints
- ✅ Schemas detalhados de request/response
- ✅ Autenticação com tokens JWT
- ✅ Exemplos de uso para cada endpoint
- ✅ Documentação completa com descrições e validações

**Todos os endpoints, parâmetros, exemplos e detalhes estão documentados no Swagger. Consulte a interface para informações completas sobre a API.**

### Importar para Postman/Insomnia

#### Postman

**Opção 1: Importar via URL (Recomendado)**

1. Abra o Postman
2. Clique em "Import"
3. Selecione a aba "Link"
4. Cole: `http://localhost:3000/api/docs/json`
5. Clique em "Continue" e "Import"

**Opção 2: Download e Importação**

```bash
# Baixar spec JSON
curl http://localhost:3000/api/docs/json -o openapi.json

# Baixar spec YAML
curl http://localhost:3000/api/docs/yaml -o openapi.yaml
```

Depois importe o arquivo baixado no Postman.

#### Insomnia

1. Abra o Insomnia
2. Clique em "Create" → "Import From" → "URL"
3. Cole: `http://localhost:3000/api/docs/json`
4. Clique em "Fetch and Import"

### Autenticação

Para acessar endpoints protegidos:

1. Faça login via `POST /auth/sign-in`
2. Copie o `accessToken` da resposta
3. No Swagger: Clique em "Authorize" e cole o token
4. No Postman/Insomnia: Adicione header `Authorization: Bearer {token}`

---

## 🧪 Testes

> ⚠️ **Nota:** A suíte de testes ainda não foi implementada. Os comandos abaixo estão disponíveis mas os testes precisam ser desenvolvidos.

### Testes Unitários

```bash
# Executar todos os testes
npm run test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm run test:cov
```

### Testes E2E

```bash
# Executar testes end-to-end
npm run test:e2e
```

### Debug de Testes

```bash
# Executar testes em modo debug
npm run test:debug
```

### Cobertura de Código

Após executar `npm run test:cov`, o relatório de cobertura estará disponível em `coverage/lcov-report/index.html`

---

## 🔒 Segurança

A aplicação implementa diversas camadas de segurança:

### Headers de Segurança

- **HSTS** - HTTP Strict Transport Security
- **X-Content-Type-Options** - Previne MIME sniffing
- **X-Frame-Options** - Proteção contra clickjacking
- **X-XSS-Protection** - Proteção XSS
- **Content-Security-Policy** - Política de segurança de conteúdo

### Autenticação e Autorização

- Tokens JWT com expiração configurável
- Refresh tokens para renovação de sessão
- Validação de tokens via JWKS (JSON Web Key Set)
- Controle de acesso baseado em roles (RBAC)
- Guards globais para proteção de rotas

### Validação e Sanitização

- Validação automática de todos os inputs via class-validator
- Transformação segura de dados via class-transformer
- Proteção contra SQL injection via TypeORM
- Validação de tipos em tempo de compilação com TypeScript

### Persistência Dual

- Transações entre Cognito e PostgreSQL
- Rollback automático em caso de falha
- Consistência de dados garantida

### CORS

- Configuração de origens permitidas
- Suporte a credenciais
- Headers personalizados

### Logs e Auditoria

- Logs estruturados de todas as operações
- Trilha de auditoria para ações críticas
- Tratamento centralizado de exceções

---

## � Deoployment

### Deploy com Docker

```bash
# 1. Build da imagem
docker build -t trya-platform-api .

# 2. Execute o container
docker run -p 3000:3000 --env-file .env trya-platform-api
```


### Checklist de Produção

- [ ] Configurar `NODE_ENV=production`
- [ ] Usar secrets manager para credenciais sensíveis
- [ ] Configurar HTTPS/SSL
- [ ] Habilitar logs estruturados
- [ ] Configurar backup automático do banco
- [ ] Implementar monitoramento (CloudWatch, DataDog, etc.)
- [ ] Configurar alertas de erro
- [ ] Revisar políticas de CORS
- [ ] Configurar rate limiting
- [ ] Implementar health checks
- [ ] Documentar processo de rollback

---

## 📁 Estrutura do Projeto

```
src/
├── config/                    # Configurações da aplicação
│   ├── app.config.ts         # Configurações gerais
│   └── aws.config.ts         # Credenciais AWS
│
├── database/                  # Camada de banco de dados
│   ├── entities/             # Entidades TypeORM
│   ├── migrations/           # Migrations do banco
│   └── seeds/                # Scripts de seed
│
├── modules/                   # Módulos da aplicação
│   ├── auth/                 # Módulo de autenticação
│   │   ├── domain/           # Lógica de negócio
│   │   ├── application/      # Casos de uso
│   │   ├── infrastructure/   # Serviços externos
│   │   └── presentation/     # Controllers e DTOs
│   │
│   ├── users/                # Módulo de usuários
│   ├── doctors/              # Módulo de médicos
│   ├── brokers/              # Módulo de corretoras
│   ├── companies/            # Módulo de empresas
│   ├── modules/              # Módulo de módulos
│   └── approval-queue/       # Módulo de aprovação
│
└── shared/                    # Código compartilhado
    ├── domain/               # Lógica de domínio compartilhada
    ├── presentation/         # Guards, filters, decorators
    └── validators/           # Validadores customizados
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Siga o guia de estilo do ESLint configurado
- Use Prettier para formatação
- Escreva testes para novas funcionalidades
- Documente mudanças significativas
- Use commits semânticos (feat, fix, docs, etc.)

---

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

## 👥 Equipe

Desenvolvido por **Skopia** para **Trya**

---

## 📞 Suporte

Para questões e suporte:

- 📱 Slack: #trya-platform-dev

---

## 🔗 Links Úteis

- [Documentação NestJS](https://docs.nestjs.com)
- [Documentação TypeORM](https://typeorm.io)
- [Documentação AWS Cognito](https://docs.aws.amazon.com/cognito)
- [Documentação AWS DynamoDB](https://docs.aws.amazon.com/dynamodb)
- [Documentação AWS SES](https://docs.aws.amazon.com/ses)
- [Documentação PostgreSQL](https://www.postgresql.org/docs)
- [Documentação Docker](https://docs.docker.com)

---

<p align="center">
  Feito com ❤️ pela equipe Skopia
</p>
