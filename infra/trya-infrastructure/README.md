# Trya Infrastructure

Infraestrutura como código centralizada para o projeto Trya usando Terraform + Terragrunt.

## Estrutura

```
trya-infrastructure/
├── modules/              # Módulos Terraform reutilizáveis
├── _envcommon/           # Configurações DRY por serviço
├── accounts/             # Contas AWS (1 pasta = 1 conta)
├── management/           # Conta Management (Organizations, Route53) ✅
├── shared-services/      # Conta Shared (ECR, Cognito, SES)
└── terragrunt.hcl        # Configuração raiz
```

## Modelo de Contas

Cada combinação **cliente + ambiente = 1 conta AWS separada**:

- `admin-trya-dev` - Admin Trya (desenvolvimento)
- `admin-trya-hml` - Admin Trya (homologação)
- `admin-trya-prod` - Admin Trya (produção)
- `trya-saas-dev` - Trya SaaS (desenvolvimento)
- `trya-saas-hml` - Trya SaaS (homologação)
- `grupo-trigo-hml` - Grupo Trigo (homologação)
- `grupo-trigo-prod` - Grupo Trigo (produção)

## Stack de Aplicações

Cada conta pode ter:

- **backend** - API Principal (trya-backend)
- **platform** - API Plataforma Médica (trya-platform-backend)
- **frontend** - Frontend Next.js
- **chat-agents** - Agentes IA (Lambda)
- **shared** - Recursos compartilhados (Cognito, S3, SES)

## Pré-requisitos

- Terraform >= 1.5
- Terragrunt >= 0.50
- AWS CLI configurado com profiles por conta

## Configurar AWS Profiles

```bash
# Exemplo para admin-trya-dev
aws configure --profile admin-trya-dev
# AWS Access Key ID: ...
# AWS Secret Access Key: ...
# Default region: us-east-1
```

## Comandos

### Deploy completo de uma conta

```bash
cd accounts/admin-trya-dev/stack
terragrunt run-all plan    # Revisar mudanças
terragrunt run-all apply   # Aplicar
```

### Deploy de um componente específico

```bash
cd accounts/admin-trya-dev/stack/backend/ecs
terragrunt plan
terragrunt apply
```

### Adicionar nova conta

```bash
# 1. Copiar estrutura
cp -r accounts/_template accounts/novo-cliente-hml

# 2. Editar account.hcl
vim accounts/novo-cliente-hml/account.hcl

# 3. Editar region.hcl
vim accounts/novo-cliente-hml/region.hcl

# 4. Deploy
cd accounts/novo-cliente-hml/stack
terragrunt run-all apply
```

## Módulos Disponíveis

### Networking
- `vpc` - VPC com subnets públicas e privadas
- `security-groups` - Security groups reutilizáveis

### Compute
- `ecs-cluster` - Cluster ECS Fargate
- `ecs-service` - Serviço ECS com auto-scaling
- `lambda` - Lambda function com VPC

### Data
- `aurora` - Aurora PostgreSQL Serverless v2
- `dynamodb` - DynamoDB tables
- `elasticache` - ElastiCache Serverless (Valkey)

### Storage
- `s3` - S3 buckets com políticas

### CDN
- `alb` - Application Load Balancer
- `cloudfront` - CloudFront distribution

### Security
- `waf` - Web Application Firewall

### Observability
- `cloudwatch` - Dashboards e alarmes

## Gestão de Estado

- **Bucket S3**: `tfstate-{account-name}` (1 por conta)
- **DynamoDB**: `terraform-locks` (lock distribuído)
- **Estrutura**: State separado por componente

Exemplo:
```
tfstate-admin-trya-dev/
├── stack/backend/ecs/terraform.tfstate
├── stack/data/aurora/terraform.tfstate
└── stack/networking/vpc/terraform.tfstate
```

## CI/CD

Ver `bitbucket-pipelines.yml` para configuração de deploy automatizado.

## Segurança

- Secrets via AWS Secrets Manager
- IAM roles com least privilege
- Encryption at rest habilitado
- VPC endpoints para reduzir custos e aumentar segurança

## Suporte

Para dúvidas ou problemas, abrir issue no repositório.
