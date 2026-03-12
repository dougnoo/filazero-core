# 🔧 Comandos Úteis - Referência Rápida

## 📦 Setup Inicial

```bash
# Setup completo (criar bucket S3 e DynamoDB)
./setup.sh

# Ou manualmente:
aws s3api create-bucket --bucket trya-terraform-state --region sa-east-1
aws dynamodb create-table --table-name trya-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region sa-east-1
```

## 🚀 Terraform

```bash
# Inicializar
terraform init -backend-config=environments/dev/backend.conf

# Atualizar providers
terraform init -upgrade

# Planejar mudanças
terraform plan -var-file=environments/dev/terraform.tfvars

# Aplicar mudanças
terraform apply -var-file=environments/dev/terraform.tfvars

# Aplicar mudanças automaticamente
terraform apply -var-file=environments/dev/terraform.tfvars -auto-approve

# Destruir recursos
terraform destroy -var-file=environments/dev/terraform.tfvars

# Ver outputs
terraform output

# Ver output específico
terraform output -raw frontend_url

# Formatar código
terraform fmt -recursive

# Validar configuração
terraform validate

# Ver estado atual
terraform show

# Listar recursos
terraform state list

# Ver recurso específico
terraform state show module.network.aws_vpc.main

# Atualizar recurso específico
terraform apply -target=module.ecs_service -var-file=environments/dev/terraform.tfvars

# Importar recurso existente
terraform import module.network.aws_vpc.main vpc-xxxxx
```

## 🐳 Docker & ECR

```bash
# Obter URL do ECR
ECR_URL=$(terraform output -raw ecr_repository_urls | jq -r '.backend')

# Login no ECR
aws ecr get-login-password --region sa-east-1 | \
  docker login --username AWS --password-stdin $ECR_URL

# Build imagem
docker build -t backend:latest ./backend

# Tag imagem
docker tag backend:latest $ECR_URL:latest
docker tag backend:latest $ECR_URL:$(git rev-parse --short HEAD)

# Push imagem
docker push $ECR_URL:latest
docker push $ECR_URL:$(git rev-parse --short HEAD)

# Listar imagens no ECR
aws ecr list-images --repository-name trya-dev-backend

# Scan de vulnerabilidades
aws ecr start-image-scan \
  --repository-name trya-dev-backend \
  --image-id imageTag=latest

# Ver resultado do scan
aws ecr describe-image-scan-findings \
  --repository-name trya-dev-backend \
  --image-id imageTag=latest
```

## 🎯 ECS

```bash
# Listar clusters
aws ecs list-clusters

# Descrever cluster
aws ecs describe-clusters --clusters Trya-dev-cluster

# Listar serviços
aws ecs list-services --cluster Trya-dev-cluster

# Descrever serviço
aws ecs describe-services \
  --cluster Trya-dev-cluster \
  --services Trya-dev-service

# Listar tasks
aws ecs list-tasks --cluster Trya-dev-cluster

# Descrever task
aws ecs describe-tasks \
  --cluster Trya-dev-cluster \
  --tasks <task-id>

# Forçar novo deployment
aws ecs update-service \
  --cluster Trya-dev-cluster \
  --service Trya-dev-service \
  --force-new-deployment

# Atualizar desired count
aws ecs update-service \
  --cluster Trya-dev-cluster \
  --service Trya-dev-service \
  --desired-count 2

# ECS Exec (debug)
aws ecs execute-command \
  --cluster Trya-dev-cluster \
  --task <task-id> \
  --container Trya-dev-container \
  --interactive \
  --command "/bin/bash"

# Ver logs da task
aws ecs describe-tasks \
  --cluster Trya-dev-cluster \
  --tasks <task-id> \
  --query 'tasks[0].containers[0].reason' \
  --output text
```

## 📊 CloudWatch

