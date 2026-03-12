# 🚀 Trya - Infraestrutura AWS com Terraform

Infraestrutura completa como código (IaC) para o projeto **Trya**, hospedando uma aplicação web moderna (Next.js + NestJS) na AWS com ambientes isolados para desenvolvimento e homologação.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Recursos Provisionados](#recursos-provisionados)
- [Pré-requisitos](#pré-requisitos)
- [Configuração Inicial](#configuração-inicial)
- [Como Usar](#como-usar)
- [CI/CD](#cicd)
- [Custos Estimados](#custos-estimados)
- [Troubleshooting](#troubleshooting)
- [Segurança](#segurança)
- [Manutenção](#manutenção)

## 🎯 Visão Geral

Esta infraestrutura provisiona automaticamente todos os recursos necessários para hospedar uma aplicação web completa na AWS, incluindo:

- **Frontend**: Next.js servido via S3 + CloudFront (CDN)
- **Backend**: NestJS rodando em containers ECS Fargate
- **Banco de Dados**: PostgreSQL no RDS
- **Segurança**: SSL/TLS, secrets management, network isolation
- **Observabilidade**: CloudWatch dashboards, alarms, logs
- **CI/CD**: GitHub Actions para deploys automatizados

### Ambientes

- **DEV** (`develop` branch): Ambiente de desenvolvimento
  - URL Frontend: `https://dev.trya.com.br`
  - URL Backend: `https://api-dev.trya.com.br`

- **HML** (`main` branch): Ambiente de homologação
  - URL Frontend: `https://hml.trya.com.br`
  - URL Backend: `https://api-hml.trya.com.br`

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Route53 (DNS)                            │
│                    trya.com.br + subdomains                      │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
             ▼                               ▼
    ┌────────────────┐              ┌──────────────────┐
    │   CloudFront   │              │       ALB        │
    │  (Frontend)    │              │   (Backend)      │
    │   + SSL/TLS    │              │   + SSL/TLS      │
    └────────┬───────┘              └────────┬─────────┘
             │                               │
             ▼                               ▼
    ┌────────────────┐              ┌──────────────────┐
    │   S3 Bucket    │              │   ECS Fargate    │
    │  (Next.js)     │              │   (NestJS)       │
    │   + OAC        │              │  Auto Scaling    │
    └────────────────┘              └────────┬─────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                           VPC                                    │
│  ┌──────────────────┐                 ┌──────────────────┐     │
│  │  Public Subnets  │                 │ Private Subnets  │     │
│  │   (ALB, NAT)     │                 │  (ECS, RDS)      │     │
│  └──────────────────┘                 └──────────────────┘     │
│                                                                  │
│                        ┌──────────────────┐                     │
│                        │   RDS PostgreSQL │                     │
│                        │   + Backups      │                     │
│                        └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │   Secrets Manager    │
                    │   + SSM Parameters   │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │   CloudWatch         │
                    │   Logs + Metrics     │
                    │   Dashboards+Alarms  │
                    └──────────────────────┘
```

## 📦 Recursos Provisionados

### Rede
- ✅ VPC com subnets públicas e privadas em 3 AZs
- ✅ Internet Gateway para acesso à internet
- ✅ NAT Gateway para saída das subnets privadas
- ✅ Route Tables e Security Groups

### Computação
- ✅ ECS Fargate Cluster para containers
- ✅ Application Load Balancer (ALB)
- ✅ Auto Scaling baseado em CPU/Memória
- ✅ ECR para armazenar imagens Docker

### Armazenamento
- ✅ S3 Bucket para frontend estático
- ✅ RDS PostgreSQL com backups automáticos
- ✅ Encryption at rest habilitado

### CDN & DNS
- ✅ CloudFront distribution com SSL
- ✅ Route53 para gerenciamento de DNS
- ✅ ACM para certificados SSL/TLS

### Segurança
- ✅ AWS Secrets Manager para senhas
- ✅ SSM Parameter Store para configs
- ✅ IAM Roles com least privilege
- ✅ Security Groups restritivos
- ✅ VPC Flow Logs (opcional)

### Observabilidade
- ✅ CloudWatch Logs para ECS
- ✅ CloudWatch Dashboard
- ✅ CloudWatch Alarms (CPU, Memory, 5xx, etc)
- ✅ SNS para notificações de alarmes

## ⚙️ Pré-requisitos

### Ferramentas Necessárias

```bash
# Terraform >= 1.8.0
terraform version

# AWS CLI v2
aws --version

# Git
git --version
```

### Configuração AWS

1. **Criar bucket S3 para Terraform State:**

```bash
aws s3api create-bucket \
  --bucket trya-terraform-state \
  --region sa-east-1 \
  --create-bucket-configuration LocationConstraint=sa-east-1

aws s3api put-bucket-versioning \
  --bucket trya-terraform-state \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket trya-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

2. **Criar DynamoDB table para State Locking:**

```bash
aws dynamodb create-table \
  --table-name trya-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region sa-east-1
```

3. **Configurar credenciais AWS:**

```bash
aws configure
# AWS Access Key ID: <sua-key>
# AWS Secret Access Key: <seu-secret>
# Default region: sa-east-1
# Default output format: json
```

### Domain/DNS

Certifique-se de ter o domínio `trya.com.br` registrado e:

- Se já tem hosted zone no Route53, configure `create_route53_zone = false`
- Se não tem, configure `create_route53_zone = true` e depois configure os nameservers no registrador

## 🚀 Configuração Inicial

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/trya.git
cd trya/infra
```

### 2. Configure as variáveis por ambiente

Edite os arquivos de configuração:

```bash
# Desenvolvimento
vim environments/dev/terraform.tfvars

# Homologação
vim environments/hml/terraform.tfvars
```

**Importante:** Configure os seguintes valores:
- `domain_name`: Seu domínio
- `alarm_email`: Seu email para receber alertas
- `create_route53_zone`: true/false dependendo se já tem a zona

### 3. Inicialize o Terraform

Para ambiente **DEV**:

```bash
terraform init -backend-config=environments/dev/backend.conf
```

Para ambiente **HML**:

```bash
terraform init -backend-config=environments/hml/backend.conf
```

## 📘 Como Usar

### Deploy Completo

#### Ambiente DEV

```bash
# 1. Visualizar o plano
terraform plan -var-file=environments/dev/terraform.tfvars

# 2. Aplicar as mudanças
terraform apply -var-file=environments/dev/terraform.tfvars

# 3. Ver os outputs
terraform output
```

#### Ambiente HML

```bash
# 1. Visualizar o plano
terraform plan -var-file=environments/hml/terraform.tfvars

# 2. Aplicar as mudanças
terraform apply -var-file=environments/hml/terraform.tfvars

# 3. Ver os outputs
terraform output
```

### Deploy de Aplicações

#### Backend (NestJS)

1. **Build e push da imagem Docker:**

```bash
# Login no ECR
aws ecr get-login-password --region sa-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.sa-east-1.amazonaws.com

# Build
cd backend
docker build -t trya-dev-backend:latest .

# Tag
docker tag trya-dev-backend:latest \
  <account-id>.dkr.ecr.sa-east-1.amazonaws.com/trya-dev-backend:latest

# Push
docker push <account-id>.dkr.ecr.sa-east-1.amazonaws.com/trya-dev-backend:latest
```

2. **Atualizar o serviço ECS:**

```bash
aws ecs update-service \
  --cluster Trya-dev-cluster \
  --service Trya-dev-service \
  --force-new-deployment \
  --region sa-east-1
```

#### Frontend (Next.js)

1. **Build da aplicação:**

```bash
cd frontend
npm install
npm run build
```

2. **Deploy para S3:**

```bash
# Sync arquivos estáticos (com cache longo)
aws s3 sync ./out s3://trya-dev-frontend/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html"

# Sync HTML files (sem cache)
aws s3 sync ./out s3://trya-dev-frontend/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate"
```

3. **Invalidar cache do CloudFront:**

```bash
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## 🔄 CI/CD

O projeto inclui 3 workflows do GitHub Actions:

### 1. Terraform Plan & Apply
**Arquivo:** `.github/workflows/terraform.yml`

- **Trigger:** Push ou PR em `develop` ou `main` (mudanças em `infra/`)
- **Ações:**
  - Executa `terraform plan` em PRs
  - Executa `terraform apply` em push direto
  - Comenta o resultado no PR/commit

### 2. Deploy Backend
**Arquivo:** `.github/workflows/deploy-backend.yml`

- **Trigger:** Push em `develop` ou `main` (mudanças em `backend/`)
- **Ações:**
  - Build da imagem Docker
  - Push para ECR
  - Atualização do serviço ECS
  - Scan de vulnerabilidades

### 3. Deploy Frontend
**Arquivo:** `.github/workflows/deploy-frontend.yml`

- **Trigger:** Push em `develop` ou `main` (mudanças em `frontend/`)
- **Ações:**
  - Build do Next.js
  - Sync com S3
  - Invalidação do CloudFront

### Configuração dos Secrets

Configure no GitHub (Settings → Secrets and variables → Actions):

```
AWS_ROLE_ARN: arn:aws:iam::<account-id>:role/GitHubActionsRole
```

**Criar a role no AWS:**

```bash
# Criar trust policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:<org>/<repo>:*"
      }
    }
  }]
}
EOF

# Criar role
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://trust-policy.json

# Attach policies necessárias
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
```

## 💰 Custos Estimados

### Ambiente DEV (Mensal)

| Serviço | Configuração | Custo Aprox. |
|---------|-------------|--------------|
| **ECS Fargate** | 0.5 vCPU, 1GB RAM, 1 task | ~$15 |
| **RDS PostgreSQL** | db.t4g.micro, 20GB | ~$20 |
| **ALB** | 1 ALB, baixo tráfego | ~$18 |
| **NAT Gateway** | 1 NAT, 10GB/mês | ~$35 |
| **S3** | 5GB armazenamento | ~$0.50 |
| **CloudFront** | 100GB transferência | ~$8 |
| **Route53** | 1 hosted zone | ~$0.50 |
| **Secrets Manager** | 3 secrets | ~$1.20 |
| **CloudWatch** | Logs + métricas básicas | ~$5 |
| **TOTAL** | | **~$103/mês** |

### Otimizações de Custo

1. **NAT Gateway** (maior custo):
   - Use `single_nat_gateway = true` (já configurado)
   - Considere NAT Instances para dev
   - Ou use VPC Endpoints para serviços AWS

2. **RDS**:
   - Use `db.t4g.micro` em dev/hml
   - Considere Aurora Serverless para custos variáveis

3. **ECS Fargate**:
   - Use Fargate Spot para economia de até 70%
   - Configure auto scaling para não desperdiçar recursos

4. **CloudFront**:
   - Use `PriceClass_100` (América do Norte e Europa)

## 🔧 Troubleshooting

### Erro: "Error creating ACM Certificate"

**Problema:** Certificado ACM não pode ser criado.

**Solução:**
```bash
# Verifique se o domínio está registrado
aws route53 list-hosted-zones

# Verifique registros DNS pendentes
aws acm describe-certificate --certificate-arn <arn>
```

### Erro: "Error creating ECS Service: InvalidParameterException"

**Problema:** Imagem Docker não existe no ECR.

**Solução:**
```bash
# Faça build e push de uma imagem inicial
cd backend
docker build -t placeholder .
docker tag placeholder:latest <ecr-url>:latest
docker push <ecr-url>:latest
```

### Erro: "NoSuchBucket" no Terraform Init

**Problema:** Bucket do backend não existe.

**Solução:**
```bash
# Crie o bucket conforme instruções em Pré-requisitos
aws s3api create-bucket --bucket trya-terraform-state --region sa-east-1
```

### ECS Tasks não iniciam

**Problema:** Tasks ficam em estado "PENDING".

**Diagnóstico:**
```bash
aws ecs describe-tasks \
  --cluster Trya-dev-cluster \
  --tasks <task-id> \
  --query 'tasks[0].containers[0].reason'
```

**Soluções comuns:**
- Verificar se imagem existe no ECR
- Verificar IAM roles
- Verificar security groups
- Verificar secrets no Secrets Manager

### CloudFront retorna 403

**Problema:** CloudFront não consegue acessar S3.

**Solução:**
```bash
# Verifique a OAC policy
aws s3api get-bucket-policy --bucket trya-dev-frontend

# Re-aplique o Terraform
terraform apply -var-file=environments/dev/terraform.tfvars
```

## 🔐 Segurança

### Secrets Management

Todos os secrets são armazenados no AWS Secrets Manager:

```bash
# Visualizar secrets
aws secretsmanager list-secrets

# Obter valor de um secret
aws secretsmanager get-secret-value --secret-id /Trya/dev/database_password
```

### Rotação de Senhas

Para rotacionar a senha do banco:

```bash
# 1. Gerar nova senha
NEW_PASSWORD=$(openssl rand -base64 32)

# 2. Atualizar no Secrets Manager
aws secretsmanager update-secret \
  --secret-id /Trya/dev/database_password \
  --secret-string "$NEW_PASSWORD"

# 3. Atualizar no RDS
aws rds modify-db-instance \
  --db-instance-identifier Trya-dev-postgres \
  --master-user-password "$NEW_PASSWORD" \
  --apply-immediately
```

### Acesso aos Recursos

**ECS Exec (para debug):**

```bash
aws ecs execute-command \
  --cluster Trya-dev-cluster \
  --task <task-id> \
  --container Trya-dev-container \
  --interactive \
  --command "/bin/bash"
```

**Logs do CloudWatch:**

```bash
aws logs tail /ecs/Trya-dev --follow
```

## 🛠️ Manutenção

### Backup e Restore do RDS

**Criar snapshot manual:**

```bash
aws rds create-db-snapshot \
  --db-instance-identifier Trya-dev-postgres \
  --db-snapshot-identifier trya-dev-manual-$(date +%Y%m%d)
```

**Restaurar de snapshot:**

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier Trya-dev-postgres-restored \
  --db-snapshot-identifier trya-dev-manual-20250101
```

### Atualização da Infraestrutura

```bash
# 1. Atualizar código Terraform
git pull origin develop

# 2. Revisar mudanças
terraform plan -var-file=environments/dev/terraform.tfvars

# 3. Aplicar
terraform apply -var-file=environments/dev/terraform.tfvars
```

### Destruir Ambiente

**⚠️ CUIDADO: Ação irreversível!**

```bash
# Confirme o ambiente
terraform workspace show

# Destrua os recursos
terraform destroy -var-file=environments/dev/terraform.tfvars
```

## 📚 Estrutura do Projeto

```
trya-infra/
├── main.tf                 # Orquestração principal
├── variables.tf            # Variáveis globais
├── outputs.tf              # Outputs principais
├── provider.tf             # Configuração AWS provider
├── environments/
│   ├── dev/
│   │   ├── terraform.tfvars    # Configurações dev
│   │   └── backend.conf        # Backend config dev
│   └── hml/
│       ├── terraform.tfvars    # Configurações hml
│       └── backend.conf        # Backend config hml
├── modules/
│   ├── network/            # VPC, subnets, NAT, IGW
│   ├── ecr/                # Container registry
│   ├── ecs_service/        # ECS Fargate + ALB
│   ├── rds_postgres/       # RDS PostgreSQL
│   ├── s3_static_site/     # S3 buckets
│   ├── cloudfront/         # CDN distribution
│   ├── route53/            # DNS management
│   ├── acm/                # SSL certificates
│   ├── secrets/            # Secrets Manager
│   └── observability/      # CloudWatch
├── .github/
│   └── workflows/
│       ├── terraform.yml           # CI/CD Terraform
│       ├── deploy-backend.yml      # CI/CD Backend
│       └── deploy-frontend.yml     # CI/CD Frontend
└── README.md
```

## 🤝 Contribuindo

1. Crie uma branch feature: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -am 'Adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Suporte

- **Email**: devops@trya.com.br
- **Slack**: #trya-infrastructure
- **Documentação**: https://docs.trya.com.br

---

**Desenvolvido com ❤️ pela equipe Trya**
