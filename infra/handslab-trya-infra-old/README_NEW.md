# Trya Platform - Infrastructure as Code

## Estrutura Reorganizada

Esta é a nova estrutura de infraestrutura do projeto Trya, reorganizada para melhor manutenibilidade e clareza.

## Estrutura de Diretórios

```
handslab-trya-infra/
├── environments/          # Configurações por ambiente
│   ├── dev/              # Desenvolvimento
│   ├── hml/              # Homologação
│   └── prod/             # Produção (futuro)
├── modules/              # Módulos reutilizáveis
│   ├── backend-service/  # Backend ECS + ALB + RDS
│   ├── frontend-service/ # Frontend ECS + CloudFront
│   ├── tenant-resources/ # DynamoDB + S3 por tenant
│   └── shared/           # VPC, ECR, recursos compartilhados
├── INFRA_AUDIT.md        # Auditoria completa da infra atual
├── INFRA_ACTION_PLAN.md  # Plano de ação detalhado
└── README.md             # Este arquivo
```

## Arquitetura Atual

### DEV Environment (us-east-1)
- **Cognito**: `us-east-1_Brw5t4pXW`
- **Aurora**: `trya-backend-dev-aurora`
- **DynamoDB**: `tenant-1`, `grupotrigo`
- **S3**: `broker-tenant-1`, `grupotrigo-assets`
- **ECS Cluster**: `trya-cluster`
- **Frontend**: sa-east-1 (`trya-frontend-dev-cluster`)

### HML Environment (us-east-1)
- **Cognito**: `us-east-1_z0ZIFLfwm`
- **DynamoDB**: `tenant-1-hml`, `grupotrigo-hml`
- **S3**: `broker-tenant-1-hml`, `grupotrigo-assets-hml`
- **ECS Clusters**: `Trya-hml-v2-cluster` (backend), `Trya-hml-cluster` (frontend sa-east-1)

## Naming Convention

Formato padrão: `{project}-{environment}-{service}-{resource}`

Exemplos:
- `trya-dev-backend-cluster`
- `trya-hml-frontend-alb`
- `trya-dev-tenant-trya-table`

## Como Usar

### 1. Inicializar Terraform

```bash
cd environments/dev
terraform init
```

### 2. Verificar Recursos Existentes

```bash
terraform plan
```

### 3. Importar Recursos Existentes

Os recursos já existentes precisam ser importados para o Terraform state:

```bash
# Cognito User Pool
terraform import data.aws_cognito_user_pool.main us-east-1_Brw5t4pXW

# Aurora Cluster
terraform import data.aws_rds_cluster.aurora trya-backend-dev-aurora

# DynamoDB Tables
terraform import 'data.aws_dynamodb_table.tenants["trya"]' tenant-1
terraform import 'data.aws_dynamodb_table.tenants["grupotrigo"]' grupotrigo

# S3 Buckets
terraform import 'data.aws_s3_bucket.tenant_assets["trya"]' broker-tenant-1
terraform import 'data.aws_s3_bucket.tenant_assets["grupotrigo"]' grupotrigo-assets
```

### 4. Aplicar Mudanças

```bash
terraform apply
```

## Recursos por Ambiente

### DEV
| Recurso | Nome | Região | Status |
|---------|------|--------|--------|
| Cognito | us-east-1_Brw5t4pXW | us-east-1 | ✅ Existente |
| Aurora | trya-backend-dev-aurora | us-east-1 | ✅ Existente |
| DynamoDB (Trya) | tenant-1 | us-east-1 | ✅ Existente |
| DynamoDB (Grupo Trigo) | grupotrigo | us-east-1 | ✅ Existente |
| S3 (Trya) | broker-tenant-1 | us-east-1 | ✅ Existente |
| S3 (Grupo Trigo) | grupotrigo-assets | us-east-1 | ✅ Existente |
| ECS Cluster (Backend) | trya-cluster | us-east-1 | ✅ Existente |
| ECS Cluster (Frontend) | trya-frontend-dev-cluster | sa-east-1 | ✅ Existente |

### HML
| Recurso | Nome | Região | Status |
|---------|------|--------|--------|
| Cognito | us-east-1_z0ZIFLfwm | us-east-1 | ✅ Existente |
| Aurora | trya-hml-aurora-cluster | us-east-1 | ❌ A criar |
| DynamoDB (Trya) | tenant-1-hml | us-east-1 | ✅ Existente |
| DynamoDB (Grupo Trigo) | grupotrigo-hml | us-east-1 | ✅ Existente |
| S3 (Trya) | broker-tenant-1-hml | us-east-1 | ✅ Existente |
| S3 (Grupo Trigo) | grupotrigo-assets-hml | us-east-1 | ✅ Existente |
| ECS Cluster (Backend) | Trya-hml-v2-cluster | us-east-1 | ✅ Existente |
| ECS Cluster (Frontend) | Trya-hml-cluster | sa-east-1 | ✅ Existente |

## Problemas Identificados e Soluções

### 1. Duplicação de Clusters ECS
**Problema**: Múltiplos clusters para mesma finalidade
- `Trya-hml-fe-cluster` (não usado)
- `Trya-hml-chat-cluster` (separado desnecessariamente)
- `Trya-hml-plat-cluster` (separado desnecessariamente)

**Solução**: Consolidar em 2 clusters por ambiente:
- `trya-{env}-backend-cluster` (us-east-1) - todos os backends
- `trya-{env}-frontend-cluster` (sa-east-1) - frontend

### 2. Nomenclatura Inconsistente
**Problema**: Mix de PascalCase e kebab-case
- `Trya-hml-v2-cluster` vs `trya-cluster`

**Solução**: Padronizar tudo em kebab-case minúsculo

### 3. ECR Repositories Duplicados
**Problema**: 
- `trya-backend` e `trya-hml-backend`
- `trya-hml-frontend` sem correspondente DEV

**Solução**: 1 repositório por serviço, usar tags para ambientes

## Próximos Passos

1. ✅ Criar estrutura de diretórios
2. ✅ Documentar recursos existentes
3. ✅ Criar arquivos Terraform base para DEV e HML
4. ⏳ Criar módulos reutilizáveis
5. ⏳ Importar recursos existentes
6. ⏳ Criar Aurora cluster para HML
7. ⏳ Consolidar clusters ECS
8. ⏳ Padronizar nomenclatura
9. ⏳ Configurar CI/CD com GitHub Actions

## Comandos Úteis

### Listar recursos AWS
```bash
# Cognito
aws cognito-idp list-user-pools --max-results 10 --profile skopia --region us-east-1

# DynamoDB
aws dynamodb list-tables --profile skopia --region us-east-1

# ECS Clusters
aws ecs list-clusters --profile skopia --region us-east-1

# Aurora
aws rds describe-db-clusters --profile skopia --region us-east-1
```

### Terraform
```bash
# Formatar código
terraform fmt -recursive

# Validar configuração
terraform validate

# Ver state
terraform state list

# Importar recurso
terraform import <resource_type>.<name> <resource_id>
```

## Contato

Para dúvidas sobre a infraestrutura, consulte:
- `INFRA_AUDIT.md` - Auditoria completa
- `INFRA_ACTION_PLAN.md` - Plano de ação detalhado