```bash
# Ver logs do ECS (tail)
aws logs tail /ecs/Trya-dev --follow

# Ver logs com filtro
aws logs tail /ecs/Trya-dev --follow --filter-pattern "ERROR"

# Ver logs por período
aws logs tail /ecs/Trya-dev \
  --since 1h \
  --format short

# Listar log groups
aws logs describe-log-groups

# Listar métricas
aws cloudwatch list-metrics --namespace AWS/ECS

# Ver métrica específica
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=Trya-dev-cluster \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Listar alarms
aws cloudwatch describe-alarms

# Desabilitar alarm
aws cloudwatch disable-alarm-actions --alarm-names Trya-dev-ecs-cpu-high

# Habilitar alarm
aws cloudwatch enable-alarm-actions --alarm-names Trya-dev-ecs-cpu-high
```

## 🗄️ RDS

```bash
# Listar instâncias
aws rds describe-db-instances

# Ver detalhes da instância
aws rds describe-db-instances \
  --db-instance-identifier Trya-dev-postgres

# Criar snapshot
aws rds create-db-snapshot \
  --db-instance-identifier Trya-dev-postgres \
  --db-snapshot-identifier trya-dev-manual-$(date +%Y%m%d)

# Listar snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier Trya-dev-postgres

# Restaurar de snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier Trya-dev-postgres-restored \
  --db-snapshot-identifier trya-dev-manual-20250121

# Modificar instância
aws rds modify-db-instance \
  --db-instance-identifier Trya-dev-postgres \
  --allocated-storage 30 \
  --apply-immediately

# Ver eventos
aws rds describe-events \
  --source-identifier Trya-dev-postgres \
  --source-type db-instance \
  --duration 60
```

## 🪣 S3

```bash
# Listar buckets
aws s3 ls

# Listar conteúdo do bucket
aws s3 ls s3://trya-dev-frontend/

# Sync local para S3
aws s3 sync ./frontend/out s3://trya-dev-frontend/ --delete

# Sync com cache headers
aws s3 sync ./frontend/out s3://trya-dev-frontend/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html"

# Download do S3
aws s3 sync s3://trya-dev-frontend/ ./backup/

# Ver bucket policy
aws s3api get-bucket-policy --bucket trya-dev-frontend

# Ver tamanho do bucket
aws s3 ls s3://trya-dev-frontend/ --recursive --summarize
```

## ☁️ CloudFront

```bash
# Obter Distribution ID
DIST_ID=$(terraform output -raw cloudfront_distribution_id)

# Listar distributions
aws cloudfront list-distributions

# Ver detalhes da distribution
aws cloudfront get-distribution --id $DIST_ID

# Criar invalidação
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"

# Criar invalidação específica
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/index.html" "/static/*"

# Ver invalidações
aws cloudfront list-invalidations --distribution-id $DIST_ID

# Ver status da invalidação
aws cloudfront get-invalidation \
  --distribution-id $DIST_ID \
  --id <invalidation-id>
```

## 🔐 Secrets Manager

```bash
# Listar secrets
aws secretsmanager list-secrets

# Ver valor do secret
aws secretsmanager get-secret-value \
  --secret-id /Trya/dev/database_password

# Ver valor do secret (apenas string)
aws secretsmanager get-secret-value \
  --secret-id /Trya/dev/database_password \
  --query SecretString \
  --output text

# Atualizar secret
aws secretsmanager update-secret \
  --secret-id /Trya/dev/jwt_secret \
  --secret-string "new-secret-value"

# Criar novo secret
aws secretsmanager create-secret \
  --name /Trya/dev/api_key \
  --secret-string "my-api-key"

# Deletar secret (com recovery)
aws secretsmanager delete-secret \
  --secret-id /Trya/dev/old_secret \
  --recovery-window-in-days 7

# Restaurar secret deletado
aws secretsmanager restore-secret \
  --secret-id /Trya/dev/old_secret
```

## 🌐 Route53

```bash
# Listar hosted zones
aws route53 list-hosted-zones

# Ver registros DNS
aws route53 list-resource-record-sets \
  --hosted-zone-id <zone-id>

# Criar registro A (manualmente)
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch file://change-batch.json

# Testar resolução DNS
dig dev.trya.com.br
nslookup api-dev.trya.com.br
```

