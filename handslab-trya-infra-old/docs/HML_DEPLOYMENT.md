# Ambiente HML - Documentação de Deploy

## Visão Geral

O ambiente HML está provisionado em **us-east-1** para evitar conflitos com recursos existentes em sa-east-1.

## Recursos Provisionados

### Network (VPC)
- **VPC:** Trya-hml-vpc
- **Região:** us-east-1
- **CIDR:** 10.1.0.0/16
- **Availability Zones:** us-east-1a, us-east-1b, us-east-1c

### Backend (API)
- **Cluster ECS:** Trya-hml-v2-cluster
- **Service:** Trya-hml-v2-service
- **Task Definition:** Trya-hml-v2-task
- **ALB:** Trya-hml-v2-alb-1422690273.us-east-1.elb.amazonaws.com
- **ECR:** trya-hml-backend
- **RDS:** db-trya-hml-postgres-v2

### Frontend
- **Cluster ECS:** Trya-hml-fe-cluster
- **Service:** Trya-hml-fe-service
- **Task Definition:** Trya-hml-fe-task
- **ALB:** Trya-hml-fe-alb-710051839.us-east-1.elb.amazonaws.com
- **ECR:** trya-hml-frontend

### Platform
- **Cluster ECS:** Trya-hml-plat-cluster
- **Service:** Trya-hml-plat-service
- **ALB:** Trya-hml-plat-alb-307667034.us-east-1.elb.amazonaws.com
- **ECR:** trya-hml-platform

### Chat
- **Cluster ECS:** Trya-hml-chat-cluster
- **Service:** Trya-hml-chat-service
- **ALB:** Trya-hml-chat-alb-1424720028.us-east-1.elb.amazonaws.com
- **ECR:** trya-hml-chat

## URLs

| Serviço | URL |
|---------|-----|
| Frontend | https://hml.trya.ai |
| Backend API | https://api-hml.trya.ai |
| Platform | https://platform-hml.trya.ai |
| Chat | https://chat-hml.trya.ai |

## DNS (Hostinger)

Os registros DNS estão configurados na Hostinger (ns1.dns-parking.com / ns2.dns-parking.com).

### Registros CNAME Configurados

| Subdomínio | Tipo | Valor |
|------------|------|-------|
| hml | CNAME | Trya-hml-fe-alb-710051839.us-east-1.elb.amazonaws.com |
| api-hml | CNAME | Trya-hml-v2-alb-1422690273.us-east-1.elb.amazonaws.com |
| platform-hml | CNAME | Trya-hml-plat-alb-307667034.us-east-1.elb.amazonaws.com |
| chat-hml | CNAME | Trya-hml-chat-alb-1424720028.us-east-1.elb.amazonaws.com |

## Multi-Tenant

### Como Funciona

O sistema identifica o tenant de duas formas:
1. **Via subdomínio:** `hml-grupotrigo.trya.ai` → extrai `grupotrigo`
2. **Via query parameter:** `?tenant=grupotrigo`

### Tenants Conhecidos

| Slug | Nome |
|------|------|
| grupotrigo | Grupo Trigo |
| medico | Trya Médico (via rota /medico) |

### Configuração de Novo Tenant

1. Adicionar no `tenantUtils.ts`:
```typescript
export const KNOWN_TENANTS: Record<string, string> = {
  'grupotrigo': 'Grupo Trigo',
  'novo-tenant': 'Nome do Tenant',
};
```

2. Criar CNAME na Hostinger:
```
hml-novo-tenant CNAME Trya-hml-fe-alb-710051839.us-east-1.elb.amazonaws.com
```

3. Configurar tema no DynamoDB (tabela `novo-tenant`)

## Permissões IAM

### Role: Trya-hml-v2-ecs-task-role

Políticas inline:
- **TryaBackendPermissions:** DynamoDB, S3, Cognito, SES, Bedrock
- **CognitoAdminPolicy:** Operações admin no Cognito
- **InvokeChatLambda:** Invocar Lambda de chat
- **InvokeTriagemLambda:** Invocar Lambda de triagem

## Variáveis de Ambiente

### Backend (Trya-hml-v2-task)

