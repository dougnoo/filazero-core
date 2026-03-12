# =============================================================================
# Platform Files Bucket - DEV Environment
# =============================================================================
# Bucket S3 para arquivos gerados pela plataforma:
# - Fotos de perfil de usuários (profile-pictures/)
# - Outros uploads de usuário
#
# IMPORTANTE: Este bucket é compartilhado por todos os serviços da plataforma.
# Diferentes prefixos têm diferentes políticas de acesso:
# - profile-pictures/: acesso público de leitura (exibição no frontend)
# - Outros prefixos: acesso privado (apenas via presigned URLs)
#
# Para importar bucket existente:
#   terraform import 'module.platform_files.aws_s3_bucket.platform_files' trya-platform-files
# =============================================================================

module "platform_files" {
  source = "../../modules/platform-files"

  providers = {
    aws = aws.us_east_1
  }

  bucket_name = "trya-platform-files"
  environment = "dev"
  region      = "us-east-1"

  enable_versioning = true

  # Prefixos com acesso público de leitura
  public_read_prefixes = [
    "profile-pictures/"
  ]

  cors_allowed_origins = [
    "https://dev-app.trya.ai",
    "https://dev-app-grupotrigo.trya.ai",
    "https://dev-api.trya.ai",
    "http://localhost:3000",
    "http://localhost:3001"
  ]

  # Roles de ECS que precisam de acesso ao bucket
  # Descomentar quando as roles existirem
  # attach_policy_to_roles = [
  #   "trya-platform-backend-dev-ecs-task-role"
  # ]

  tags = {
    Service = "platform-backend"
    Purpose = "user-files"
  }
}

# =============================================================================
# Outputs
# =============================================================================

output "platform_files_bucket" {
  description = "Bucket de arquivos da plataforma"
  value = {
    bucket_name = module.platform_files.bucket_name
    bucket_arn  = module.platform_files.bucket_arn
    bucket_url  = module.platform_files.bucket_url
  }
}

output "platform_files_policy_arn" {
  description = "ARN da política IAM para acesso ao bucket"
  value       = module.platform_files.policy_arn
}
