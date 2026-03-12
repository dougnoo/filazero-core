# Organização AWS - Infraestrutura Trya

## Visão Geral

Este documento descreve a arquitetura multi-conta da infraestrutura Trya no AWS Organizations, explicando como as contas são organizadas e quais recursos são provisionados em cada uma delas.

## Índice

1. [Modelo de Contas](#modelo-de-contas)
2. [Estrutura do AWS Organizations](#estrutura-do-aws-organizations)
3. [Contas Disponíveis](#contas-disponíveis)
4. [Arquitetura de Recursos](#arquitetura-de-recursos)
5. [Stack de Aplicações](#stack-de-aplicações)
6. [Módulos de Infraestrutura](#módulos-de-infraestrutura)
7. [Gestão de Estado Terraform](#gestão-de-estado-terraform)
8. [Convenções e Padrões](#convenções-e-padrões)
9. [Estratégia de Branches e Deployments (Bitbucket)](#estratégia-de-branches-e-deployments-bitbucket)

---

## Modelo de Contas

### Princípio: Uma Conta por Cliente + Ambiente

A infraestrutura Trya segue o modelo **multi-conta**, onde cada combinação de **cliente + ambiente** resulta em uma conta AWS separada. Este modelo oferece:

- **Isolamento total** entre clientes e ambientes
- **Segurança aprimorada** com boundaries claras
- **Billing separado** por cliente/ambiente
- **Limites de serviço independentes**
- **Blast radius reduzido** em caso de incidentes

### Nomenclatura das Contas

Padrão: `{cliente}-{ambiente}`

Exemplos:
- `admin-trya-dev` → Cliente "admin-trya" no ambiente "dev"
- `grupo-trigo-prod` → Cliente "grupo-trigo" no ambiente "prod"
- `trya-saas-hml` → Cliente "trya-saas" no ambiente "hml"

---

## Estrutura do AWS Organizations

```
Trya Organization (Root)
│
├── trya-main (Management Account)
│   └── Gerenciamento central do Organizations
│   └── Route53 Hosted Zones
│   └── Billing consolidado
│
├── Contas de Desenvolvimento
│   ├── admin-trya-dev
│   └── trya-saas-dev
│
├── Contas de Homologação
│   ├── admin-trya-hml
│   ├── grupo-trigo-hml
|   ├── concrejato-hml
│   └── trya-saas-hml
│
└── Contas de Produção
    ├── admin-trya-prod
    ├── grupo-trigo-prod
    └── concrejato-prod
```

---

## Contas Disponíveis

### 1. trya-main (Management Account)
- **Account ID**: `416684166863`
- **Propósito**: Conta raiz do AWS Organizations
- **Recursos**:
  - AWS Organizations
  - Route53 Hosted Zones centralizadas
  - Billing consolidado
  - IAM Identity Center (SSO)

### 2. admin-trya-dev
- **Account ID**: `751426053736`
- **Ambiente**: Desenvolvimento
- **Região**: `us-east-1`
- **Domínio**: `dev.admin.trya.ai`
- **Tier**: Standard

### 3. admin-trya-hml
- **Account ID**: A definir
- **Ambiente**: Homologação
- **Região**: `us-east-1`
- **Domínio**: `hml.admin.trya.ai`
- **Tier**: Standard

### 4. admin-trya-prod
- **Account ID**: A definir
- **Ambiente**: Produção
- **Região**: `us-east-1`
- **Domínio**: `admin.trya.ai`
- **Tier**: Enterprise

### 5. grupo-trigo-hml
- **Account ID**: `363160364844`
- **Ambiente**: Homologação
- **Região**: `us-east-1`
- **Domínio**: `hml.trigo.trya.ai`
- **API**: `hml-api.trigo.trya.ai`
- **Tier**: Enterprise

### 6. grupo-trigo-prod
- **Account ID**: A definir
- **Ambiente**: Produção
- **Região**: `us-east-1`
- **Domínio**: `trigo.trya.ai`
- **Tier**: Enterprise

### 7. trya-saas-dev
- **Account ID**: A definir
- **Ambiente**: Desenvolvimento
- **Região**: `us-east-1`
- **Domínio**: `dev.trya.ai`
- **Tier**: Standard

### 8. trya-saas-hml
- **Account ID**: A definir
- **Ambiente**: Homologação
- **Região**: `us-east-1`
- **Domínio**: `hml.trya.ai`
- **Tier**: Standard

### 9. concrejato-hml
- **Account ID**: A definir
- **Ambiente**: Homologação
- **Região**: `us-east-1`
- **Tier**: Standard

---

## Arquitetura de Recursos

Cada conta AWS contém uma stack completa de recursos organizados em camadas:

### Camada de Rede (Networking)
```
VPC (10.0.0.0/16)
├── Subnets Públicas (2 AZs)
│   ├── us-east-1a: 10.0.1.0/24
│   └── us-east-1b: 10.0.2.0/24
│
├── Subnets Privadas (2 AZs)
│   ├── us-east-1a: 10.0.11.0/24
│   └── us-east-1b: 10.0.12.0/24
│
├── Internet Gateway
├── NAT Gateway (1 por AZ)
└── Route Tables
```

### Camada de Dados (Data Layer)
```
Data Layer
├── Aurora PostgreSQL Serverless v2
│   ├── Multi-AZ
│   ├── Auto-scaling (0.5 - 16 ACUs)
│   └── Schemas: public, tenant_*, platform
│
├── DynamoDB Tables
│   ├── Sessions
│   ├── OTP (One-Time Passwords)
│   ├── OTP Platform
│   └── Tenant Metadata
│
└── ElastiCache Serverless (Valkey)
    ├── Cache de sessões
    └── Cache de dados frequentes
```

### Camada de Computação (Compute Layer)
```
Compute
├── ECS Fargate Clusters
│   ├── Backend Cluster
│   ├── Platform Cluster
│   └── Frontend Cluster
│
├── Lambda Functions
│   ├── Chat Agents (IA)
│   └── Funções auxiliares
│
└── ECR Repositories
    ├── trya-backend
    ├── trya-platform-backend
    └── trya-frontend
```

### Camada de Entrega (CDN/Load Balancing)
```
CDN & Load Balancing
├── Application Load Balancers
│   ├── Backend ALB (interno)
│   ├── Platform ALB (interno)
│   └── Frontend ALB (público)
│
└── CloudFront Distributions
    └── Frontend CDN (global)
```

### Camada de Segurança
```
Security
├── WAF (Web Application Firewall)
│   ├── Rate limiting
│   ├── SQL injection protection
│   └── XSS protection
│
├── Cognito User Pools
│   ├── Autenticação de usuários
│   └── MFA habilitado
│
├── KMS Keys
│   ├── Encryption at rest
│   └── Secrets encryption
│
└── Security Groups
    ├── ALB SG
    ├── ECS SG
    ├── Aurora SG
    └── Lambda SG
```

### Camada de Armazenamento
```
Storage
├── S3 Buckets
│   ├── Assets estáticos
│   ├── Uploads de usuários
│   ├── Knowledge Base (IA)
│   └── Logs

```

### Camada de IA/ML
```
AI/ML
├── Bedrock Knowledge Base
│   ├── Embeddings
│   └── Vector search
│
└── Lambda AI Agents
    ├── Chat agents
    └── Document processing
```

---

## Stack de Aplicações

Cada conta pode conter os seguintes stacks de aplicação:

### 1. Backend Stack
**Propósito**: API principal do Trya

```
backend/
├── ecr/          # Container registry
├── alb/          # Load balancer
├── ecs/          # ECS Fargate service
├── waf/          # Web Application Firewall
└── s3/           # Storage para uploads
```

**Recursos**:
- ECS Service com auto-scaling (2-10 tasks)
- ALB com health checks
- WAF com regras de proteção
- Integração com Aurora e ElastiCache

### 2. Platform Stack
**Propósito**: API da plataforma médica

```
platform/
├── ecr/          # Container registry
├── alb/          # Load balancer
├── ecs/          # ECS Fargate service
├── waf/          # Web Application Firewall
└── s3/           # Storage específico
```

**Recursos**:
- ECS Service dedicado
- ALB separado
- Schemas dedicados no Aurora
- Isolamento de recursos

### 3. Frontend Stack
**Propósito**: Aplicação Next.js

```
frontend/
├── ecr/          # Container registry
├── alb/          # Load balancer
├── ecs/          # ECS Fargate service
├── cloudfront/   # CDN global
└── s3-assets/    # Assets estáticos
```

**Recursos**:
- ECS Service para SSR
- CloudFront para cache global
- S3 para assets estáticos
- Certificado SSL/TLS

### 4. Chat Agents Stack
**Propósito**: Agentes de IA conversacional

```
chat-agents/
├── lambda-ai/              # Lambda functions
├── s3-knowledgebase/       # Knowledge base storage
└── bedrock-knowledgebase/  # Bedrock KB config
```

**Recursos**:
- Lambda functions em VPC
- Bedrock Knowledge Base
- S3 para documentos
- VPC Endpoints para Bedrock

### 5. Data Stack
**Propósito**: Camada de persistência

```
data/
├── aurora/              # PostgreSQL Serverless v2
├── dynamodb/            # Sessions table
├── dynamodb-otp/        # OTP table
├── dynamodb-otp-platform/  # Platform OTP
├── dynamodb-tenant/     # Tenant metadata
└── elasticache/         # Valkey cache
```

### 6. Shared Services Stack
**Propósito**: Recursos compartilhados

```
shared-services/
├── cognito/     # User authentication
├── s3/          # Shared storage
└── ses/         # Email service
```

---

## Módulos de Infraestrutura

A infraestrutura é construída usando módulos Terraform reutilizáveis:

### AI (Inteligência Artificial)
```
modules/ai/
└── bedrock/     # AWS Bedrock integration
```

### CDN (Content Delivery)
```
modules/cdn/
├── alb/         # Application Load Balancer
└── cloudfront/  # CloudFront distribution
```

### Compute (Computação)
```
modules/compute/
├── ecr/         # Elastic Container Registry
├── ecs-service/ # ECS Fargate service
└── lambda/      # Lambda functions
```

### Data (Dados)
```
modules/data/
├── aurora/      # Aurora PostgreSQL
├── dynamodb/    # DynamoDB tables
└── elasticache/ # ElastiCache Serverless
```

### Networking (Rede)
```
modules/networking/
├── vpc/                # VPC com subnets
├── route53/            # DNS zones
└── route53-records/    # DNS records
```

### Security (Segurança)
```
modules/security/
├── acm-cross-account/      # SSL certificates
├── cognito/                # User pools
├── cognito-identity/       # Identity pools
├── kms/                    # Encryption keys
├── lambda-sg/              # Lambda security groups
└── waf/                    # Web Application Firewall
```

### Storage (Armazenamento)
```
modules/storage/
├── s3/          # S3 buckets
└── s3-logs/     # Log buckets
```

### Observability (Observabilidade)
```
modules/observability/
└── cloudwatch/  # Logs, metrics, dashboards
```

### Messaging (Mensageria)
```
modules/messaging/
└── ses/         # Simple Email Service
```

### Management (Gerenciamento)
```
modules/management/
└── organizations/  # AWS Organizations
```

---

## Gestão de Estado Terraform

### Estrutura de State

Cada conta AWS possui:
- **Bucket S3**: `tfstate-{account-name}`
- **DynamoDB Table**: `terraform-locks`
- **Encryption**: Habilitado (AES-256)

### Organização do State

```
tfstate-admin-trya-dev/
├── stack/
│   ├── backend/
│   │   ├── ecr/terraform.tfstate
│   │   ├── alb/terraform.tfstate
│   │   ├── ecs/terraform.tfstate
│   │   ├── waf/terraform.tfstate
│   │   └── s3/terraform.tfstate
│   │
│   ├── platform/
│   │   ├── ecr/terraform.tfstate
│   │   ├── alb/terraform.tfstate
│   │   ├── ecs/terraform.tfstate
│   │   ├── waf/terraform.tfstate
│   │   └── s3/terraform.tfstate
│   │
│   ├── frontend/
│   │   ├── ecr/terraform.tfstate
│   │   ├── alb/terraform.tfstate
│   │   ├── ecs/terraform.tfstate
│   │   ├── cloudfront/terraform.tfstate
│   │   └── s3-assets/terraform.tfstate
│   │
│   ├── data/
│   │   ├── aurora/terraform.tfstate
│   │   ├── dynamodb/terraform.tfstate
│   │   ├── dynamodb-otp/terraform.tfstate
│   │   ├── dynamodb-otp-platform/terraform.tfstate
│   │   ├── dynamodb-tenant/terraform.tfstate
│   │   └── elasticache/terraform.tfstate
│   │
│   ├── chat-agents/
│   │   ├── lambda-ai/terraform.tfstate
│   │   ├── lambda-sg/terraform.tfstate
│   │   └── s3-knowledgebase/terraform.tfstate
│   │
│   └── shared-services/
│       ├── cognito/terraform.tfstate
│       ├── s3/terraform.tfstate
│       └── ses/terraform.tfstate
```

### Vantagens desta Estrutura

1. **Isolamento**: Mudanças em um componente não afetam outros
2. **Performance**: States menores = operações mais rápidas
3. **Segurança**: Blast radius reduzido
4. **Paralelização**: Deploy simultâneo de componentes independentes

---

## Convenções e Padrões

### Tags Padrão

Todos os recursos são automaticamente tagueados com:

```hcl
tags = {
  Client      = "admin-trya"      # Extraído do nome da conta
  Environment = "dev"             # Extraído do nome da conta
  ManagedBy   = "terragrunt"      # Sempre "terragrunt"
  Account     = "admin-trya-dev"  # Nome completo da conta
}
```

### Nomenclatura de Recursos

Padrão: `{client}-{environment}-{resource-type}-{name}`

Exemplos:
- `admin-trya-dev-backend-alb`
- `grupo-trigo-prod-aurora-cluster`
- `trya-saas-hml-frontend-ecs`

### Estrutura de Diretórios

```
accounts/{account-name}/
├── account.hcl          # Configuração da conta (ID, domínios)
├── region.hcl           # Região AWS
├── README.md            # Documentação específica
└── stack/               # Recursos da conta
    ├── backend/
    ├── platform/
    ├── frontend/
    ├── data/
    ├── chat-agents/
    └── shared-services/
```

### Configuração de Conta (account.hcl)

```hcl
locals {
  account_id   = "751426053736"
  account_name = "admin-trya-dev"
  domain       = "dev.admin.trya.ai"
  api_domain   = "dev-api.admin.trya.ai"
  tier         = "standard"  # ou "enterprise"
}
```

### Configuração de Região (region.hcl)

```hcl
locals {
  aws_region = "us-east-1"
}
```

---

## Ordem de Deploy Recomendada

Para provisionar uma nova conta, siga esta ordem:

1. **Networking** (VPC, Subnets, NAT Gateway)
2. **Data Layer** (Aurora, DynamoDB, ElastiCache)
3. **Security** (Cognito, KMS, WAF)
4. **Compute - ECR** (Container registries)
5. **Compute - ALB** (Load balancers)
6. **Compute - ECS** (Services)
7. **CDN** (CloudFront)
8. **AI/ML** (Lambda, Bedrock)
9. **Shared Services** (SES, S3)

### Comandos de Deploy

```bash
# Deploy completo
cd accounts/admin-trya-dev/stack
terragrunt run-all plan
terragrunt run-all apply

# Deploy por camada
cd accounts/admin-trya-dev/stack/data
terragrunt run-all apply

# Deploy de componente específico
cd accounts/admin-trya-dev/stack/backend/ecs
terragrunt apply
```

---

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Organization                          │
│                         (trya-main)                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
        ┌───────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
        │ Development  │  │ Homologação │  │  Produção  │
        └──────────────┘  └────────────┘  └────────────┘
                │                │                │
        ┌───────┴───────┐        │        ┌───────┴───────┐
        │               │        │        │               │
   admin-trya-dev  trya-saas-dev │   admin-trya-prod grupo-trigo-prod
                              grupo-trigo-hml

Cada conta contém:

┌─────────────────────────────────────────────────────────────────┐
│                      Conta AWS Individual                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Frontend   │  │   Backend    │  │   Platform   │         │
│  │              │  │              │  │              │         │
│  │ CloudFront   │  │  ECS + ALB   │  │  ECS + ALB   │         │
│  │ ECS + ALB    │  │     WAF      │  │     WAF      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                │
│         └─────────────────┼──────────────────┘                │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────┐       │
│  │              Data Layer                            │       │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐        │       │
│  │  │  Aurora  │  │ DynamoDB │  │ElastiCache │        │       │
│  │  │PostgreSQL│  │          │  │  Valkey    │        │       │
│  │  └──────────┘  └──────────┘  └────────────┘        │       │
│  └────────────────────────────────────────────────────┘       │
│                                                               │
│  ┌────────────────────────────────────────────────────┐       │
│  │         AI/ML & Chat Agents                        │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │       │
│  │  │  Lambda  │  │ Bedrock  │  │    S3    │          │       │
│  │  │    AI    │  │Knowledge │  │Knowledge │          │       │
│  │  │          │  │   Base   │  │   Base   │          │       │
│  │  └──────────┘  └──────────┘  └──────────┘          │       │
│  └────────────────────────────────────────────────────┘       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Shared Services                                │   |
│  │ ┌──────────┐ ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │ │   VPC    │ │ Cognito  │  │   SES    │  │    S3    │  │   │
│  │ │          │ │          │  │          │  │  Shared  │  │   │
│  │ └──────────┘ └──────────┘  └──────────┘  └──────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Benefícios da Arquitetura Multi-Conta

### Segurança
- Isolamento completo entre clientes
- Blast radius limitado por conta
- IAM policies independentes
- Compliance facilitado

### Operacional
- Deploy independente por cliente
- Rollback sem afetar outros clientes
- Troubleshooting simplificado
- Limites de serviço dedicados

### Financeiro
- Billing separado por cliente
- Cost allocation preciso
- Chargeback facilitado
- Budget alerts por conta

### Escalabilidade
- Adicionar novos clientes = nova conta
- Recursos dedicados por cliente
- Performance isolada
- Crescimento horizontal

---

---

## Estratégia de Branches e Deployments (Bitbucket)

> **Nota**: Esta é uma sugestão de organização para o fluxo de trabalho no Bitbucket, alinhada com a arquitetura multi-conta AWS.

### Cenário Atual

A plataforma Trya SaaS opera com múltiplos clientes, cada um com seus próprios ambientes:

- **Trya (Interno)**: Ambiente próprio para desenvolvimento e homologação
- **Clientes Aprovados**: Cada cliente possui ambientes de homologação e produção dedicados
- **Objetivo**: Features aprovadas pela Trya são promovidas para os ambientes dos clientes

### Estrutura de Branches

#### Branches Principais

```
main (produção Trya)
├── staging (homologação Trya)
├── development (desenvolvimento Trya)
│
├── client1/staging (homologação Cliente 1)
├── client1/production (produção Cliente 1)
│
├── client2/staging (homologação Cliente 2)
├── client2/production (produção Cliente 2)
│
└── clientN/staging e clientN/production (novos clientes)
```

#### Branches de Trabalho

- `feature/*` → Novas funcionalidades
- `bugfix/*` → Correções de bugs
- `hotfix/*` → Correções urgentes em produção
- `release/*` → Preparação de releases

### Fluxo de Trabalho (Workflow)

#### 1. Desenvolvimento de Features

```
feature/nova-funcionalidade
    ↓ (Pull Request)
development (Trya DEV)
    ↓ (auto-deploy)
AWS Account: saas-trya-dev
```

**Processo**:
1. Desenvolvedor cria branch `feature/nova-funcionalidade`
2. Abre Pull Request para `development`
3. Pipeline valida build automaticamente
4. Após aprovação → merge e deploy automático no ambiente DEV da Trya
5. Testes automatizados executam

#### 2. Homologação Interna (Trya)

```
development (Trya DEV)
    ↓ (Pull Request aprovado)
staging (Trya HML)
    ↓ (auto-deploy)
AWS Account: saas-trya-hml
```

**Processo**:
1. Features prontas → PR de `development` para `staging`
2. Deploy automático no ambiente HML da Trya
3. Time Trya testa e valida as features
4. QA realiza testes de aceitação
5. Aprovação formal para promoção aos clientes

#### 3. Promoção para Clientes

```
staging (Trya HML - aprovado)
    ↓ (Pull Request)
client1/staging
    ↓ (auto-deploy)
AWS Account: grupo-trigo-hml
    ↓ (após validação do cliente)
client1/production
    ↓ (auto-deploy)
AWS Account: grupo-trigo-prod
```

**Processo**:
1. Após aprovação no HML Trya → criar PRs para `client1/staging` e `client2/staging`
2. Deploy automático nos ambientes HML dos clientes
3. Clientes testam e validam em seus ambientes
4. Após OK do cliente → PR para `client*/production`
5. Deploy automático em produção do cliente (com aprovação manual)

### Configuração dos Deployments no Bitbucket

#### Ambientes (Deployments)

```
Deployments no Bitbucket:
├── Trya-Dev           → development branch
├── Trya-Staging       → staging branch
│
├── GrupoTrigo-Staging    → client1/staging branch
├── GrupoTrigo-Production → client1/production branch
│
├── Concrejato-Staging    → client2/staging branch
├── Concrejato-Production → client2/production branch
│
└── (Novos clientes conforme necessário)
```

### Vantagens desta Estratégia

#### Isolamento Total
- Cada cliente tem branches dedicadas
- Impossível deployar acidentalmente no cliente errado
- Configurações isoladas por deployment
- Credenciais AWS separadas por conta

#### Controle de Qualidade
- Features testadas primeiro no DEV Trya
- Validação no HML Trya antes dos clientes
- Clientes testam no HML antes de produção
- Aprovação manual para produção

#### Rastreabilidade
- Histórico claro de o que foi deployado onde
- Tags de versão por cliente
- Fácil rollback por cliente
- Audit trail completo

#### Flexibilidade
- Clientes podem ter versões diferentes temporariamente
- Hotfixes podem ir direto para um cliente específico
- Customizações por cliente (se necessário)
- Ritmo de deploy independente

#### Segurança
- Credenciais AWS isoladas por deployment
- Aprovação manual para produção dos clientes
- Branch protection rules
- Secrets gerenciados pelo Bitbucket

### Proteções Recomendadas

#### Branch Protection Rules

**Para `main`, `staging`, `client*/production`**:
- Requer Pull Request com aprovação
- Requer build passando
- Não permite force push
- Requer revisão de código (mínimo 1 aprovador)
- Requer status checks passando

**Para `development`**:
- Requer Pull Request
- Requer build passando
- Permite fast-forward merge

**Para `client*/staging`**:
- Requer PR de `staging` (Trya)
- Requer aprovação do tech lead
- Build deve passar

```

### Fluxo Visual Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    Desenvolvimento                           │
└─────────────────────────────────────────────────────────────┘
                           │
                    feature/nova-feature
                           │
                           ↓ (PR)
                    ┌──────────────┐
                    │ development  │ → Deploy: saas-trya-dev
                    │  (Trya DEV)  │
                    └──────┬───────┘
                           │
                           ↓ (PR)
                    ┌──────────────┐
                    │   staging    │ → Deploy: saas-trya-hml
                    │  (Trya HML)  │
                    └──────┬───────┘
                           │
                    ✅ Aprovação Trya
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ↓                 ↓                 ↓
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ client1/staging│ │ client2/staging│ │ clientN/staging│
│ (Grupo Trigo)  │ │  (Concrejato)  │ │   (Novo)       │
└───────┬────────┘ └───────┬────────┘ └───────┬────────┘
        │                  │                  │
        │ Deploy:          │ Deploy:          │ Deploy:
        │ grupo-trigo-hml  │ concrejato-hml   │ clientN-hml
        │                  │                  │
        ↓                  ↓                  ↓
   ✅ Aprovação       ✅ Aprovação       ✅ Aprovação
   Cliente 1          Cliente 2          Cliente N
        │                  │                  │
        ↓                  ↓                  ↓
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│client1/production│ │client2/production│ │clientN/production│
│  (Grupo Trigo)   │ │   (Concrejato)   │ │     (Novo)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                  │                  │
        │ Deploy:          │ Deploy:          │ Deploy:
        │ grupo-trigo-prod │ concrejato-prod  │ clientN-prod
        │                  │                  │
        ↓                  ↓                  ↓
   🚀 PRODUÇÃO        🚀 PRODUÇÃO        🚀 PRODUÇÃO
```

