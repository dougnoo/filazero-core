# Configuração Completa - Integração Backend + Lambda

## ✅ Problema Resolvido

**Erro:** Frontend retornava "Failed to send message" ao enviar mensagens no chat.

**Causa:** Backend ECS não tinha permissão IAM para invocar a Lambda de triagem.

**Solução:** Adicionada política `lambda:InvokeFunction` na role `Trya-dev-ecs-task-role`.

---

## 📋 Configuração Aplicada

### 1. Permissão IAM (AWS Console)

```bash
aws iam put-role-policy \
  --role-name Trya-dev-ecs-task-role \
  --policy-name LambdaInvokePolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": [
        "arn:aws:lambda:us-east-1:416684166863:function:triagem-saude-agente-dev",
        "arn:aws:lambda:us-east-1:416684166863:function:triagem-saude-agente-hml"
      ]
    }]
  }' \
  --profile skopia \
  --region us-east-1
```

**Status:** ✅ Aplicado manualmente em 20/01/2026

### 2. Infraestrutura (Terraform)

**Arquivos modificados:**

#### `modules/ecs_service/main.tf`
```hcl
# Lambda Invoke Policy for Chat Agents
resource "aws_iam_role_policy" "lambda_invoke" {
  count = var.enable_lambda_invoke ? 1 : 0
  name  = "${local.name_prefix}-lambda-invoke-policy"
  role  = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["lambda:InvokeFunction"]
        Resource = var.lambda_function_arns
      }
    ]
  })
}
```

#### `modules/ecs_service/variables.tf`
```hcl
variable "enable_lambda_invoke" {
  description = "Enable Lambda invoke permissions for ECS tasks"
  type        = bool
  default     = false
}

variable "lambda_function_arns" {
  description = "List of Lambda function ARNs that ECS tasks can invoke"
  type        = list(string)
  default     = []
}
```

#### `stacks/backend/main.tf`
```hcl
module "ecs_service" {
  # ... outras configs ...
  
  enable_lambda_invoke = true
  lambda_function_arns = [
    "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:triagem-saude-agente-${var.environment}"
  ]
}

data "aws_caller_identity" "current" {}
```

**Status:** ✅ Código atualizado, pronto para próximo `terraform apply`

### 3. Pipeline Lambda (Bitbucket)

**Arquivo:** `handslab-trya-chat-agents/bitbucket-pipelines.yml`

```yaml
pipelines:
  branches:
    development:
      - step:
          name: Build Lambda Package
          script:
            - apt-get update && apt-get install -y zip
            - pip install aws-sam-cli
            - sam build
            - cd .aws-sam/build/TriagemSaudeFunction
            - zip -r /tmp/lambda-deploy.zip . -x "*.pyc" -x "*__pycache__*"
          artifacts:
            - /tmp/lambda-deploy.zip
      - step:
          name: Deploy to DEV
          deployment: Develop
          script:
            - pipe: atlassian/aws-lambda-deploy:1.8.0
              variables:
                AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
                AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
                AWS_DEFAULT_REGION: 'us-east-1'
                FUNCTION_NAME: 'triagem-saude-agente-dev'
                ZIP_FILE: '/tmp/lambda-deploy.zip'
    
    staging:
      - step: *build
      - step:
          name: Deploy to HML
          deployment: Staging
          script:
            - pipe: atlassian/aws-lambda-deploy:1.8.0
              variables:
                AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
                AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
                AWS_DEFAULT_REGION: 'us-east-1'
                FUNCTION_NAME: 'triagem-saude-agente-hml'
                ZIP_FILE: '/tmp/lambda-deploy.zip'
```

**Status:** ✅ Configurado e testado

### 4. Script de Deploy Manual

**Arquivo:** `handslab-trya-chat-agents/deploy.sh`

```bash
#!/bin/bash
ENV=$1

if [ "$ENV" != "dev" ] && [ "$ENV" != "hml" ]; then
  echo "Uso: ./deploy.sh [dev|hml]"
  exit 1
fi

FUNCTION_NAME="triagem-saude-agente-${ENV}"

echo "🔨 Building com SAM..."
sam build

echo "📦 Criando zip..."
cd .aws-sam/build/TriagemSaudeFunction
zip -r /tmp/lambda-${ENV}.zip . -x "*.pyc" -x "*__pycache__*"

echo "🚀 Deploying para ${FUNCTION_NAME}..."
aws lambda update-function-code \
  --function-name ${FUNCTION_NAME} \
  --zip-file fileb:///tmp/lambda-${ENV}.zip \
  --profile skopia \
  --region us-east-1

echo "⏳ Aguardando função ficar ativa..."
aws lambda wait function-updated \
  --function-name ${FUNCTION_NAME} \
  --profile skopia \
  --region us-east-1

echo "✅ Deploy concluído!"
rm /tmp/lambda-${ENV}.zip
```

**Status:** ✅ Testado e funcionando

---

## 🔍 Verificação

### Testar Integração

1. Acesse: `https://dev-app-grupotrigo.trya.ai`
2. Faça login
3. Envie mensagem no chat
4. Verifique resposta da IA

### Logs

```bash
# Backend
aws logs tail /ecs/trya-backend-task --follow --profile skopia

# Lambda
aws logs tail /aws/lambda/triagem-saude-agente-dev --follow --profile skopia
```

### Verificar Permissões

```bash
aws iam get-role-policy \
  --role-name Trya-dev-ecs-task-role \
  --policy-name LambdaInvokePolicy \
  --profile skopia
```

---

## 📚 Documentação

- **Infra:** `handslab-trya-infra/docs/LAMBDA_INTEGRATION.md`
- **Lambda:** `handslab-trya-chat-agents/README.md`
- **Backend:** Variável `LAMBDA_CHAT_FUNCTION_NAME` na task definition

---

## 🎯 Próximos Passos

### Para DEV/HML
✅ Configuração manual aplicada  
✅ Pipeline configurada  
✅ Código Terraform atualizado  
⏳ Aguardando próximo `terraform apply` para sincronizar

### Para PROD
- [ ] Aplicar mesma configuração IAM
- [ ] Criar Lambda `triagem-saude-agente-prod`
- [ ] Configurar pipeline para branch `main`
- [ ] Atualizar Terraform para ambiente prod

---

## 🔧 Manutenção

### Adicionar Nova Lambda

1. Criar função Lambda
2. Atualizar `lambda_function_arns` no Terraform:
```hcl
lambda_function_arns = [
  "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:nova-lambda-${var.environment}"
]
```
3. Aplicar Terraform
4. Configurar variável de ambiente no backend

### Remover Permissão

```bash
aws iam delete-role-policy \
  --role-name Trya-dev-ecs-task-role \
  --policy-name LambdaInvokePolicy \
  --profile skopia
```

---

## 📞 Suporte

**Erro comum:** "AccessDeniedException" ao invocar Lambda
- Verificar se política IAM está aplicada
- Verificar ARN da Lambda está correto
- Verificar região (us-east-1)

**Lambda não responde:**
- Verificar logs da Lambda
- Verificar timeout (300s)
- Verificar memória (1024MB)
- Verificar VPC/Security Groups
