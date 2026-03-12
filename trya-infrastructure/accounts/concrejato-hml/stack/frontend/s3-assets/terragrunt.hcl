# =============================================================================
# S3 Bucket for Frontend Assets
# =============================================================================

terraform {
  source = "../../../../../modules/storage/s3"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path = "../../../../../_envcommon/frontend.hcl"
}

dependency "s3_logs" {
  config_path = "../s3-logs"
  
  mock_outputs = {
    bucket_id = "admin-trya-dev-frontend-cloudfront-logs"
  }
}

dependency "ecs_backend" {
  config_path = "../../backend/ecs"
  
  mock_outputs = {
    task_role_arn = "arn:aws:iam::751426053736:role/admin-trya-dev-backend-service-ecs-task-role"
  }
}

# CloudFront e S3 Assets são independentes - sem dependência necessária
# dependency "cloudfront" {
#   config_path = "../cloudfront"
#   
#   mock_outputs = {
#     origin_access_identity_iam_arn = "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ABCDEFG1234567"
#   }
# }

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
  bucket_name = "${local.account_vars.locals.account_name}-frontend-assets"
  
  # CORS para permitir acesso do frontend
  cors_allowed_origins = local.assets_config.cors_origins
  
  # Criptografia
  kms_key_arn = null  # Usar AES256 padrão
  
  # Logs no bucket de logs do CloudFront
  logging_bucket = dependency.s3_logs.outputs.bucket_id
  
  # Notificações (apenas prod)
  enable_notifications = local.assets_config.enable_notifications
  sns_topic_arn = null  # TODO: Adicionar SNS topic se necessário
  
  # S3 Assets é independente - sem integração com CloudFront OAI
  cloudfront_oai_iam_arn = null
  
  # Políticas adicionais - Permitir acesso do ECS Backend
  additional_policy_statements = [
    {
      Sid       = "AllowECSBackendAccess"
      Effect    = "Allow"
      Principal = "*"
      Action    = [
        "s3:GetObject",
        "s3:ListBucket"
      ]
      Resource = [
        "arn:aws:s3:::${local.account_vars.locals.account_name}-frontend-assets",
        "arn:aws:s3:::${local.account_vars.locals.account_name}-frontend-assets/*"
      ]
    }
  ]
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-frontend-assets"
    Service     = "frontend"
    Purpose     = "static-assets"
    Environment = local.environment
  }
}