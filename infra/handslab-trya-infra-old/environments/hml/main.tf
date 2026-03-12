# Trya Platform - HML Environment
# This file orchestrates ALL infrastructure stacks for HML environment
# Region: us-east-1 (centralizado)

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "trya-terraform-state-us"
    key            = "hml/main.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "trya-terraform-locks-us"
  }
}

# Provider principal - us-east-1
provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = "hml"
      Project     = "trya"
      ManagedBy   = "terraform"
    }
  }
}

# Alias para compatibilidade com módulos existentes
provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"

  default_tags {
    tags = {
      Environment = "hml"
      Project     = "trya"
      ManagedBy   = "terraform"
    }
  }
}

locals {
  environment = "hml"
  project     = "trya"
  
  # Existing resource IDs (already provisioned)
  cognito_user_pool_id = "us-east-1_z0ZIFLfwm"
  vpc_id               = "vpc-0a1b2c3d4e5f6g7h8" # TODO: Get actual VPC ID or use DEV VPC
  
  # Tenants configuration
  # NOTA: bucket_name agora segue o padrão {tenant}-assets-{env}
  # Os buckets são gerenciados em tenant-buckets.tf
  # Apenas Trya e Grupo Trigo são tenants ativos
  tenants = {
    trya = {
      table_name    = "tenant-1-hml"
      bucket_name   = "trya-assets-hml"           # Novo padrão
      legacy_bucket = "broker-tenant-1-hml"        # Bucket legado (para migração)
      domain        = "hml-app.trya.ai"
    }
    grupotrigo = {
      table_name    = "grupotrigo-hml"
      bucket_name   = "grupotrigo-assets-hml"     # Novo padrão
      legacy_bucket = "grupotrigo-assets-hml"      # Bucket legado (para migração)
      domain        = "hml-app-grupotrigo.trya.ai"
    }
  }
}

# ==============================================================================
# STACK 1: Network (VPC, Subnets, NAT Gateway)
# ==============================================================================
# Use existing network stack or share with DEV
# cd ../stacks/network && terraform workspace select hml && terraform apply

# ==============================================================================
# STACK 2: Backend (Main API)
# ==============================================================================
# Provisions: ECR, ECS, ALB, Aurora, Secrets
# cd ../stacks/backend && terraform workspace select hml && terraform apply

# ==============================================================================
# STACK 3: Platform Backend
# ==============================================================================
# Provisions: ECS Service, ALB Target Group
# cd ../stacks/platform && terraform workspace select hml && terraform apply

# ==============================================================================
# STACK 4: Chat Backend
# ==============================================================================
# Provisions: ECS Service, DynamoDB, ALB Target Group
# cd ../stacks/chat && terraform workspace select hml && terraform apply

# ==============================================================================
# STACK 5: Frontend
# ==============================================================================
# Provisions: ECS (sa-east-1), CloudFront, ACM
# cd ../stacks/frontend && terraform workspace select hml && terraform apply

# ==============================================================================
# Data Sources - Existing Resources
# ==============================================================================

data "aws_cognito_user_pool" "main" {
  provider     = aws.us_east_1
  user_pool_id = local.cognito_user_pool_id
}

data "aws_dynamodb_table" "tenants" {
  provider = aws.us_east_1
  for_each = local.tenants
  name     = each.value.table_name
}

# NOTA: Buckets de tenant agora são gerenciados pelo módulo tenant_assets
# em tenant-buckets.tf. Este data source é mantido para referência a
# buckets legados durante a migração.
#
# Após migração completa, remover este bloco e usar:
#   module.tenant_assets["grupotrigo"].bucket_name
#
data "aws_s3_bucket" "tenant_assets_legacy" {
  provider = aws.us_east_1
  for_each = {
    for k, v in local.tenants : k => v
    if can(v.legacy_bucket) && v.legacy_bucket != ""
  }
  bucket   = each.value.legacy_bucket
}

# ==============================================================================
# Outputs
# ==============================================================================

output "environment" {
  value = local.environment
}

output "cognito_user_pool_id" {
  value = data.aws_cognito_user_pool.main.id
}

output "tenant_tables" {
  value = {
    for k, v in data.aws_dynamodb_table.tenants : k => v.name
  }
}

output "tenant_buckets_legacy" {
  description = "Buckets legados (para migração)"
  value = {
    for k, v in data.aws_s3_bucket.tenant_assets_legacy : k => v.bucket
  }
}

# Buckets novos são expostos em tenant-buckets.tf via output tenant_asset_buckets

output "stack_execution_order" {
  value = [
    "1. network",
    "2. backend",
    "3. platform",
    "4. chat",
    "5. frontend"
  ]
  description = "Order to execute stacks"
}

output "notes" {
  value = "HML Aurora cluster needs to be created. Currently using DEV Aurora."
}
