# Guia de Import - Migração de Recursos Existentes

Este documento descreve como importar recursos AWS existentes para o Terraform centralizado.

## Pré-requisitos

1. Configurar o AWS CLI com o profile correto:
   ```bash
   aws configure --profile skopia
   ```

2. Verificar acesso:
   ```bash
   aws sts get-caller-identity --profile skopia
   ```

## Ordem de Import por Stack

A ordem de import deve seguir as dependências entre stacks:

1. **Network** (primeiro - outras stacks dependem dele)
2. **Backend** (depende de Network)
3. **Frontend** (depende de Network)
4. **Platform** (depende de Network)
5. **Chat** (depende de Network)
6. **Chat-Agents** (depende de Network)

## Import do Network Stack (DEV)

### 1. Inicializar o stack

```bash
cd stacks/network
terraform init -backend-config=../../environments/dev/network.backend.conf
```

### 2. Importar recursos existentes

```bash
# VPC
terraform import -var-file=../../environments/dev/network.tfvars \
  module.network.aws_vpc.main vpc-0f2ade875bf5be1b8

# Subnets Públicas
terraform import -var-file=../../environments/dev/network.tfvars \
  'module.network.aws_subnet.public[0]' subnet-052c9bf6a938c0869

terraform import -var-file=../../environments/dev/network.tfvars \
  'module.network.aws_subnet.public[1]' subnet-0ffcaa0ac21610946

terraform import -var-file=../../environments/dev/network.tfvars \
  'module.network.aws_subnet.public[2]' subnet-02018b65ad5b3992b

# Subnets Privadas
terraform import -var-file=../../environments/dev/network.tfvars \
  'module.network.aws_subnet.private[0]' subnet-042dd02b950e02873

terraform import -var-file=../../environments/dev/network.tfvars \
  'module.network.aws_subnet.private[1]' subnet-09a735a0d762ea9c8

terraform import -var-file=../../environments/dev/network.tfvars \
  'module.network.aws_subnet.private[2]' subnet-0c95acd17348df5df

# Internet Gateway
# (verificar ID real com: aws ec2 describe-internet-gateways --profile skopia --region sa-east-1)

# NAT Gateway
# (verificar ID real com: aws ec2 describe-nat-gateways --profile skopia --region sa-east-1)

# Route Tables
# (verificar IDs com: aws ec2 describe-route-tables --profile skopia --region sa-east-1)
```

### 3. Verificar plan

```bash
terraform plan -var-file=../../environments/dev/network.tfvars
```

## Import do Backend Stack (DEV)

### 1. Inicializar o stack

```bash
cd stacks/backend
terraform init -backend-config=../../environments/dev/backend.backend.conf
```

### 2. Importar recursos existentes

```bash
# ECR Repository
terraform import -var-file=../../environments/dev/backend.tfvars \
  'module.ecr.aws_ecr_repository.main["backend"]' trya-dev-backend

# ECS Cluster
terraform import -var-file=../../environments/dev/backend.tfvars \
  module.ecs_service.aws_ecs_cluster.main Trya-dev-cluster

# ECS Service
terraform import -var-file=../../environments/dev/backend.tfvars \
  module.ecs_service.aws_ecs_service.main Trya-dev-cluster/Trya-dev-service

# ALB
terraform import -var-file=../../environments/dev/backend.tfvars \
  module.ecs_service.aws_lb.main arn:aws:elasticloadbalancing:sa-east-1:416684166863:loadbalancer/app/Trya-dev-alb/5846981b4017381c

# Target Group
terraform import -var-file=../../environments/dev/backend.tfvars \
  module.ecs_service.aws_lb_target_group.main arn:aws:elasticloadbalancing:sa-east-1:416684166863:targetgroup/Trya-dev-tg/710320a64ed84501

# RDS Instance
terraform import -var-file=../../environments/dev/backend.tfvars \
  module.rds.aws_db_instance.main db-trya-dev-postgres

# Security Groups
# (verificar IDs com: aws ec2 describe-security-groups --profile skopia --region sa-east-1)

# Route53 Record
terraform import -var-file=../../environments/dev/backend.tfvars \
  aws_route53_record.backend Z0174021443SX63ON0KA_api-dev.trya.com.br_A
```

