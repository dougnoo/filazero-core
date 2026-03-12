# Setup Multi-Ambiente: Dev + HML

Este documento descreve como configurar e manter dois ambientes (Dev e HML) em contas AWS separadas.

## Arquitetura de Contas

```
Conta Dev (123456789012)          Conta HML (987654321098)
+------------------------+        +------------------------+
| VPC Dev (10.0.0.0/16)  |        | VPC HML (10.1.0.0/16)  |
| ECS Clusters           |        | ECS Clusters           |
| RDS Dev                |        | RDS HML                |
| S3 Buckets             |        | S3 Buckets             |
| State: trya-terraform- |        | State: trya-terraform- |
|        state           |        |        state-hml       |
+------------------------+        +------------------------+
           |                                 |
           +--------+   +--------------------+
                    |   |
            +-------v---v--------+
            | Conta DNS (Dev)    |
            | Route53 Zone:      |
            | trya.com.br        |
            | - dev.trya.com.br  |
            | - api-dev...       |
            | - hml.trya.com.br  |
            | - api-hml...       |
            +--------------------+
```

## 1. Bootstrap da Conta HML

### Pre-requisitos

- AWS CLI configurado
- Terraform >= 1.8.0
- Credenciais da conta HML

### Executar Bootstrap

```bash
# Configure credenciais da conta HML
export AWS_PROFILE=hml
# ou
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx

# Execute o script de bootstrap
cd handslab-trya-infra
chmod +x scripts/bootstrap-hml-account.sh
./scripts/bootstrap-hml-account.sh
```

O script cria:
- S3 bucket `trya-terraform-state-hml` (versionado, criptografado)
- DynamoDB table `trya-terraform-locks-hml`
- IAM Role `TryaCiCdRole-HML` com policies para deploy

### (Opcional) OIDC com Bitbucket

Para usar OIDC ao inves de access keys:

```bash
BITBUCKET_WORKSPACE_UUID=seu-uuid ./scripts/bootstrap-hml-account.sh
```

## 2. Provisionar Infraestrutura HML

```bash
# Com credenciais da conta HML
cd handslab-trya-infra

# Inicializar backend
terraform init -backend-config=environments/hml/backend.conf

# Revisar plano
terraform plan -var-file=environments/hml/terraform.tfvars

# Aplicar
terraform apply -var-file=environments/hml/terraform.tfvars
```

## 3. Configurar DNS (Conta Dev/DNS)

Como a hosted zone `trya.com.br` fica na conta Dev, os registros DNS para HML devem ser criados la.

### Registros necessarios

| Tipo | Nome | Destino |
|------|------|---------|
| A (Alias) | hml.trya.com.br | CloudFront Distribution do HML |
| A (Alias) | api-hml.trya.com.br | ALB do HML |

### Via Terraform (na conta Dev)

```hcl
# Adicionar ao main.tf do handslab-trya-infra (conta Dev)
resource "aws_route53_record" "hml_frontend" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "hml.trya.com.br"
  type    = "A"

  alias {
    name                   = "cloudfront-distribution-hml.cloudfront.net"  # Substituir
    zone_id                = "Z2FDTNDATAQYW2"  # CloudFront hosted zone ID (fixo)
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "hml_backend" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api-hml.trya.com.br"
  type    = "A"

  alias {
    name                   = "alb-hml-123456789.sa-east-1.elb.amazonaws.com"  # Substituir
    zone_id                = "Z2P70J7HTTTPLU"  # ALB sa-east-1 hosted zone ID
    evaluate_target_health = true
  }
}
```

### Via Console/CLI (mais rapido)

```bash
# Na conta Dev/DNS
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "hml.trya.com.br",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "cloudfront-hml.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

## 4. Certificados ACM

### Para ALB (sa-east-1, conta HML)

```bash
# Na conta HML
aws acm request-certificate \
  --domain-name "api-hml.trya.com.br" \
  --validation-method DNS \
  --region sa-east-1
```

### Para CloudFront (us-east-1, conta HML)

```bash
# Na conta HML
aws acm request-certificate \
  --domain-name "hml.trya.com.br" \
  --validation-method DNS \
  --region us-east-1
```

### Validacao DNS

Os CNAMEs de validacao devem ser criados na hosted zone `trya.com.br` (conta Dev/DNS).

## 5. Configurar Bitbucket Pipelines

### Variaveis por Deployment Environment

No Bitbucket, configure as variaveis para cada deployment:

#### Deployment: Staging (HML)

| Variavel | Valor |
|----------|-------|
| AWS_ACCESS_KEY_ID | (da conta HML) |
| AWS_SECRET_ACCESS_KEY | (da conta HML) |
| AWS_REGION | sa-east-1 |
| AWS_ECR_REGISTRY | 987654321098.dkr.ecr.sa-east-1.amazonaws.com |
| ECS_CLUSTER | trya-hml-cluster |
| ECS_SERVICE | trya-hml-service |
| CLOUDFRONT_DISTRIBUTION_ID_STAGING | EXXXXXXXXXXXXX |

#### Deployment: Develop (Dev)

| Variavel | Valor |
|----------|-------|
| AWS_ACCESS_KEY_ID | (da conta Dev) |
| AWS_SECRET_ACCESS_KEY | (da conta Dev) |
| AWS_REGION | sa-east-1 |
| AWS_ECR_REGISTRY | 123456789012.dkr.ecr.sa-east-1.amazonaws.com |
| ... | ... |

## 6. Checklist de Validacao

- [ ] Bootstrap da conta HML executado
- [ ] Terraform state bucket criado em HML
- [ ] Infraestrutura provisionada em HML (VPC, ECS, RDS, etc)
- [ ] Certificados ACM solicitados e validados
- [ ] Registros DNS criados na conta Dev/DNS
- [ ] Variaveis do Bitbucket configuradas para Staging
- [ ] Deploy de teste no branch staging
- [ ] hml.trya.com.br acessivel
- [ ] api-hml.trya.com.br respondendo healthcheck
- [ ] Logs aparecendo no CloudWatch da conta HML

## Troubleshooting

### Erro: Access Denied no Terraform

Verifique se esta usando as credenciais da conta correta:
```bash
aws sts get-caller-identity
```

### Erro: Bucket nao existe

Execute o bootstrap primeiro:
```bash
./scripts/bootstrap-hml-account.sh
```

### Certificado ACM pendente

Verifique se os CNAMEs de validacao foram criados na zona DNS correta.

### ALB nao responde

Verifique:
1. Security Groups permitem trafego na porta 443/80
2. Target Group tem targets saudaveis
3. Certificado ACM esta validado e associado ao listener