## 📈 Application Load Balancer

```bash
# Listar ALBs
aws elbv2 describe-load-balancers

# Ver detalhes do ALB
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names Trya-dev-alb \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Ver target groups
aws elbv2 describe-target-groups --load-balancer-arn $ALB_ARN

# Ver targets registrados
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>

# Ver listeners
aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN
```

## 🔄 GitHub Actions (local testing)

```bash
# Instalar act (GitHub Actions local runner)
brew install act  # macOS

# Rodar workflow localmente
act -j terraform-plan

# Rodar com secrets
act -j terraform-plan --secret-file .secrets

# Listar workflows
act -l

# Rodar workflow específico
act push -W .github/workflows/terraform.yml
```

## 🛠️ Troubleshooting

```bash
# Ver status geral AWS
aws sts get-caller-identity

# Testar conectividade RDS
nc -zv <rds-endpoint> 5432

# Testar conectividade ALB
curl -I https://api-dev.trya.com.br/health

# Testar CloudFront
curl -I https://dev.trya.com.br

# Ver custos do mês
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "first day of this month" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Ver limites de serviços
aws service-quotas list-service-quotas \
  --service-code ecs

# Ver eventos recentes (CloudTrail)
aws cloudtrail lookup-events \
  --max-results 10 \
  --lookup-attributes AttributeKey=ResourceType,AttributeValue=AWS::ECS::Service
```

## 🧪 Testes

```bash
# Testar health check backend
curl https://api-dev.trya.com.br/health

# Testar health check frontend
curl https://dev.trya.com.br/health.html

# Load test (básico)
ab -n 1000 -c 10 https://api-dev.trya.com.br/health

# Ver response headers
curl -I https://dev.trya.com.br

# Verificar SSL
openssl s_client -connect dev.trya.com.br:443 -servername dev.trya.com.br

# Testar DNS
host dev.trya.com.br
dig +trace dev.trya.com.br
```

## 📝 Aliases Úteis (adicione ao ~/.bashrc ou ~/.zshrc)

```bash
# Terraform shortcuts
alias tf='terraform'
alias tfi='terraform init'
alias tfp='terraform plan'
alias tfa='terraform apply'
alias tfo='terraform output'
alias tfs='terraform show'

# AWS ECS shortcuts
alias ecs-services='aws ecs list-services --cluster Trya-dev-cluster'
alias ecs-tasks='aws ecs list-tasks --cluster Trya-dev-cluster'
alias ecs-deploy='aws ecs update-service --cluster Trya-dev-cluster --service Trya-dev-service --force-new-deployment'

# CloudWatch logs
alias logs-dev='aws logs tail /ecs/Trya-dev --follow'
alias logs-hml='aws logs tail /ecs/Trya-hml --follow'

# Quick status check
alias status-dev='echo "ECS:" && aws ecs describe-services --cluster Trya-dev-cluster --services Trya-dev-service --query "services[0].runningCount" && echo "RDS:" && aws rds describe-db-instances --db-instance-identifier Trya-dev-postgres --query "DBInstances[0].DBInstanceStatus"'
```

## 🔗 URLs Úteis

```bash
# AWS Console
echo "ECS: https://console.aws.amazon.com/ecs/home?region=sa-east-1#/clusters/Trya-dev-cluster/services"
echo "RDS: https://console.aws.amazon.com/rds/home?region=sa-east-1"
echo "CloudWatch: https://console.aws.amazon.com/cloudwatch/home?region=sa-east-1"
echo "S3: https://s3.console.aws.amazon.com/s3/buckets/trya-dev-frontend"
echo "CloudFront: https://console.aws.amazon.com/cloudfront/v3/home"

# Application URLs
echo "Frontend DEV: https://dev.trya.com.br"
echo "Backend DEV: https://api-dev.trya.com.br"
echo "Frontend HML: https://hml.trya.com.br"
echo "Backend HML: https://api-hml.trya.com.br"
```

---

💡 **Dica:** Salve este arquivo como referência rápida e personalize os aliases conforme sua necessidade!
