# =============================================================================
# S3 Bucket for Knowledge Base
# =============================================================================

terraform {
  source = "../../../../../modules/storage/s3"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta
  account_name = local.account_vars.locals.account_name
  name_parts   = split("-", local.account_name)
  environment  = element(local.name_parts, length(local.name_parts) - 1)
}

inputs = {
  bucket_name = "${local.account_vars.locals.account_name}-triagem-ia"
  project_name = "trya"
  # Configurações de versionamento
  enable_versioning = false
  
  # Configurações de segurança
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
  
  # Server-side encryption
  enable_encryption = true
  kms_key_arn       = null  # Usar chave padrão do S3
  
  # CORS para upload de documentos
  cors_rules = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
      allowed_origins = ["*"]  # TODO: Restringir para domínios específicos
      expose_headers  = ["ETag"]
      max_age_seconds = 3000
    }
  ]
  
  # Notification configuration (será usado pelo Bedrock Knowledge Base)
  notification_configuration = {
    lambda_configurations = []
    queue_configurations  = []
    topic_configurations  = []
  }
  
  # Políticas adicionais para Bedrock Knowledge Base
  additional_policy_statements = [
    {
      Sid    = "AllowBedrockKnowledgeBaseAccess"
      Effect = "Allow"
      Principal = {
        Service = "bedrock.amazonaws.com"
      }
      Action = [
        "s3:GetObject",
        "s3:ListBucket"
      ]
      Resource = [
        "arn:aws:s3:::${local.account_vars.locals.account_name}-triagem-ia",
        "arn:aws:s3:::${local.account_vars.locals.account_name}-triagem-ia/*"
      ]
    }
  ]
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-triagem-ia"
    Service     = "chat-agents"
    project_name = "trya"
    Purpose     = "knowledge-base-storage"
    Environment = local.environment
  }
}
