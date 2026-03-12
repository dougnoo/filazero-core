# Consolidação de Infraestrutura - handslab-trya-infra

## ⚠️ IMPORTANTE: Repositório Único de Infraestrutura

O repositório `handslab-trya-infra` é o **ÚNICO** ponto de provisionamento de TODA a infraestrutura do projeto Trya.

### ❌ O QUE NÃO FAZER
- ❌ NÃO criar arquivos Terraform em `handslab-trya-backend/infra/`
- ❌ NÃO criar arquivos Terraform em `trya-frontend/infra/`
- ❌ NÃO criar arquivos Terraform em `handslab-trya-platform-backend/infra/`
- ❌ NÃO criar arquivos Terraform em `handslab-trya-chat-backend/infra/`

### ✅ O QUE FAZER
- ✅ TODA infraestrutura deve estar em `handslab-trya-infra/`
- ✅ Usar a estrutura de stacks existente
- ✅ Provisionar uma única vez a partir deste repositório

## Estrutura Atual (Correta)

```
handslab-trya-infra/
├── stacks/
│   ├── network/          # VPC, Subnets, NAT Gateway (base)
│   ├── backend/          # Backend ECS + ALB + Aurora
│   ├── frontend/         # Frontend ECS + CloudFront
│   ├── platform/         # Platform backend
│   ├── chat/             # Chat backend
│   └── chat-agents/      # Chat agents
├── modules/              # Módulos reutilizáveis
│   ├── ecs_service/
│   ├── cloudfront/
│   ├── rds_postgres/
│   ├── aurora/
│   ├── dynamodb/
│   ├── ecr/
│   └── ...
├── environments/         # Configurações por ambiente (NOVO)
│   ├── dev/
│   │   ├── main.tf       # Orquestra todos os stacks
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── hml/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
└── README.md
```

## Fluxo de Provisionamento

### 1. Provisionar Network (uma vez)
```bash
cd stacks/network
terraform init -backend-config=../../environments/dev/network.backend.conf
terraform apply
```

### 2. Provisionar Backend
```bash
cd stacks/backend
terraform init -backend-config=../../environments/dev/backend.backend.conf
terraform apply
```

### 3. Provisionar Frontend
```bash
cd stacks/frontend
terraform init -backend-config=../../environments/dev/frontend.backend.conf
terraform apply
```

### 4. Provisionar Platform
```bash
cd stacks/platform
terraform init -backend-config=../../environments/dev/platform.backend.conf
terraform apply
```

### 5. Provisionar Chat
```bash
cd stacks/chat
terraform init -backend-config=../../environments/dev/chat.backend.conf
terraform apply
```

## Recursos Provisionados por Stack

### Network Stack
- VPC
- Public/Private Subnets
- NAT Gateway
- Internet Gateway
- Route Tables
- Security Groups base

### Backend Stack
- ECR Repository: `trya-backend`
- ECS Cluster: `trya-{env}-backend-cluster`
- ECS Service: `trya-{env}-backend-service`
- ALB: `trya-{env}-backend-alb`
- Aurora PostgreSQL Cluster
- Secrets Manager (JWT, DB password)
- Route53 record: `{env}-api.trya.ai`

### Frontend Stack
- ECR Repository: `trya-frontend`
- ECS Cluster: `trya-{env}-frontend-cluster` (sa-east-1)
- ECS Service: `trya-{env}-frontend-service`
- ALB: `trya-{env}-frontend-alb`
- CloudFront Distribution
- ACM Certificate
- Route53 record: `{env}-app.trya.ai`

### Platform Stack
- ECR Repository: `trya-platform`
- ECS Service: `trya-{env}-platform-service`
- ALB Target Group
- Secrets Manager

### Chat Stack
- ECR Repository: `trya-chat`
- ECS Service: `trya-{env}-chat-service`
- ALB Target Group
- DynamoDB: `triagem-sessions-{env}`

## Recursos Compartilhados (Shared)

Recursos que existem uma única vez e são usados por todos os ambientes:

