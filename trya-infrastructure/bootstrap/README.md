# Bootstrap Terraform State Backend
# Rodar UMA VEZ por conta AWS antes de usar Terragrunt

## Uso

Para cada conta que você vai provisionar:

```bash
cd bootstrap

# Admin Trya Dev
terraform init
terraform apply -var="account_name=admin-trya-dev"

# Admin Trya HML
terraform apply -var="account_name=admin-trya-hml"

# Admin Trya Prod
terraform apply -var="account_name=admin-trya-prod"

# Trya SaaS Dev
terraform apply -var="account_name=trya-saas-dev"

# Trya SaaS HML
terraform apply -var="account_name=trya-saas-hml"

# Grupo Trigo HML
terraform apply -var="account_name=grupo-trigo-hml"

# Grupo Trigo Prod
terraform apply -var="account_name=grupo-trigo-prod"

# Management (Organizations/Route53)
terraform apply -var="account_name=trya-management"
```

## O que cria

- **S3 Bucket**: `tfstate-{account_name}`
  - Versionamento habilitado
  - Encryption AES256
  - Block public access

- **DynamoDB Table**: `terraform-locks`
  - Pay-per-request billing
  - Para lock distribuído

## Importante

Configure o AWS profile correto antes de rodar:

```bash
export AWS_PROFILE=admin-trya-dev
terraform apply -var="account_name=admin-trya-dev"
```

Ou use `--profile`:

```bash
terraform apply -var="account_name=admin-trya-dev" \
  -var="region=us-east-1"
```