## Import do Frontend Stack (DEV)

### 1. Inicializar o stack

```bash
cd stacks/frontend
terraform init -backend-config=../../environments/dev/frontend.backend.conf
```

### 2. Importar recursos existentes

```bash
# ECR Repository
terraform import -var-file=../../environments/dev/frontend.tfvars \
  'module.ecr.aws_ecr_repository.main["frontend"]' trya-frontend-dev

# ECS Cluster
terraform import -var-file=../../environments/dev/frontend.tfvars \
  module.ecs_service.aws_ecs_cluster.main trya-frontend-dev-cluster

# ECS Service
terraform import -var-file=../../environments/dev/frontend.tfvars \
  module.ecs_service.aws_ecs_service.main trya-frontend-dev-cluster/trya-frontend-dev-service

# ALB
terraform import -var-file=../../environments/dev/frontend.tfvars \
  module.ecs_service.aws_lb.main arn:aws:elasticloadbalancing:sa-east-1:416684166863:loadbalancer/app/trya-frontend-dev-alb/9822a9784a641f65

# Target Group
terraform import -var-file=../../environments/dev/frontend.tfvars \
  module.ecs_service.aws_lb_target_group.main arn:aws:elasticloadbalancing:sa-east-1:416684166863:targetgroup/trya-frontend-dev-alb/bfcace52f81368b5
```

## IDs de Recursos Existentes (DEV - sa-east-1)

### VPC e Network
- VPC ID: `vpc-0f2ade875bf5be1b8`
- Subnets Públicas:
  - sa-east-1a: `subnet-052c9bf6a938c0869`
  - sa-east-1b: `subnet-0ffcaa0ac21610946`
  - sa-east-1c: `subnet-02018b65ad5b3992b`
- Subnets Privadas:
  - sa-east-1a: `subnet-042dd02b950e02873`
  - sa-east-1b: `subnet-09a735a0d762ea9c8`
  - sa-east-1c: `subnet-0c95acd17348df5df`

### Route53
- Hosted Zone ID: `Z0174021443SX63ON0KA`
- Domain: `trya.com.br`

### ECS Clusters
- Backend DEV: `Trya-dev-cluster`
- Frontend DEV: `trya-frontend-dev-cluster`
- Frontend Staging: `trya-frontend-staging-cluster`
- Frontend Prod: `trya-frontend-prod-cluster`

### ECR Repositories
- `trya-dev-backend`
- `trya-frontend-dev`
- `trya-frontend-staging`
- `trya-frontend-prod`
- `handslab-trya-backend`
- `trya-backend`

### ALBs
- Backend DEV: `Trya-dev-alb`
- Frontend DEV: `trya-frontend-dev-alb`
- Frontend Staging: `trya-frontend-staging-alb`
- Frontend Prod: `trya-frontend-prod-alb`

### RDS
- Instance ID: `db-trya-dev-postgres`
- Endpoint: `db-trya-dev-postgres.c1a4cmsawmxv.sa-east-1.rds.amazonaws.com`

### S3 Buckets
- `trya-terraform-state` (Terraform state)
- `trya-dev-frontend` (Frontend assets)
- `triagem-ia-dev` (Chat agents)
- `trya-platform-files` (Platform assets)

## Dicas

1. **Sempre faça backup do state** antes de imports:
   ```bash
   terraform state pull > backup.tfstate
   ```

2. **Verifique o plan após cada import** para garantir que não há drift:
   ```bash
   terraform plan -var-file=../../environments/dev/<stack>.tfvars
   ```

3. **Para recursos que não podem ser importados**, considere:
   - Usar `terraform state rm` para removê-los do state
   - Recriá-los manualmente no Terraform
   - Usar `lifecycle { prevent_destroy = true }` para proteger recursos

4. **Se o import falhar**, verifique:
   - Se o recurso existe na AWS
   - Se o endereço do recurso no Terraform está correto
   - Se você tem permissões para acessar o recurso
