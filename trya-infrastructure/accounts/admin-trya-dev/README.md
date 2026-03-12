# Admin Trya - Dev Environment

Conta AWS para ambiente de desenvolvimento do Admin Trya.

## Informações da Conta

- **Account ID**: `CHANGE_ME`
- **Região**: `us-east-1`
- **Domínio**: `dev.admin.trya.ai`
- **API**: `dev-api.admin.trya.ai`

## Stack Completa

### Networking
- VPC (10.0.0.0/16)
- 2 AZs
- Subnets públicas e privadas
- NAT Gateway

### Data
- Aurora PostgreSQL Serverless v2
- DynamoDB (sessions)
- ElastiCache Serverless (Valkey)

### Backend
- ECR
- ALB
- ECS Fargate
- WAF

### Platform
- ECR
- ALB
- ECS Fargate
- WAF
- S3

### Frontend
- ECR
- ALB
- ECS Fargate
- CloudFront

### Chat Agents
- Lambda
- VPC Endpoints

### Shared
- Cognito
- S3
- SES

## Deploy

### Pré-requisitos

1. Configurar AWS CLI profile:
```bash
aws configure --profile admin-trya-dev
```

2. Editar `account.hcl` com Account ID real

3. Criar bucket S3 para state:
```bash
aws s3 mb s3://tfstate-admin-trya-dev --region us-east-1 --profile admin-trya-dev
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --profile admin-trya-dev
```

### Deploy Completo

```bash
cd stack
terragrunt run-all plan
terragrunt run-all apply
```

### Deploy por Componente

```bash
# Networking primeiro
cd stack/networking/vpc
terragrunt apply

# Data layer
cd stack/data
terragrunt run-all apply

# Backend
cd stack/backend
terragrunt run-all apply
```

## Ordem de Deploy Recomendada

1. `networking/vpc`
2. `data/` (aurora, dynamodb, elasticache)
3. `backend/` (ecr, alb, ecs, waf)
4. `platform/` (ecr, alb, ecs, waf, s3)
5. `frontend/` (ecr, alb, ecs, cloudfront)
6. `chat-agents/lambda`
7. `shared/` (cognito, s3, ses)

## TODOs

- [ ] Adicionar Account ID real em `account.hcl`
- [ ] Criar certificado ACM para HTTPS
- [ ] Configurar Cognito User Pool
- [ ] Migrar secrets para AWS Secrets Manager
- [ ] Configurar DNS no Route53
- [ ] Configurar SES para emails
