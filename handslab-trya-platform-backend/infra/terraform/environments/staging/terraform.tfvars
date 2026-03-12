# =============================================================================
# Trya Platform Backend - Ambiente HML (Staging)
# =============================================================================
# IMPORTANTE: Este arquivo configura o ambiente HML em conta AWS SEPARADA
#
# Workflow:
# 1. Execute bootstrap na conta HML: handslab-trya-infra/scripts/bootstrap-hml-account.sh
# 2. Provisione VPC/Network na conta HML primeiro (via handslab-trya-infra)
# 3. Atualize os IDs abaixo com valores da conta HML
# 4. terraform init -backend-config=backend-hml.conf
# 5. terraform plan / apply
# =============================================================================

# ==============================================================================
# General Configuration
# ==============================================================================
aws_region   = "sa-east-1"
environment  = "staging"  # Mapeia para HML
project_name = "trya-platform-backend"

# ==============================================================================
# Networking - CONTA HML
# ==============================================================================
# ATUALIZE estes valores apos provisionar a VPC na conta HML
vpc_id = "vpc-0804488640ddc9d96"  # VPC HML

public_subnet_ids = [
  "subnet-04a6861cb8daabc6d",  # sa-east-1a
  "subnet-0a02c4019ca1e0024",  # sa-east-1b
  "subnet-0459958fbc985ca38"   # sa-east-1c
]

private_subnet_ids = [
  "subnet-0e2f6aa3d8bb2e023",  # sa-east-1a
  "subnet-0a03b028c6e984d8e",  # sa-east-1b
  "subnet-0ec5f3cd8957d2226"   # sa-east-1c
]

# ==============================================================================
# ALB Configuration
# ==============================================================================
enable_https          = true
enable_https_redirect = true
certificate_arn       = "arn:aws:acm:sa-east-1:416684166863:certificate/cdcebbd5-2d71-4605-ace0-572c6f3dfb58"  # trya.ai

# ==============================================================================
# WAF Configuration
# ==============================================================================
waf_rate_limit = 2000

# ==============================================================================
# ECS Configuration
# ==============================================================================
task_cpu    = 512
task_memory = 1024

desired_count            = 2
enable_autoscaling       = true
autoscaling_min_capacity = 1
autoscaling_max_capacity = 4

# ==============================================================================
# Aurora Configuration
# ==============================================================================
use_aurora          = true
aurora_min_capacity = 0.5
aurora_max_capacity = 4
aurora_reader_count = 0  # Sem reader em HML para economizar

# ==============================================================================
# Database Configuration
# ==============================================================================
db_username = "postgres"
db_password = "SUBSTITUIR_POR_SENHA_SEGURA"  # Usar Secrets Manager em producao
db_name     = "trya"
db_schema   = "platform_hml"
db_host     = ""  # Sera preenchido pelo Aurora se use_aurora=true

use_secrets_manager    = false
db_password_secret_arn = ""

# ==============================================================================
# Application Configuration
# ==============================================================================
cors_origin          = "https://hml.trya.ai"
frontend_url         = "https://hml.trya.ai/login"
jwt_secret           = "SUBSTITUIR_POR_JWT_SECRET_SEGURO"  # Gerar novo para HML
jwt_expiration       = "3600"
notification_service = "ses"

# ==============================================================================
# AWS Cognito - Pool compartilhado trigo-hml-v3 em us-east-1
# ==============================================================================
# NOTA: O Cognito Pool está em us-east-1, não sa-east-1
# Pool: trigo-hml-v3 (us-east-1_ydSRKIYWa)
# Client: trigo-hml-app (5c5cbaktsbscjf5dbujthbneor)
cognito_user_pool_id      = "us-east-1_ydSRKIYWa"
cognito_client_id         = "5c5cbaktsbscjf5dbujthbneor"
cognito_client_secret     = ""
cognito_client_secret_arn = ""

# ==============================================================================
# AWS S3
# ==============================================================================
s3_bucket_name = "trya-platform-assets-hml"

# ==============================================================================
# AWS SES
# ==============================================================================
ses_from_email = "noreply@trya.ai"
ses_from_name  = "Trya Health"

# ==============================================================================
# Tags
# ==============================================================================
tags = {
  Team        = "Platform"
  CostCenter  = "Homologation"
  Application = "Trya Platform"
  Environment = "hml"
}
