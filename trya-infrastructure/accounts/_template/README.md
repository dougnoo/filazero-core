# Template para Nova Conta

## Passos para Criar Nova Conta

### 1. Copiar Template

```bash
cd trya-infrastructure/accounts
cp -r _template novo-cliente-hml
cd novo-cliente-hml
```

### 2. Configurar account.hcl

```bash
cp account.hcl.example account.hcl
vim account.hcl
```

Preencher:
- `account_id` - AWS Account ID
- `account_name` - Nome da conta (ex: cliente-x-hml)
- `domain` - Domínio principal
- `api_domain` - Domínio da API
- `tier` - Tier do cliente (standard, enterprise, premium)

### 3. Configurar region.hcl

```bash
cat > region.hcl << 'EOF'
locals {
  aws_region = "sa-east-1"  # ou us-east-1
}
EOF
```

### 4. Copiar Stack

```bash
cp -r ../admin-trya-dev/stack .
```

### 5. Configurar AWS Profile

```bash
aws configure --profile novo-cliente-hml
```

### 6. Criar State Backend

```bash
aws s3 mb s3://tfstate-novo-cliente-hml --region sa-east-1 --profile novo-cliente-hml

aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region sa-east-1 \
  --profile novo-cliente-hml
```

### 7. Deploy

```bash
cd stack
terragrunt run-all plan
terragrunt run-all apply
```

## Estrutura Esperada

```
novo-cliente-hml/
├── account.hcl
├── region.hcl
├── README.md
└── stack/
    ├── networking/
    ├── data/
    ├── backend/
    ├── platform/
    ├── frontend/
    ├── chat-agents/
    └── shared/
```

## Checklist

- [ ] Account ID configurado
- [ ] AWS Profile configurado
- [ ] State backend criado (S3 + DynamoDB)
- [ ] Certificado ACM criado
- [ ] DNS configurado no Route53
- [ ] Secrets criados no Secrets Manager
- [ ] Cognito User Pool criado
- [ ] SES configurado
- [ ] Deploy testado
