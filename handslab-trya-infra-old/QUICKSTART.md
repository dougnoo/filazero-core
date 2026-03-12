# Trya Infrastructure - Quick Start Guide

## 🚀 Início Rápido

### 1. Pré-requisitos

```bash
# Instalar Terraform
brew install terraform  # macOS
# ou
sudo apt-get install terraform  # Linux

# Instalar AWS CLI
brew install awscli  # macOS
# ou
sudo apt-get install awscli  # Linux

# Configurar AWS
aws configure
```

### 2. Setup Inicial

```bash
# Dar permissão de execução aos scripts
chmod +x setup.sh deploy.sh

# Executar setup (criar bucket S3 e DynamoDB)
./setup.sh
```

### 3. Configurar Ambiente

Edite as configurações do ambiente desejado:

```bash
# Para DEV
vim environments/dev/terraform.tfvars

# Configure:
# - domain_name (seu domínio)
# - alarm_email (seu email)
# - create_route53_zone (true se não tem zona criada)
```

### 4. Deploy

```bash
# Ambiente DEV
./deploy.sh dev plan    # Visualizar mudanças
./deploy.sh dev apply   # Aplicar mudanças

# Ambiente HML
./deploy.sh hml plan
./deploy.sh hml apply
```

### 5. Verificar Outputs

```bash
terraform output

# Você verá:
# - frontend_url
# - backend_url
# - ecr_repository_urls
# - cloudfront_distribution_id
# etc.
```

## 📦 Deploy de Aplicações

### Backend (após infraestrutura criada)

```bash
# 1. Obter URL do ECR
ECR_URL=$(terraform output -raw ecr_repository_urls | jq -r '.backend')

# 2. Login no ECR
aws ecr get-login-password --region sa-east-1 | \
  docker login --username AWS --password-stdin $ECR_URL

# 3. Build e Push
cd ../backend
docker build -t backend:latest .
docker tag backend:latest $ECR_URL:latest
docker push $ECR_URL:latest

# 4. Forçar novo deploy
aws ecs update-service \
  --cluster Trya-dev-cluster \
  --service Trya-dev-service \
  --force-new-deployment
```

### Frontend

```bash
# 1. Build
cd ../frontend
npm install
npm run build

# 2. Deploy para S3
BUCKET=$(terraform output -raw frontend_bucket_name)
aws s3 sync ./out s3://$BUCKET/ --delete

# 3. Invalidar CloudFront
DIST_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

## 🔄 CI/CD Automático

### Configurar GitHub Actions

1. **Criar OIDC Provider no AWS:**

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

2. **Criar IAM Role para GitHub Actions:**

```bash
# Usar o script ou criar manualmente no console AWS
# Role name: GitHubActionsRole
# Trust relationship: token.actions.githubusercontent.com
# Permissions: PowerUserAccess ou custom policy
```

3. **Configurar Secret no GitHub:**

```
Repository Settings → Secrets → Actions
Name: AWS_ROLE_ARN
Value: arn:aws:iam::<account-id>:role/GitHubActionsRole
```

4. **Push para ativar workflows:**

```bash
git push origin develop  # Deploy para DEV
git push origin main     # Deploy para HML
```

## 📊 Monitoramento

### Acessar Dashboard

```bash
# URL do dashboard
echo "https://console.aws.amazon.com/cloudwatch/home?region=sa-east-1#dashboards:name=Trya-dev-dashboard"
```

### Ver Logs ECS

```bash
aws logs tail /ecs/Trya-dev --follow
```

### Métricas Importantes

- CPU Utilization (ECS)
- Memory Utilization (ECS)
- Target Response Time (ALB)
- 5XX Errors (ALB)
- Database Connections (RDS)

## 🛠️ Comandos Úteis

```bash
# Ver estado atual
terraform show

# Listar recursos
terraform state list

# Formatar código
terraform fmt -recursive

# Validar configuração
terraform validate

# Ver plan salvo
terraform show tfplan

# Atualizar um recurso específico
terraform apply -target=module.ecs_service

# Importar recurso existente
terraform import module.network.aws_vpc.main vpc-xxxxx

# Destruir ambiente
./deploy.sh dev destroy
```

## ❓ Troubleshooting Rápido

### Terraform init falha

```bash
# Verificar se bucket existe
aws s3 ls s3://trya-terraform-state

# Re-criar se necessário
./setup.sh
```

### ECS tasks não iniciam

```bash
# Ver logs da task
aws ecs describe-tasks \
  --cluster Trya-dev-cluster \
  --tasks <task-id>

# Verificar imagem no ECR
aws ecr describe-images \
  --repository-name trya-dev-backend
```

### CloudFront retorna 403

```bash
# Verificar bucket policy
aws s3api get-bucket-policy --bucket trya-dev-frontend

# Re-aplicar infraestrutura
./deploy.sh dev apply
```

## 🔗 Links Úteis

- [Documentação Completa](./README.md)
- [AWS Console](https://console.aws.amazon.com/)
- [Terraform Registry](https://registry.terraform.io/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Dúvidas?** Consulte o [README.md](./README.md) completo ou entre em contato com a equipe.
