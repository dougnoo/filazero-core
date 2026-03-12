**Depois (Correto)**:
```hcl
dependency "prod_alb" {
  config_path = "../../../accounts/admin-trya-prod/stack/backend/alb"  # ✅ Caminho correto
}

dependency "hml_alb" {
  config_path = "../../../accounts/admin-trya-hml/stack/backend/alb"   # ✅ Adicionado HML
}

dependency "dev_alb" {
  config_path = "../../../accounts/admin-trya-dev/stack/backend/alb"   # ✅ Adicionado DEV
}
```

### 2. Domínios Padronizados

**Antes**: Misturava `trya.com.br` e `trya.ai` inconsistentemente

**Depois**: Estrutura hierárquica clara baseada em `trya.ai`:
- **Produção**: `admin.trya.ai` e `api.admin.trya.ai`
- **Homologação**: `hml.admin.trya.ai` e `hml-api.admin.trya.ai`
- **Desenvolvimento**: `dev.admin.trya.ai` e `dev-api.admin.trya.ai`
- **Principal**: `trya.ai` (apex) → redireciona para produção

### 3. Estrutura Multi-Ambiente

Agora suporta todos os três ambientes:
- **DEV**: Aponta para ALB da conta `admin-trya-dev`
- **HML**: Aponta para ALB da conta `admin-trya-hml`
- **PROD**: Aponta para ALB da conta `admin-trya-prod`

### 4. Configurações de Email Profissionais

**Antes**: MX records genéricos (`mx1.example.com`)

**Depois**: Configuração completa do Google Workspace:
- MX records do Gmail
- SPF record para Google
- DMARC policy para segurança
- Placeholder para Google Site Verification

### 5. Redirecionamentos Lógicos

- `trya.ai` (apex) → `admin.trya.ai` (produção)
- `www.trya.ai` → `admin.trya.ai` (produção)
- `api.trya.ai` → `api.admin.trya.ai` (API produção)

## Estrutura de Domínios

```
trya.ai (apex)                    → admin.trya.ai (PROD)
├── www.trya.ai                   → admin.trya.ai (PROD)
├── api.trya.ai                   → api.admin.trya.ai (PROD)
├── admin.trya.ai                 → ALB Produção
├── api.admin.trya.ai             → ALB Produção
├── hml.admin.trya.ai             → ALB Homologação
├── hml-api.admin.trya.ai         → ALB Homologação
├── dev.admin.trya.ai             → ALB Desenvolvimento
└── dev-api.admin.trya.ai         → ALB Desenvolvimento
```

## Dependências Cross-Account

O arquivo agora referencia corretamente os ALBs de cada ambiente:

1. **admin-trya-prod/stack/backend/alb** → Produção
2. **admin-trya-hml/stack/backend/alb** → Homologação  
3. **admin-trya-dev/stack/backend/alb** → Desenvolvimento

## Mock Outputs

Mantidos os `mock_outputs` para permitir planejamento mesmo quando as dependências não estão deployadas:

```hcl
mock_outputs = {
  dns_name = "admin-trya-prod-alb-123456789.us-east-1.elb.amazonaws.com"
  zone_id  = "Z35SXDOTRQ7X7K"  # Zone ID padrão para ALB us-east-1
}
```

## Próximos Passos

### 1. Implementar CloudFront (Opcional)

Se quiser adicionar CloudFront para cache/CDN:

```bash
# Criar estrutura CDN
mkdir -p accounts/admin-trya-prod/stack/cdn/cloudfront
mkdir -p accounts/admin-trya-hml/stack/cdn/cloudfront
mkdir -p accounts/admin-trya-dev/stack/cdn/cloudfront
```

### 2. Configurar Cross-Account IAM

Para permitir que a conta Management leia outputs das outras contas:

```hcl
# Em cada conta (dev/hml/prod), criar role:
resource "aws_iam_role" "route53_cross_account" {
  name = "Route53CrossAccountAccess"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        AWS = "arn:aws:iam::770922560928:root"  # Management account
      }
      Action = "sts:AssumeRole"
    }]
  })
}
```

### 3. Atualizar Google Site Verification

Substituir o placeholder pelo valor real:

```hcl
{
  name = "trya.ai"
  type = "TXT"
  ttl  = 300
  records = [
    "google-site-verification=SEU_CODIGO_REAL_AQUI"
  ]
}
```

### 4. Configurar Health Checks (Opcional)

Para monitoramento avançado:

```hcl
inputs = {
  # ... outros inputs
  
  health_checks = [
    {
      fqdn = "api.admin.trya.ai"
      port = 443
      type = "HTTPS"
      path = "/health"
    }
  ]
}
```

## Deploy

```bash
cd management/route53/records
terragrunt plan
terragrunt apply
```

## Verificação

Após o deploy, verificar a resolução DNS:

```bash
# Verificar registros
dig admin.trya.ai
dig api.admin.trya.ai
dig hml.admin.trya.ai
dig dev.admin.trya.ai

# Verificar redirecionamentos
dig trya.ai
dig www.trya.ai
dig api.trya.ai

# Verificar MX records
dig MX trya.ai

# Verificar TXT records
dig TXT trya.ai
```