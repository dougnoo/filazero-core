# Integração Backend com Lambda Chat Agents

## Visão Geral

O backend (`handslab-trya-backend`) invoca a Lambda de triagem de saúde (`triagem-saude-agente`) para processar mensagens de chat. Esta integração requer permissões IAM específicas.

## Configuração IAM

### Permissões Necessárias

A role IAM da task ECS (`Trya-{env}-ecs-task-role`) precisa ter permissão para invocar a Lambda:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:416684166863:function:triagem-saude-agente-dev",
        "arn:aws:lambda:us-east-1:416684166863:function:triagem-saude-agente-hml"
      ]
    }
  ]
}
```

### Configuração no Terraform

A configuração está no módulo `ecs_service`:

**Módulo (`modules/ecs_service/main.tf`):**
```hcl
resource "aws_iam_role_policy" "lambda_invoke" {
  count = var.enable_lambda_invoke ? 1 : 0
  name  = "${local.name_prefix}-lambda-invoke-policy"
  role  = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = var.lambda_function_arns
      }
    ]
  })
}
```

**Stack Backend (`stacks/backend/main.tf`):**
```hcl
module "ecs_service" {
  source = "../../modules/ecs_service"
  
  # ... outras configurações ...
  
  # Habilitar permissões Lambda
  enable_lambda_invoke = true
  lambda_function_arns = [
    "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:triagem-saude-agente-${var.environment}"
  ]
}
```

## Variáveis de Ambiente

O backend precisa saber qual Lambda invocar:

```bash
LAMBDA_CHAT_FUNCTION_NAME=triagem-saude-agente-dev  # ou -hml
```

Esta variável já está configurada na task definition do ECS.

## Deploy

### Aplicar Configuração Terraform

```bash
cd stacks/backend
terraform init -backend-config=../../environments/dev/backend.backend.conf
terraform plan -var-file=../../environments/dev/backend.tfvars
terraform apply -var-file=../../environments/dev/backend.tfvars
```

### Aplicar Manualmente (Emergência)

Se precisar aplicar a permissão manualmente sem Terraform:

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

## Verificação

### Verificar Permissões

```bash
# Listar políticas da role
aws iam list-role-policies \
  --role-name Trya-dev-ecs-task-role \
  --profile skopia

# Ver detalhes da política
aws iam get-role-policy \
  --role-name Trya-dev-ecs-task-role \
  --policy-name LambdaInvokePolicy \
  --profile skopia
```

### Testar Integração

1. Acesse o frontend: `https://dev-app-grupotrigo.trya.ai`
2. Faça login
3. Envie uma mensagem no chat
4. Verifique os logs:

```bash
# Logs do backend
aws logs tail /ecs/trya-backend-task --follow --profile skopia

# Logs da Lambda
aws logs tail /aws/lambda/triagem-saude-agente-dev --follow --profile skopia
```

## Troubleshooting

### Erro: AccessDeniedException

**Sintoma:** Frontend retorna "Failed to send message"

**Causa:** Backend não tem permissão para invocar Lambda

**Solução:** Aplicar a política IAM conforme documentado acima

### Lambda não é invocada

**Verificar:**
1. Variável `LAMBDA_CHAT_FUNCTION_NAME` está configurada
2. Nome da função está correto
3. Região está correta (us-east-1)
4. Lambda existe e está ativa

```bash
aws lambda get-function \
  --function-name triagem-saude-agente-dev \
  --profile skopia \
  --region us-east-1
```

## Ambientes

### DEV
- Backend: `trya-backend-dev` (ECS)
- Lambda: `triagem-saude-agente-dev`
- Role: `Trya-dev-ecs-task-role`

### HML
- Backend: `trya-backend-hml` (ECS)
- Lambda: `triagem-saude-agente-hml`
- Role: `Trya-hml-ecs-task-role`

## Referências

- [AWS Lambda Permissions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html)
- [ECS Task IAM Roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- Repositório Lambda: `handslab-trya-chat-agents`
- Repositório Backend: `handslab-trya-backend`
