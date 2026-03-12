# =============================================================================
# S3 Bucket for Frontend Assets
# =============================================================================

terraform {
  source = "../../../../../modules/storage/s3"
}

include "root" {
  path = find_in_parent_folders()
}


dependency "ecs_platform" {
  config_path = "../../platform/ecs"
  
  mock_outputs = {
    task_role_arn = "arn:aws:iam::751426053736:role/admin-trya-dev-platform-service-ecs-task-role"
  }
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Configurações baseadas no environment
  assets_config = {
    # CORS origins baseados no environment
    cors_origins = ["*"]  # Permitir todas as origens por enquanto
    
    # Notificações apenas em produção
    enable_notifications = local.environment == "prod"
  }
}

inputs = {
  project_name = "trya"
  environment = local.environment
  bucket_name = "${local.account_vars.locals.account_name}-platform-storage"
  
  # CORS para permitir acesso do frontend
  cors_allowed_origins = local.assets_config.cors_origins
  
  # Criptografia
  kms_key_arn = null  # Usar AES256 padrão
  
  
  # Notificações (apenas prod)
  enable_notifications = local.assets_config.enable_notifications
  sns_topic_arn = null  # TODO: Adicionar SNS topic se necessário
  
  # S3 Assets é independente - sem integração com CloudFront OAI
  cloudfront_oai_iam_arn = null
  
  # Políticas adicionais - Permitir acesso do ECS Platform
  additional_policy_statements = [
    {
      Sid       = "AllowECSPlatformAccess"
      Effect    = "Allow"
      Principal = "*"
      Action    = [
        "s3:GetObject",
        "s3:ListBucket"
      ]
      Resource = [
        "arn:aws:s3:::${local.account_vars.locals.account_name}-platform-storage",
        "arn:aws:s3:::${local.account_vars.locals.account_name}-platform-storage/*"
      ]
    }
  ]
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-platform-storage"
    Service     = "frontend"
    Purpose     = "static-assets"
    Environment = local.environment
  }
}