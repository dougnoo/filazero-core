# FilaZero — Infraestrutura AWS

## Arquitetura

```
┌────────────────────────────────────────────────────────┐
│                      CloudFront                        │
│                  (Landing + SPA)                        │
└─────────────────────┬──────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────┐
│                 API Gateway                             │
│            (REST + WebSocket)                           │
├─────────────┬──────────────────┬───────────────────────┤
│   ALB       │   WebSocket API  │                       │
│   ▼         │   ▼              │                       │
│ ECS Fargate │ Lambda Functions │                       │
│ ┌─────────┐ │ ┌──────────────┐ │                       │
│ │platform │ │ │intake-agent  │ │                       │
│ │backend  │ │ │(Python/      │ │                       │
│ │(NestJS) │ │ │ LangChain)   │ │                       │
│ ├─────────┤ │ ├──────────────┤ │                       │
│ │trya     │ │ │priority      │ │                       │
│ │backend  │ │ │scorer        │ │                       │
│ │(NestJS) │ │ │(Manchester)  │ │                       │
│ └────┬────┘ │ └──────┬───────┘ │                       │
│      │      │        │         │                       │
│      ▼      │        ▼         │                       │
│ Aurora      │   DynamoDB       │   Cognito             │
│ Serverless  │   (Sessions,     │   (Auth/RBAC)         │
│ v2 (PG)     │    Chat, Queue)  │                       │
└─────────────┴──────────────────┴───────────────────────┘
                      │
              AWS Bedrock (Claude 3.5)
```

## Módulos Terraform

| Módulo     | Descrição                                        |
|------------|--------------------------------------------------|
| `vpc`      | VPC isolada, subnets públicas/privadas, NAT      |
| `ecs`      | ECS Fargate cluster + services + ALB + autoscaling |
| `rds`      | Aurora Serverless v2 PostgreSQL                  |
| `dynamodb` | Tabelas NoSQL (sessions, chat, queue, journeys)  |
| `cognito`  | User Pool com RBAC (citizen/professional/manager/admin) |
| `lambda`   | AI agents (intake, priority scorer) + API Gateway WS |
| `ecr`      | Container registries para os backends             |

## Quick Start

```bash
# 1. Configurar credenciais AWS
export AWS_PROFILE=filazero-prod

# 2. Criar bucket de estado
aws s3 mb s3://filazero-terraform-state-prod --region sa-east-1

# 3. Criar lock table
aws dynamodb create-table \
  --table-name filazero-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region sa-east-1

# 4. Deploy via Terragrunt
cd environments/production
terragrunt run-all apply
```

## Multi-Tenancy

- **Município** = Tenant (isolação lógica via `municipality_id`)
- **Unidade de Saúde** = Sub-tenant (isolação via `unit_id`)
- Headers propagados: `X-Municipality-Id`, `X-Unit-Id`
- Cognito custom attributes: `custom:municipality_id`, `custom:unit_id`

## Região

Tudo roda em **sa-east-1** (São Paulo) exceto Bedrock que usa **us-east-1**.

## Custos Estimados (município 150k hab)

| Serviço          | Estimativa/mês |
|------------------|----------------|
| ECS Fargate (2x) | ~R$ 400        |
| Aurora Serverless | ~R$ 300        |
| DynamoDB (PAR)   | ~R$ 50         |
| Lambda           | ~R$ 20         |
| Bedrock (Claude) | ~R$ 500        |
| NAT Gateway      | ~R$ 200        |
| **Total**        | **~R$ 1.500**  |