### Cognito (us-east-1)
- DEV: `us-east-1_Brw5t4pXW`
- HML: `us-east-1_z0ZIFLfwm`
- PROD: (a criar)

### DynamoDB Tables (us-east-1)
**DEV:**
- `tenant-1` (Trya)
- `grupotrigo` (Grupo Trigo)
- `otp-codes`
- `triagem-sessions-dev`

**HML:**
- `tenant-1-hml` (Trya)
- `grupotrigo-hml` (Grupo Trigo)
- `triagem-sessions-hml`

### S3 Buckets (us-east-1)
**DEV:**
- `broker-tenant-1` (Trya assets)
- `grupotrigo-assets` (Grupo Trigo assets)
- `trya-platform-files`

**HML:**
- `broker-tenant-1-hml`
- `grupotrigo-assets-hml`
- `trya-hml-platform-assets`

### Terraform State
- `trya-terraform-state` (DEV)
- `trya-terraform-state-hml` (HML)

## Migração dos Repositórios Individuais

### Ação Necessária: Remover Terraform de Outros Repos

1. **handslab-trya-backend/infra/terraform/**
   - ❌ DELETAR toda a pasta `infra/terraform/`
   - ✅ Mover configurações para `handslab-trya-infra/stacks/backend/`

2. **trya-frontend/infra/terraform/**
   - ❌ DELETAR toda a pasta `infra/terraform/`
   - ✅ Mover configurações para `handslab-trya-infra/stacks/frontend/`

3. **handslab-trya-platform-backend/infra/terraform/**
   - ❌ DELETAR toda a pasta `infra/terraform/`
   - ✅ Mover configurações para `handslab-trya-infra/stacks/platform/`

4. **handslab-trya-chat-backend/infra/terraform/**
   - ❌ DELETAR toda a pasta `infra/terraform/`
   - ✅ Mover configurações para `handslab-trya-infra/stacks/chat/`

## Novo Fluxo de Trabalho

### Desenvolvedor quer provisionar infraestrutura:

1. Clone APENAS `handslab-trya-infra`
2. Configure AWS credentials
3. Execute terraform nos stacks necessários
4. Pronto!

### Desenvolvedor quer fazer deploy de aplicação:

1. Build da imagem Docker no repo da aplicação
2. Push para ECR (já provisionado pelo infra repo)
3. Update do ECS service (já provisionado pelo infra repo)
4. Pronto!

## Vantagens da Consolidação

✅ **Single Source of Truth**: Uma única fonte de verdade para infraestrutura  
✅ **Menos Duplicação**: Sem código Terraform duplicado  
✅ **Melhor Visibilidade**: Toda infra em um só lugar  
✅ **Easier Maintenance**: Mais fácil de manter e atualizar  
✅ **Consistent State**: Estado Terraform centralizado  
✅ **Better Dependencies**: Gerenciamento claro de dependências entre stacks  

## Próximos Passos

1. ✅ Documentar estrutura atual (este arquivo)
2. ⏳ Revisar e consolidar stacks existentes
3. ⏳ Criar `environments/dev/main.tf` que orquestra todos os stacks
4. ⏳ Criar `environments/hml/main.tf` que orquestra todos os stacks
5. ⏳ Deletar pastas `infra/terraform/` dos outros repositórios
6. ⏳ Atualizar documentação de deploy nos outros repos
7. ⏳ Criar CI/CD pipeline para provisionamento centralizado

## Comandos Úteis

### Provisionar ambiente completo DEV
```bash
cd handslab-trya-infra
./scripts/provision-dev.sh
```

### Provisionar ambiente completo HML
```bash
cd handslab-trya-infra
./scripts/provision-hml.sh
```

### Destruir ambiente (cuidado!)
```bash
cd handslab-trya-infra
./scripts/destroy-dev.sh
```

## Referências

- Terraform State: S3 bucket `trya-terraform-state`
- AWS Account: 416684166863
- Regions: us-east-1 (backend), sa-east-1 (frontend)