| Variável | Valor |
|----------|-------|
| NODE_ENV | hml |
| PORT | 3000 |
| POSTGRES_HOST | db-trya-hml-postgres-v2.c0l4y2syc0wl.us-east-1.rds.amazonaws.com |
| POSTGRES_PORT | 5432 |
| POSTGRES_USER | trya_admin |
| POSTGRES_DB | trya_hml |
| POSTGRES_PASSWORD | (via Secrets Manager: /Trya/hml/database_password) |

### Frontend (Trya-hml-fe-task)

| Variável | Valor |
|----------|-------|
| NODE_ENV | hml |
| PORT | 3000 |
| NEXT_PUBLIC_API_BASE_URL | https://api-hml.trya.ai |
| NEXT_PUBLIC_PLATFORM_API_BASE_URL | https://platform-hml.trya.ai |

## Deploy Manual

### Frontend

```bash
# 1. Criar .env.production
cd trya-frontend
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_BASE_URL=https://api-hml.trya.ai
NEXT_PUBLIC_PLATFORM_API_BASE_URL=https://platform-hml.trya.ai
NODE_ENV=production
EOF

# 2. Login no ECR
aws ecr get-login-password --profile skopia --region us-east-1 | \
  docker login --username AWS --password-stdin 416684166863.dkr.ecr.us-east-1.amazonaws.com

# 3. Build e push
docker build -t 416684166863.dkr.ecr.us-east-1.amazonaws.com/trya-hml-frontend:latest .
docker push 416684166863.dkr.ecr.us-east-1.amazonaws.com/trya-hml-frontend:latest

# 4. Forçar deploy
aws ecs update-service --profile skopia --region us-east-1 \
  --cluster Trya-hml-fe-cluster \
  --service Trya-hml-fe-service \
  --force-new-deployment
```

### Backend

```bash
cd handslab-trya-backend

# 1. Login no ECR
aws ecr get-login-password --profile skopia --region us-east-1 | \
  docker login --username AWS --password-stdin 416684166863.dkr.ecr.us-east-1.amazonaws.com

# 2. Build e push
docker build -t 416684166863.dkr.ecr.us-east-1.amazonaws.com/trya-hml-backend:latest .
docker push 416684166863.dkr.ecr.us-east-1.amazonaws.com/trya-hml-backend:latest

# 3. Forçar deploy
aws ecs update-service --profile skopia --region us-east-1 \
  --cluster Trya-hml-v2-cluster \
  --service Trya-hml-v2-service \
  --force-new-deployment
```

## Certificado SSL

O certificado wildcard `*.trya.ai` está configurado na ACM em us-east-1 e vinculado aos ALBs via HTTPS listener (porta 443).

## Troubleshooting

### Erro de conexão com banco

1. Verificar se `POSTGRES_HOST` não inclui porta (deve ser só hostname)
2. Verificar secret `/Trya/hml/database_password` no Secrets Manager
3. Verificar security group permite conexão na porta 5432

### Erro de permissão DynamoDB

Verificar se a role `Trya-hml-v2-ecs-task-role` tem a política `TryaBackendPermissions` com acesso ao DynamoDB.

### Tema do tenant não carrega

1. Verificar se a tabela do tenant existe no DynamoDB (us-east-1)
2. Verificar se `NEXT_PUBLIC_API_BASE_URL` está configurado corretamente
3. Verificar se o frontend foi buildado com a variável (é build-time, não runtime)

### Erro de CORS "Not allowed by CORS"

1. Verificar se `CORS_ORIGIN=*` está configurado no backend ECS
2. Redeployar o backend após adicionar a variável

### Health check falhando

1. Verificar se o health check do container usa `/api/health` (não `/health`)
2. O Target Group do ALB usa `/api/health`
3. O health check do container na task definition deve ser:
   ```
   CMD-SHELL, curl -f http://localhost:3000/api/health || exit 1
   ```

### Imagem Docker incompatível (platform error)

Se o erro mencionar `image Manifest does not contain descriptor matching platform 'linux/amd64'`:

1. Rebuildar a imagem com `--platform linux/amd64`:
   ```bash
   docker build --platform linux/amd64 -t <image>:latest .
   ```
2. Push e redeploy
