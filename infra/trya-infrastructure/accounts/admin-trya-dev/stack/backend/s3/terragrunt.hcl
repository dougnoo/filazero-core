# =============================================================================
# S3 Bucket for Backend Storage
# =============================================================================

terraform {
  source = "../../../../../modules/storage/s3"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path = "../../../../../_envcommon/backend.hcl"
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}

# Dependência do ECS para obter a task role ARN
dependency "ecs" {
  config_path = "../ecs"
  
  mock_outputs = {
    task_role_arn = "arn:aws:iam::751426053736:role/admin-trya-dev-backend-service-ecs-task-role"
  }
}

inputs = {
  project_name = "trya"
  environment = "dev"
  bucket_name = "${local.account_vars.locals.account_name}-backend-storage"
  
  # CORS para permitir acesso da aplicação backend
  cors_allowed_origins = [
    "https://dev.admin.trya.ai",
    "https://dev.api.admin.trya.ai",
    "http://localhost:3000"
  ]
  
  # Criptografia
  kms_key_arn = null  # Usar AES256 padrão
  
  # Sem logging bucket (não necessário para backend)
  logging_bucket = null
  
  # Sem notificações por enquanto
  enable_notifications = false
  sns_topic_arn = null
  
  # Sem CloudFront OAI (backend não usa CloudFront)
  cloudfront_oai_iam_arn = null
  
  # Políticas adicionais para permitir acesso do ECS
  additional_policy_statements = [
    {
      Sid    = "AllowECSTaskAccess"
      Effect = "Allow"
      Principal = {
        AWS = dependency.ecs.outputs.task_role_arn
      }
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ]
      Resource = [
        "arn:aws:s3:::${local.account_vars.locals.account_name}-backend-storage",
        "arn:aws:s3:::${local.account_vars.locals.account_name}-backend-storage/*"
      ]
    }
  ]
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-backend-storage"
    Service     = "backend"
    Purpose     = "application-storage"
    Environment = "dev"
  }
}