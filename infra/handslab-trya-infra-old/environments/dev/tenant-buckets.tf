# =============================================================================
# Tenant Assets Buckets - DEV Environment
# =============================================================================
# Gerenciamento centralizado de buckets S3 para assets de tenants.
#
# Nomenclatura padrão: {tenant}-assets-{environment}
#
# NOTA: Este arquivo gerencia os buckets de tenant via Terraform.
# Para migrar buckets existentes, use terraform import.
#
# Exemplo de import:
#   terraform import 'module.tenant_assets["grupotrigo"].aws_s3_bucket.tenant_assets' grupotrigo-assets
# =============================================================================

locals {
  # Configuração de tenants para este ambiente
  # NOTA: Apenas Trya e Grupo Trigo são tenants ativos
  tenant_config = {
    trya = {
      name           = "trya"
      dynamodb_table = "tenant-1"
      domain         = "dev-app.trya.ai"
    }
    grupotrigo = {
      name           = "grupotrigo"
      dynamodb_table = "grupotrigo"
      domain         = "dev-app-grupotrigo.trya.ai"
    }
  }
}

# =============================================================================
# Módulo de Buckets de Tenant
# =============================================================================

module "tenant_assets" {
  source   = "../../modules/tenant-assets"
  for_each = local.tenant_config

  providers = {
    aws = aws.us_east_1
  }

  tenant_name  = each.value.name
  environment  = "dev"
  region       = "us-east-1"

  enable_versioning  = true
  enable_public_read = true

  cors_allowed_origins = [
    "https://${each.value.domain}",
    "https://dev-app.trya.ai",
    "https://dev-api.trya.ai",
    "http://localhost:3000"
  ]

  tags = {
    Tenant = each.value.name
    Domain = each.value.domain
  }
}

# =============================================================================
# IAM Policies para Acesso aos Buckets
# =============================================================================

module "tenant_bucket_access" {
  source = "../../modules/tenant-bucket-access"

  providers = {
    aws = aws.us_east_1
  }

  environment  = "dev"
  tenant_names = keys(local.tenant_config)

  create_write_policy = true

  # Roles que precisam de acesso de leitura aos buckets de tenant
  # Adicione aqui os nomes das roles de ECS tasks
  read_access_role_names = [
    # "trya-backend-dev-ecs-task-role",
    # "trya-platform-backend-dev-service-ecs-task-role",
  ]

  # Roles que precisam de acesso de escrita aos buckets de tenant
  write_access_role_names = [
    # "trya-backend-dev-ecs-task-role",
  ]
}

# =============================================================================
# Outputs
# =============================================================================

output "tenant_asset_buckets" {
  description = "Mapa de buckets de assets por tenant"
  value = {
    for k, v in module.tenant_assets : k => {
      bucket_name = v.bucket_name
      bucket_arn  = v.bucket_arn
      bucket_url  = v.bucket_url
    }
  }
}

output "tenant_bucket_names" {
  description = "Lista de nomes de buckets de tenant"
  value       = [for k, v in module.tenant_assets : v.bucket_name]
}

output "tenant_bucket_policies" {
  description = "Políticas IAM para acesso aos buckets de tenant"
  value = {
    read_policy_arn  = module.tenant_bucket_access.read_policy_arn
    write_policy_arn = module.tenant_bucket_access.write_policy_arn
  }
}
