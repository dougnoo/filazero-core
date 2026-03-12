# =============================================================================
# Trya Chat Backend - Ambiente HML (Staging)
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
project_name = "trya-chat-backend"

# ==============================================================================
# Networking - CONTA HML
# ==============================================================================
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
# ECS Configuration
# ==============================================================================
task_cpu    = 512
task_memory = 1024

desired_count            = 2
enable_autoscaling       = true
autoscaling_min_capacity = 1
autoscaling_max_capacity = 4

# ==============================================================================
# Application Configuration
# ==============================================================================
cors_origin      = "https://hml.trya.ai"
bedrock_model_id = "anthropic.claude-3-5-sonnet-20240620-v1:0"
bedrock_region   = "us-east-1"

# ==============================================================================
# Tags
# ==============================================================================
tags = {
  Team        = "Chat"
  CostCenter  = "Homologation"
  Application = "Trya Chat Backend"
  Environment = "hml"
}
